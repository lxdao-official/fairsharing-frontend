'use client';

import useSWR from 'swr';
import { Typography, Tabs, Tab, Skeleton, Stack, Alert, Button } from '@mui/material';

import { useCallback, useMemo, useState } from 'react';

import { useAccount } from 'wagmi';

import { Icon } from '@iconify/react';

import { StyledFlexBox } from '@/components/styledComponents';
import StepProfile from '@/components/createProject/step/profile';
import {
	editContributorList,
	editProject,
	getContributorList,
	getProjectDetail,
	IContributor,
} from '@/services';

import { showToast } from '@/store/utils';
import StepStrategy from '@/components/createProject/step/strategy';
import useProjectInfoRef from '@/hooks/useProjectInfoRef';
import StepContributor from '@/components/createProject/step/contributor';
import { scanUrl } from '@/constant/url';

export default function Setting({ params }: { params: { id: string } }) {
	const { stepStrategyRef, stepProfileRef, stepContributorRef } = useProjectInfoRef();

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
		const formData = stepContributorRef.current?.getFormData();
		if (formData?.contributors) {
			await editContributorList({
				projectId: params.id,
				contributors: formData.contributors as IContributor[],
			});
			showToast(`Contributors updated successfully`);
			await contributorMutate();
		}
	}, []);

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
					<>
						{!isContributor ? (
							<Alert
								severity="info"
								style={{ marginBottom: 32, display: 'flex', alignItems: 'center' }}
								sx={{
									backgroundColor: '#F5F5F5',
									color: '#475569',
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
					</>
				)}
			</div>
		</div>
	);
}
