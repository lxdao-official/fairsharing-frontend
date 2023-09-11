'use client';

import process from 'process';

import { Box, Button, Container, Step, StepLabel, Stepper, Typography } from '@mui/material';
import { ReactNode, useRef, useState } from 'react';

import { Img3Provider } from '@lxdao/img3';

import { ethers } from 'ethers';

import { TransactionResponse } from '@ethersproject/abstract-provider';

import { useAccount, useContractRead } from 'wagmi';

import { useRouter } from 'next/navigation';

import StepStart from '@/components/createProject/step/start';
import StepStrategy, { StepStrategyRef } from '@/components/createProject/step/strategy';
import StepProfile, { StepProfileRef } from '@/components/createProject/step/profile';
import StepContributor, { StepContributorRef } from '@/components/createProject/step/contributor';
import { defaultGateways } from '@/constant/img3';

import { useEthersSigner } from '@/common/ether';

import { createProject, CreateProjectParams, getProjectList } from '@/services/project';

import { closeGlobalLoading, openGlobalLoading, showToast } from '@/store/utils';

import { getUserInfo } from '@/services/user';
import { setUserProjectList } from '@/store/project';

import { ProjectRegisterABI } from '@/constant/eas';

const steps = [
	{
		label: 'Getting started',
	},
	{
		label: 'Profile',
	},
	{
		label: 'Strategy',
	},
	{
		label: 'Contributors',
	},
];

export default function Page() {
	const router = useRouter();
	const signer = useEthersSigner();
	const { address: myAddress } = useAccount();

	const [activeStep, setActiveStep] = useState(0);

	const stepProfileRef = useRef<StepProfileRef | null>(null);
	const stepStrategyRef = useRef<StepStrategyRef | null>(null);
	const stepContributorRef = useRef<StepContributorRef | null>(null);
	const handleGetFormData = () => {
		const profileFormData = stepProfileRef.current?.getFormData();
		const strategyFormData = stepStrategyRef.current?.getFormData();
		const contributorFormData = stepContributorRef.current?.getFormData();
		const data = { profileFormData, strategyFormData, contributorFormData };
		console.log('create project Data:', data);
	};

	const handleCreateProject = async () => {
		const profileFormData = (stepProfileRef.current as StepProfileRef).getFormData();
		const strategyFormData = (stepStrategyRef.current as StepStrategyRef).getFormData();
		const contributorFormData = (
			stepContributorRef.current as StepContributorRef
		).getFormData();
		const { avatar, name, intro } = profileFormData;
		const { symbol, token, period, network } = strategyFormData;
		const { contributors } = contributorFormData;
		const owner = myAddress;
		const members = contributors.map((contributor) => contributor.wallet);
		openGlobalLoading();
		const contract = new ethers.Contract(
			`${process.env.NEXT_PUBLIC_PROJECT_REGISTER_CONTRACT}`,
			ProjectRegisterABI,
			signer,
		);
		let contractRes;
		try {
			const votingContract = `${process.env.NEXT_PUBLIC_DEFAULT_VOTING_STRATEGY}`;
			console.log('create project params', owner, members, symbol, votingContract);
			const tx: TransactionResponse = await contract.create(
				owner,
				members,
				symbol,
				votingContract,
			);
			const response = await tx.wait(1);
			if (response.status === 1) {
				const count: bigint = await contract.projectsCount();
				const projectAddress = await contract.getOwnerLatestProject(
					owner,
					0,
					Number(count) - 1,
				);
				contractRes = { projectContract: projectAddress };
			}
		} catch (e) {
			closeGlobalLoading();
		}

		if (!contractRes?.projectContract) {
			closeGlobalLoading();
			throw new Error(' projectContract not found');
		}
		try {
			const params: CreateProjectParams = {
				logo: avatar,
				address: contractRes?.projectContract,
				pointConsensus: token,
				name: name,
				intro: intro,
				symbol: symbol,
				network: network,
				votePeriod: String(Date.now() + Number(period) * 24 * 60 * 60 * 1000),
				contributors: contributors,
			};

			console.log('CreateProjectParams', params);
			const result = await createProject(params);
			console.log('createProject res', result);
			showToast('Project Created', 'success');
			await getUserProjectList();

			const { id } = result;
			router.push(`/project/${id}/contribution`);
		} catch (e) {
			console.error('createProject error', e);
		} finally {
			closeGlobalLoading();
		}
	};

	const getUserProjectList = async () => {
		const myInfo = await getUserInfo(myAddress as string);
		const params = {
			currentPage: 1,
			pageSize: 50,
			userId: myInfo.id,
		};
		const { list } = await getProjectList(params);
		setUserProjectList(list || []);
	};

	return (
		<Img3Provider defaultGateways={defaultGateways}>
			<Container
				maxWidth={'xl'}
				sx={{
					display: 'flex',
					justifyContent: 'center',
					alignItems: 'flex-start',
					paddingTop: '56px',
				}}
			>
				<Box sx={{ maxWidth: 200 }}>
					<Stepper activeStep={activeStep} orientation="vertical">
						{steps.map((step, index) => (
							<Step sx={{ cursor: 'pointer' }} key={step.label}>
								<StepLabel onClick={() => setActiveStep(index)}>
									{step.label}
								</StepLabel>
							</Step>
						))}
					</Stepper>
				</Box>
				<Box sx={{ flex: 1, maxWidth: '860px', minWidth: '400px', marginLeft: '40px' }}>
					<Typography variant={'h2'} style={{ fontWeight: 'bold', marginBottom: '32px' }}>
						Create a project
					</Typography>

					<StepContent step={0} activeStep={activeStep}>
						<StepStart step={0} setActiveStep={setActiveStep} />
					</StepContent>
					<StepContent step={1} activeStep={activeStep}>
						<StepProfile ref={stepProfileRef} step={1} setActiveStep={setActiveStep} />
					</StepContent>
					<StepContent step={2} activeStep={activeStep}>
						<StepStrategy
							ref={stepStrategyRef}
							step={2}
							setActiveStep={setActiveStep}
						/>
					</StepContent>
					<StepContent step={3} activeStep={activeStep}>
						<StepContributor
							ref={stepContributorRef}
							step={3}
							setActiveStep={setActiveStep}
							onCreateProject={handleCreateProject}
						/>
					</StepContent>
				</Box>
			</Container>
		</Img3Provider>
	);
}

function StepContent({
	step,
	children,
	activeStep,
}: {
	step: number;
	activeStep: number;
	children: ReactNode;
}) {
	return <div style={{ display: activeStep === step ? 'block' : 'none' }}>{children}</div>;
}
