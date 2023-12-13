'use client';
import {
	Avatar,
	Button,
	Grid,
	MenuItem,
	Select,
	Skeleton,
	Stack,
	styled,
	Typography,
} from '@mui/material';
import React, { useCallback, useState } from 'react';

import useSWR from 'swr';

import { useAccount } from 'wagmi';

import EditIcon from '@mui/icons-material/Edit';

import { StyledFlexBox } from '@/components/styledComponents';
import { getMintRecord, getProjectListByWallet, getUserInfo } from '@/services';

import { WalletCell } from '@/components/table/cell';
import EditDialog from '@/components/profile/editDialog';
import ContributionList from '@/components/project/contribution/contributionList';

const Container = styled('div')(() => ({
	minWidth: '1000px',
	width: '1196px',
	margin: '64px auto',
	overflowX: 'scroll',
}));

const UserInfoContainer = styled('div')(() => ({
	border: '0.5px solid rgba(15, 23, 42, 0.16)',
	padding: '24px',
	borderRadius: '8px',
	display: 'flex',
	gap: '24px',
}));

const colors = [
	{
		bg: '#E8F4FF',
		color: '#437EF7',
	},
	{
		bg: '#E8FFF5',
		color: '#0A9B80',
	},
	{
		bg: '#FFF3E0',
		color: '#F57C00',
	},
	{
		bg: '#EDE7F6',
		color: '#673AB7',
	},
];

const ProjectItem = styled('span')(({ index }: { index: number }) => ({
	display: 'inline-block',
	padding: '4px 12px',
	backgroundColor: colors[index].bg,
	color: colors[index].color,
	borderRadius: '4px',
	fontSize: '14px',
	fontWeight: 500,
}));

export default function Profile({ params }: { params: { wallet: string } }) {
	const [open, setOpen] = useState(false);
	const [currentProjectId, setCurrentProjectId] = useState('');

	const wallet = params.wallet;
	const {
		data: userInfoData,
		isLoading: userInfoLoading,
		mutate,
	} = useSWR(['getUserInfo', wallet], () => getUserInfo(wallet));
	const { data: projectData, isLoading: projectLoading } = useSWR(
		wallet ? ['getProjectListByWallet', wallet] : null,
		() => getProjectListByWallet(wallet),
		{
			onSuccess: (data) => {
				if (data.length > 0) {
					setCurrentProjectId(data[0].id);
				}
			},
		},
	);
	const { data: mintData } = useSWR(
		currentProjectId && wallet ? ['getMintRecord', currentProjectId, wallet] : null,
		() => getMintRecord(currentProjectId, wallet),
		{
			fallbackData: [],
		},
	);

	const { address } = useAccount();

	const handleEdit = useCallback(() => {
		setOpen((v) => !v);
		mutate();
	}, []);

	return (
		<Container>
			{open ? (
				<EditDialog
					onClose={() => setOpen((v) => !v)}
					onConfirm={handleEdit}
					data={userInfoData!}
				/>
			) : null}
			<UserInfoContainer>
				{userInfoLoading ? (
					<Skeleton variant="rounded" width={144} height={144} />
				) : (
					<Avatar
						variant="rounded"
						style={{ width: 144, height: 144 }}
						src={userInfoData?.avatar}
					>
						{userInfoData?.avatar || userInfoData?.name || ''}
					</Avatar>
				)}
				<StyledFlexBox
					style={{
						flexDirection: 'column',
						alignItems: 'start',
						paddingTop: '16px',
						width: '100%',
					}}
				>
					{userInfoLoading || projectLoading ? (
						<Stack spacing={5}>
							<Skeleton variant="rectangular" width={260} height={60} />
							<Skeleton variant="rectangular" width={400} height={60} />
							<Skeleton variant="rectangular" width={400} height={60} />
						</Stack>
					) : (
						<>
							<StyledFlexBox
								style={{
									justifyContent: 'space-between',
									width: '100%',
									alignItems: 'flex-start',
									marginBottom: '8px',
								}}
							>
								<Typography variant="h3">
									{userInfoData?.name || 'No name'}
								</Typography>
								{address === wallet ? (
									<Button
										variant="outlined"
										size="small"
										startIcon={<EditIcon fontSize="small" />}
										sx={{ minWidth: 'auto' }}
										onClick={() => setOpen((v) => !v)}
									>
										Edit
									</Button>
								) : null}
							</StyledFlexBox>
							<WalletCell
								wallet={userInfoData?.wallet || ''}
								needFormat={false}
								color="#475569"
							/>
							<Typography
								variant="h6"
								sx={{ margin: '24px 0 8px', fontSize: '16px' }}
							>
								Intro
							</Typography>
							<Typography
								variant="body1"
								color="#475569"
								sx={{ marginBottom: '40px' }}
							>
								{userInfoData?.bio || 'No intro'}
							</Typography>
							<Typography variant="h6" sx={{ marginBottom: '12px' }}>
								Project involved
							</Typography>
							<Grid container spacing="12px">
								{projectData?.map((item, index) => {
									return (
										<Grid item key={item.id}>
											<ProjectItem key={item.id} index={index % 4}>
												{item.name}
											</ProjectItem>
										</Grid>
									);
								})}
							</Grid>
						</>
					)}
				</StyledFlexBox>
			</UserInfoContainer>
			<StyledFlexBox style={{ justifyContent: 'space-between', marginTop: '24px' }}>
				<Typography typography={'h3'} sx={{ fontWeight: 500 }}>
					Contributions
				</Typography>
				{projectData?.length ? (
					<StyledFlexBox style={{ gap: '24px' }}>
						<Typography variant="body2">
							Total pizza slices earned: {mintData[0]?.credit ?? 0}
						</Typography>
						<Select
							size="small"
							value={currentProjectId}
							sx={{ minWidth: '180px' }}
							onChange={(e) => setCurrentProjectId(e.target.value)}
						>
							{projectData?.map((item) => (
								<MenuItem key={item.id} value={item.id}>
									{item.name}
								</MenuItem>
							))}
						</Select>
					</StyledFlexBox>
				) : null}
			</StyledFlexBox>
			{currentProjectId ? (
				<ContributionList projectId={currentProjectId} showHeader={false} wallet={wallet} />
			) : null}
		</Container>
	);
}
