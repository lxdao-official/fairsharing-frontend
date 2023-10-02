'use client';

import useSWR from 'swr';
import { Typography, Tabs, Tab, Skeleton, Stack, Alert } from '@mui/material';

import { StyledFlexBox } from '@/components/styledComponents';
import { useCallback, useMemo, useRef, useState } from 'react';
import StepProfile, { StepProfileRef } from '@/components/createProject/step/profile';
import { editProject, getContributorList, getMintRecord, getProjectDetail } from '@/services';
import { useAccount } from 'wagmi';
import { showToast } from '@/store/utils';

export default function Setting({ params }: { params: { id: string } }) {
	const stepProfileRef = useRef<StepProfileRef | null>(null);

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

	const handleProfileSubmit = useCallback(async () => {
		const formData = stepProfileRef.current?.getFormData();
		if (formData) {
			const { name, intro, avatar } = formData;
			await editProject({
				id: params.id,
				name,
				intro,
				logo: avatar,
				votePeriod: data!.votePeriod,
			});
			showToast('Project profile updated successfully');
			await mutate();
		}
	}, [data]);

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
						<StepProfile
							ref={stepProfileRef}
							data={data}
							canEdit={isContributor}
							onSave={handleProfileSubmit}
						/>
					</>
				)}
			</div>
		</div>
	);
}
