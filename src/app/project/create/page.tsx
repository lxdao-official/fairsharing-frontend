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

import { createProject, CreateProjectParams } from '@/services/project';

import { closeGlobalLoading, openGlobalLoading } from '@/store/utils';

// @ts-ignore
import project_register_abi = require('../../../../abi/project_register_abi.json');

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

	// 测试代码，先不管
	// useContractRead({
	// 	address: '0x5C0340AD34f7284f9272E784FF76638E8dDb5dE4',
	// 	abi: project_register_abi,
	// 	functionName: 'owner',
	// 	onSuccess(data) {
	// 		console.log('get project register owner:', data);
	// 	},
	// });

	// const {
	// 	data: registerResult,
	// 	isLoading,
	// 	isSuccess,
	// 	write,
	// } = useContractWrite({
	// 	address: '0x5C0340AD34f7284f9272E784FF76638E8dDb5dE4',
	// 	abi: project_register_abi,
	// 	functionName: 'register',
	// });
	//
	// const waitForTransaction = useWaitForTransaction({
	// 	hash: registerResult?.hash,
	// });

	const handleCreateProject = async () => {
		const profileFormData = (stepProfileRef.current as StepProfileRef).getFormData();
		const strategyFormData = (stepStrategyRef.current as StepStrategyRef).getFormData();
		const contributorFormData = (
			stepContributorRef.current as StepContributorRef
		).getFormData();
		const { avatar, name, intro } = profileFormData;
		const { symbol, token, period, network } = strategyFormData;
		const { contributors } = contributorFormData;
		// TODO 需要考虑 合约调用成功, 但后端调用失败的问题, 需要做好数据同步.
		const owner = myAddress;
		const members = contributors.map((contributor) => contributor.wallet);
		openGlobalLoading();
		const contract = new ethers.Contract(
			`${process.env.NEXT_PUBLIC_PROJECT_REGISTER_CONTRACT}`,
			project_register_abi,
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
				const result = await contract.create.staticCallResult(
					owner,
					members,
					symbol,
					votingContract,
				);
				const projectContract = result[0];
				contractRes = { projectContract: projectContract };
				console.log('callStatic projectContract:', projectContract);
			}
		} catch (e) {
			closeGlobalLoading();
		}

		const params: CreateProjectParams = {
			logo: avatar,
			address: contractRes?.projectContract,
			pointConsensus: token,
			name: name,
			intro: intro,
			symbol: symbol,
			network: network,
			votePeriod: period,
			contributors: contributors,
		};
		try {
			console.log('CreateProjectParams', params);
			const result = await createProject(params);
			console.log('createProject res', result);
			const { id } = result;
			router.push(`/project/${id}/contribution`);
		} catch (e) {
			console.error('createProject error', e);
		} finally {
			closeGlobalLoading();
		}
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
					<Button
						variant={'contained'}
						onClick={handleGetFormData}
						sx={{ marginTop: '40px' }}
					>
						console form data
					</Button>
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
