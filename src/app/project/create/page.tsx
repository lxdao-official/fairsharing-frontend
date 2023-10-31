'use client';

import process from 'process';

import { Box, Container, Step, StepLabel, Stepper, Typography } from '@mui/material';
import { ReactNode, useEffect, useMemo, useState } from 'react';

import { Img3Provider } from '@lxdao/img3';

import { ethers } from 'ethers';

import { TransactionResponse } from '@ethersproject/abstract-provider';

import { useAccount } from 'wagmi';

import { useRouter } from 'next/navigation';

import StepStart from '@/components/createProject/step/start';
import StepStrategy from '@/components/createProject/step/strategy';
import StepProfile from '@/components/createProject/step/profile';
import StepContributor from '@/components/createProject/step/contributor';
import { defaultGateways } from '@/constant/img3';

import { useEthersSigner } from '@/common/ether';

import { createProject, getProjectList } from '@/services/project';

import { closeGlobalLoading, openGlobalLoading, showToast } from '@/store/utils';

import { getUserInfo } from '@/services/user';
import { setUserProjectList, useProjectStore } from '@/store/project';

import useProjectInfoRef from '@/hooks/useProjectInfoRef';
import { ContractAddressMap, ProjectRegisterABI } from '@/constant/contract';
import { generateWeightArray } from '@/utils/weight';
import { isAdmin } from '@/utils/member';

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

const ProjectParamStorageKey = '__fairSharing_create_project_params__';

export default function Page() {
	const router = useRouter();
	const signer = useEthersSigner();
	const { address: myAddress } = useAccount();
	const { userProjectList } = useProjectStore();
	const [latestProjectAddress, setLatestProjectAddress] = useState('');

	const [activeStep, setActiveStep] = useState(0);
	const { stepStrategyRef, stepProfileRef, stepContributorRef } = useProjectInfoRef();

	useEffect(() => {
		if (myAddress && signer) {
			getOwnerLatestProject();
		}
	}, [myAddress, signer]);

	const isProjectClean = useMemo(() => {
		if (!latestProjectAddress) return true;
		const findItem = userProjectList.find((item) => item.id === latestProjectAddress);
		if (!findItem && localStorage.getItem(ProjectParamStorageKey)) {
			console.log(
				'need to auto register project',
				localStorage.getItem(ProjectParamStorageKey),
			);
			return false;
		}
		return true;
	}, [userProjectList, latestProjectAddress]);

	useEffect(() => {
		if (!isProjectClean) {
			const param = localStorage.getItem(ProjectParamStorageKey);
			if (!param) return;
			createProject({ ...JSON.parse(param!), address: latestProjectAddress })
				.then(() => {
					localStorage.removeItem(ProjectParamStorageKey);
					getUserProjectList();
				})
				.catch((err) => {
					console.error('createProject error', err);
				});
		}
	}, [isProjectClean]);

	const handleCreateProject = async () => {
		const { profileFormData, strategyFormData, contributorFormData } = handleGetFormData();
		const { avatar, name, intro } = profileFormData!;
		const { symbol, period, network } = strategyFormData!;
		const { contributors } = contributorFormData!;
		try {
			openGlobalLoading();

			const baseParams = {
				logo: avatar,
				pointConsensus: '999999',
				name: name,
				intro: intro,
				symbol: symbol,
				network: network,
				votePeriod: String(period),
				contributors: contributors,
			};
			localStorage.setItem(ProjectParamStorageKey, JSON.stringify(baseParams));

			const projectRegistryContract = new ethers.Contract(
				ContractAddressMap.ProjectRegistry,
				ProjectRegisterABI,
				signer,
			);

			const admins = contributors
				.filter((contributor) => isAdmin(contributor.permission))
				.map((item) => item.wallet);
			const members = contributors.map((contributor) => contributor.wallet);
			const registerProjectContractParams = {
				admins: admins,
				members: members,
				tokenName: name,
				tokenSymbol: symbol,
				voteStrategy: ContractAddressMap.VotingStrategy,
				voteStrategyData: ethers.toUtf8Bytes(''),
				voteWeights: generateWeightArray(members.length, 100), // uint256[]
				voteThreshold: 50, // uint256
			};
			console.log('【Contract】create project params', registerProjectContractParams);
			const tx: TransactionResponse = await projectRegistryContract.create(
				registerProjectContractParams,
			);
			const response = await tx.wait(1);
			if (response.status !== 1) {
				throw new Error('【Contract】projectContract not found');
			}
			const count: bigint = await projectRegistryContract.projectsCount();
			const projectAddress = await projectRegistryContract.getOwnerLatestProject(
				myAddress,
				0,
				Number(count) - 1,
			);
			if (!projectAddress) {
				throw new Error('【Contract】 projectAddress not found');
			}
			const result = await createProject({ ...baseParams, address: projectAddress });
			showToast('Project Created', 'success');
			localStorage.removeItem(ProjectParamStorageKey);
			await getUserProjectList();
			router.push(`/project/${result.id}/contribution`);
		} catch (e) {
			console.error('createProject', e);
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

	const getOwnerLatestProject = async () => {
		try {
			const contract = new ethers.Contract(
				ContractAddressMap.ProjectRegistry,
				ProjectRegisterABI,
				signer,
			);
			const count: bigint = await contract.projectsCount();
			const projectAddress = await contract.getOwnerLatestProject(
				myAddress,
				0,
				Number(count) - 1,
			);
			console.log('[contract] getOwnerLatestProject', projectAddress);
			setLatestProjectAddress(projectAddress);
			return projectAddress;
		} catch (err) {
			console.error('[contract error]: getOwnerLatestProject', err);
			return Promise.reject(null);
		}
	};

	const handleGetFormData = () => {
		const profileFormData = stepProfileRef.current?.getFormData();
		const strategyFormData = stepStrategyRef.current?.getFormData();
		const contributorFormData = stepContributorRef.current?.getFormData();
		return { profileFormData, strategyFormData, contributorFormData };
	};

	const handleClickStepLabel = (index: number) => {
		if (index >= activeStep) {
			return false;
		} else {
			setActiveStep(index);
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
							<Step sx={{ cursor: 'pointer' }} key={step.label} onClick={() => handleClickStepLabel(index)}>
								<StepLabel
									StepIconProps={{
										sx: {
											'& text': {
												fill: activeStep >= index ? '#fff' : '#CBD5E1',
											},
											borderColor: activeStep >= index ? '#000' : '#CBD5E1',
											// background: activeStep >= index ? '#000' : '#fff',
										},
									}}
								>
									{step.label}
								</StepLabel>
							</Step>
						))}
					</Stepper>
				</Box>
				<Box
					sx={{
						flex: 1,
						maxWidth: '860px',
						minWidth: '400px',
						marginLeft: '40px',
						height: '100%',
						overflowY: 'scroll',
					}}
				>
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
							canEdit={true}
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
