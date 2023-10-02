'use client';

import useSWR from 'swr';
import { Typography, Tabs, Tab, Skeleton, Stack, Alert } from '@mui/material';

import { StyledFlexBox } from '@/components/styledComponents';
import { useCallback, useMemo, useState } from 'react';
import StepProfile from '@/components/createProject/step/profile';
import { editProject, getContributorList, getProjectDetail } from '@/services';
import { useAccount } from 'wagmi';
import { showToast } from '@/store/utils';
import StepStrategy from '@/components/createProject/step/strategy';
import useProjectInfoRef from '@/hooks/useProjectInfoRef';

export default function Setting({ params }: { params: { id: string } }) {
	const { stepStrategyRef, stepProfileRef, stepContributorRef } = useProjectInfoRef();

	const {
		isLoading: detailLoading,
		data,
		mutate,
	} = useSWR(['getProjectDetail', params.id], () => getProjectDetail(params.id));
	const { isLoading: contributorsLoading, data: contributorsData } = useSWR(
		['getContributorList', params.id],
		() => getContributorList(params.id),
		{
			fallbackData: [],
		},
	);

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
				return <div>Contributors</div>;
			default:
				return null;
		}
	}, [data, activeTab, isContributor, handleProjectInfoSubmit]);

	return (
		<div>
			<StyledFlexBox sx={{ justifyContent: 'space-between', marginBottom: '10px' }}>
				<Typography variant="h3">Setting</Typography>
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
