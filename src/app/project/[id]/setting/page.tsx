'use client';

import useSWR from 'swr';
import { Typography, Tabs, Tab, Skeleton, Stack, Alert, Button, Box } from '@mui/material';

import { useCallback, useEffect, useMemo, useState } from 'react';

import { useAccount } from 'wagmi';

import { Icon } from '@iconify/react';

import { ethers } from 'ethers';

import { useConnectModal } from '@rainbow-me/rainbowkit';

import { StyledFlexBox } from '@/components/styledComponents';
import StepProfile from '@/components/createProject/step/profile';
import {
	editContributorList,
	editProject,
	getContributorList,
	getProjectDetail,
	IContributor, PermissionEnum,
} from '@/services';

import { showToast } from '@/store/utils';
import StepStrategy from '@/components/createProject/step/strategy';
import useProjectInfoRef from '@/hooks/useProjectInfoRef';
import StepContributor from '@/components/createProject/step/contributor';
import { scanUrl } from '@/constant/url';
import { ContractAddressMap, ProjectABI } from '@/constant/contract';
import { useEthersSigner } from '@/common/ether';
import { compareMemberArrays } from '@/utils/member';

export default function Setting({ params }: { params: { id: string } }) {
	const { stepStrategyRef, stepProfileRef, stepContributorRef } = useProjectInfoRef();
	const signer = useEthersSigner();
	const { address: myAddress } = useAccount();
	const { openConnectModal } = useConnectModal();
	const [contributorList, setContributorList] = useState<IContributor[]>([]);

	const {
		isLoading: detailLoading,
		data,
		mutate,
	} = useSWR(['getProjectDetail', params.id], () => getProjectDetail(params.id));
	const {
		isLoading: contributorsLoading,
		data: contributorsData,
		mutate: contributorMutate,
	} = useSWR(['getContributorList', params.id], () => getContributorList(params.id), {
		fallbackData: [],
		onSuccess: data => setContributorList(data),
	});

	const { address } = useAccount();

	const [activeTab, setActiveTab] = useState('profile');

	const isContributor = useMemo(
		() => contributorsData?.some((item) => item.wallet === address),
		[contributorsData, address],
	);

	const handleTabChange = useCallback((_: any, value: string) => {
		setActiveTab(value);
	}, []);

	const handleProjectInfoSubmit = useCallback(
		async (type: 'profile' | 'strategy') => {
			const formData = stepProfileRef.current?.getFormData();
			const strategyData = stepStrategyRef.current?.getFormData();
			if (type === 'profile' && formData) {
				const { name, intro, avatar } = formData;
				await editProject({
					id: params.id,
					name,
					intro,
					logo: avatar,
					votePeriod: data!.votePeriod,
				});
			}
			if (type === 'strategy' && strategyData) {
				const { period } = strategyData;
				const { name, intro, logo } = data!;
				await editProject({
					id: params.id,
					name,
					intro,
					logo,
					votePeriod: period,
				});
			}
			showToast(`Project ${type} updated successfully`);
			await mutate();
		},
		[data],
	);

	const handleContributorSubmit = useCallback(async () => {
		if (!myAddress) {
			openConnectModal?.();
			return false;
		}

		let saveContractFail = false;
		const formData = stepContributorRef.current?.getFormData();
		try {
			const diffRes = compareMemberArrays(contributorList, formData?.contributors as IContributor[]);
			const { addAdminList, removeAdminList, addMemberList, removeMemberList } = diffRes;
			const isChange = addAdminList.length > 0 || removeAdminList.length > 0 || addMemberList.length > 0 || removeMemberList.length > 0;
			if (isChange) {
				const projectContract = new ethers.Contract(params.id, ProjectABI, signer);
				const res = await projectContract.setMembers(addAdminList, removeAdminList, addMemberList, removeMemberList);
				if (!res) {
					saveContractFail = true;
					throw new Error('【projectContract】 setMembers fail');
				}
			}
		} catch (err) {
			saveContractFail = true;
			console.error('【projectContract】 setMembers error', err);
			showToast('Failed to save onchain, please try again.', 'error');
		}

		if (saveContractFail) return;
		// DB可能会更改nickname、权限等
		if (formData?.contributors) {
			await editContributorList({
				projectId: params.id,
				contributors: formData.contributors as IContributor[],
			});
			showToast(`Contributors updated successfully`);
			await contributorMutate();
		}
	}, [contributorList, stepContributorRef.current, myAddress, signer, params.id]);

	const handleToScan = useCallback(() => {
		window.open(`${scanUrl}/address/${params.id}`, '_blank');
	}, [params.id]);

	const tabContent = useMemo(() => {
		switch (activeTab) {
			case 'profile':
				return (
					<StepProfile
						ref={stepProfileRef}
						data={data}
						canEdit={isContributor}
						onSave={() => handleProjectInfoSubmit('profile')}
					/>
				);
			case 'strategy':
				return (
					<StepStrategy
						ref={stepStrategyRef}
						data={data}
						canEdit={isContributor}
						onSave={() => handleProjectInfoSubmit('strategy')}
					/>
				);
			case 'contributors':
				return (
					<StepContributor
						ref={stepContributorRef}
						data={contributorsData}
						canEdit={isContributor}
						onSave={handleContributorSubmit}
					/>
				);
			default:
				return null;
		}
	}, [data, activeTab, isContributor, handleProjectInfoSubmit, contributorsData]);

	return (
		<div>
			<StyledFlexBox sx={{ justifyContent: 'space-between', marginBottom: '10px' }}>
				<Typography variant="h3">Settings</Typography>
				<StyledFlexBox sx={{ gap: '8px', cursor: 'pointer' }} onClick={handleToScan}>
					<Typography variant="subtitle1" sx={{ fontSize: '16px', fontWeight: 500 }}>
						Project contract
					</Typography>
					<Icon
						icon="material-symbols:keyboard-arrow-right"
						width={20}
						height={20}
						color="#0F172A"
					/>
				</StyledFlexBox>
			</StyledFlexBox>
			<Tabs
				value={activeTab}
				onChange={handleTabChange}
				sx={{
					'.Mui-selected': {
						color: `#0F172A !important`,
					},
				}}
			>
				<Tab value="profile" label="Profile" />
				<Tab value="strategy" label="Strategy" />
				<Tab value="contributors" label="Contributors" />
			</Tabs>
			<div style={{ marginTop: 32 }}>
				{detailLoading || contributorsLoading ? (
					<Stack spacing={5}>
						<Skeleton variant="circular" width={80} height={80} />
						<Skeleton variant="rounded" width={300} height={60} />
						<Skeleton variant="rounded" width={300} height={80} />
					</Stack>
				) : (
					<Box
						sx={{
							'& .Mui-disabled input,& .Mui-disabled textarea,& .Mui-disabled div': {
								cursor: 'no-drop',
								textFillColor: '#000',
							},
						}}
					>
						{!isContributor ? (
							<Alert
								severity="info"
								style={{ marginBottom: 32, display: 'flex', alignItems: 'center' }}
								sx={{
									backgroundColor: '#F5F5F5',
									color: '#475569',
									fontSize: '16px',
									'.MuiAlert-icon': {
										color: '#0F172A7A',
									},
								}}
							>
								You are in view only mode, to modify project settings connect with
								an admin wallet.
							</Alert>
						) : null}
						{tabContent}
					</Box>
				)}
			</div>
		</div>
	);
}
