'use client';
import { Avatar, Grid, IconButton, Skeleton, Stack, styled, Typography } from '@mui/material';
import { CopyAll } from '@mui/icons-material';
import React from 'react';
import { StyledFlexBox } from '@/components/styledComponents';
import useSWR from 'swr';
import { getProjectListByWallet, getUserInfo } from '@/services';
import { useAccount } from 'wagmi';

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
	const { data: userInfoData, isLoading: userInfoLoading } = useSWR(
		['getUserInfo', params.wallet],
		() => getUserInfo(params.wallet),
	);
	const { data: projectData, isLoading: projectLoading } = useSWR(
		['getProjectListByWallet', params.wallet],
		() => getProjectListByWallet(params.wallet),
	);

	const { address } = useAccount();

	return (
		<Container>
			<UserInfoContainer>
				{userInfoLoading ? (
					<Skeleton variant="rounded" width={144} height={144} />
				) : (
					<Avatar variant="rounded" style={{ width: 144, height: 144 }}>
						{userInfoData?.avatar || userInfoData?.name || ''}
					</Avatar>
				)}
				<StyledFlexBox
					style={{ flexDirection: 'column', alignItems: 'start', paddingTop: '16px' }}
				>
					{userInfoLoading || projectLoading ? (
						<Stack spacing={5}>
							<Skeleton variant="rectangular" width={260} height={60} />
							<Skeleton variant="rectangular" width={400} height={60} />
							<Skeleton variant="rectangular" width={400} height={60} />
						</Stack>
					) : (
						<>
							<Typography variant="h3" gutterBottom>
								{userInfoData?.name || 'No name'}
							</Typography>
							<StyledFlexBox sx={{ marginBottom: '22px' }}>
								<Typography variant="body1" color="#475569">
									{userInfoData?.wallet || ''}
								</Typography>
								<IconButton size="small">
									<CopyAll fontSize="small" />
								</IconButton>
							</StyledFlexBox>
							<Typography variant="h6" sx={{ marginBottom: '8px' }}>
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
										<Grid item>
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
