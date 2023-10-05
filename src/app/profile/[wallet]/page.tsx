'use client';
import { Avatar, Button, Grid, Skeleton, Stack, styled, Typography } from '@mui/material';
import React, { useCallback } from 'react';

import useSWR from 'swr';

import { useAccount } from 'wagmi';

import EditIcon from '@mui/icons-material/Edit';

import { StyledFlexBox } from '@/components/styledComponents';
import { getProjectListByWallet, getUserInfo } from '@/services';

import { WalletCell } from '@/components/table/cell';
import EditDialog from '@/components/profile/editDialog';

const Container = styled('div')(() => ({
	minWidth: '1000px',
	width: '1196px',
	margin: '64px auto',
}));

const UserInfoContainer = styled('div')(() => ({
	border: '0.5px solid rgba(15, 23, 42, 0.16)',
	padding: '24px',
	borderRadius: '8px',
	display: 'flex',
	gap: '24px',
}));

const colors = {
	blue: {
		bg: '#E8F4FF',
		color: '#437EF7',
	},
	green: {
		bg: '#E8FFF5',
		color: '#0A9B80',
	},
	orange: {
		bg: '#FFF3E0',
		color: '#F57C00',
	},
	purple: {
		bg: '#EDE7F6',
		color: '#673AB7',
	},
};

const ProjectItem = styled('span')(({ color }: { color: keyof typeof colors }) => ({
	display: 'inline-block',
	padding: '4px 12px',
	backgroundColor: colors[color].bg,
	color: colors[color].color,
	borderRadius: '4px',
	fontSize: '14px',
	fontWeight: 500,
}));

export default function Profile({ params }: { params: { wallet: string } }) {
	const {
		data: userInfoData,
		isLoading: userInfoLoading,
		mutate,
	} = useSWR(['getUserInfo', params.wallet], () => getUserInfo(params.wallet));
	const { data: projectData, isLoading: projectLoading } = useSWR(
		['getProjectListByWallet', params.wallet],
		() => getProjectListByWallet(params.wallet),
	);

	const [open, setOpen] = React.useState(false);

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
								{address === params.wallet ? (
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
							<Typography variant="h6" sx={{ margin: '24px 0 8px' }}>
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
								{projectData?.map((item) => {
									const randomNum = Math.floor(Math.random() * 4);
									const color = Object.keys(colors)[
										randomNum
									] as keyof typeof colors;
									return (
										<Grid item key={item.id}>
											<ProjectItem key={item.id} color={color}>
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
		</Container>
	);
}
