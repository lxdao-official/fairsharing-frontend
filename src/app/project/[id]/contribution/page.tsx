'use client';

import { Button, styled, Typography } from '@mui/material';

import React, { useEffect, useMemo, useState } from 'react';

import { Img3Provider } from '@lxdao/img3';

import { useConnectModal } from '@rainbow-me/rainbowkit';

import Link from 'next/link';

import { StyledFlexBox } from '@/components/styledComponents';

import ContributionList from '@/components/project/contribution/contributionList';

import { setCurrentProjectId } from '@/store/project';
import PostContribution from '@/components/project/contribution/postContribution';
import { defaultGateways } from '@/constant/img3';
import usePrivilege from '@/components/project/contribution/usePrivilege';
import { InfoIcon } from '@/icons';
import { isProd } from '@/constant/env';

export default function Page({ params }: { params: { id: string } }) {
	const [showFullPost, setShowFullPost] = useState(true);
	const [isEditing, setIsEditing] = useState(false);

	const { openConnectModal } = useConnectModal();
	const { isWalletConnected, isChainCorrect, isProjectContributor } = usePrivilege({
		projectId: params.id,
	});

	const showPost = useMemo(() => {
		return isWalletConnected && isChainCorrect && isProjectContributor;
	}, [isWalletConnected, isChainCorrect, isProjectContributor]);

	useEffect(() => {
		setCurrentProjectId(params.id as string);

		const handleClickOutside = (event: any) => {
			const targetElement = event.target;
			if (isEditing) {
				return;
			}
			if (showFullPost && targetElement.closest('.MuiPopper-root')) {
				return;
			}
			if (
				showFullPost &&
				!targetElement.closest('#postContainer') &&
				(targetElement.tagName.toLowerCase() === 'path' ||
					targetElement.tagName.toLowerCase() === 'svg')
			) {
				return;
			}
			if (!targetElement.closest('#postContainer')) {
				setShowFullPost(false);
			}
		};
		//
		// document.addEventListener('click', handleClickOutside);
		//
		// return () => {
		// 	document.removeEventListener('click', handleClickOutside);
		// };
	}, [showFullPost, isEditing]);

	const onConnectWallet = () => {
		openConnectModal?.();
	};

	return (
		<Img3Provider defaultGateways={defaultGateways}>
			<div style={{ flex: '1', minWidth: '600px' }}>
				{showPost ? (
					<>
						<StyledFlexBox sx={{ marginBottom: '16px' }}>
							<Typography variant={'subtitle1'} sx={{ fontWeight: 500 }}>
								Post a contribution
							</Typography>
							{/*<Image*/}
							{/*	src={'/images/book.png'}*/}
							{/*	width={24}*/}
							{/*	height={24}*/}
							{/*	alt={'contribution'}*/}
							{/*	style={{ marginLeft: '10px' }}*/}
							{/*/>*/}
						</StyledFlexBox>
						<PostContribution
							projectId={params.id}
							confirmText={'Post'}
							setShowFullPost={setShowFullPost}
							showFullPost={showFullPost}
							setIsEditing={setIsEditing}
						/>
					</>
				) : (
					<PrivilegeContainer>
						<InfoIconContainer>
							<InfoIcon width={22} height={22} />
						</InfoIconContainer>
						<PrivilegeContent>
							{!isWalletConnected ? (
								<>
									<TypographyButton onClick={onConnectWallet}>
										Connect your wallet
									</TypographyButton>
									<Typography>to post a contribution.</Typography>
								</>
							) : !isChainCorrect ? (
								<>
									<Typography>
										Switch the network to{' '}
										{isProd ? (
											<strong>Optimism</strong>
										) : (
											<strong>Optimism Sepolia</strong>
										)}{' '}
										in your wallet.
									</Typography>
								</>
							) : !isProjectContributor ? (
								<div>
									<Typography>
										Your wallet is not linked to this project. Select an option
										to proceed:
									</Typography>
									<ul style={{ listStyle: 'initial', paddingLeft: '20px' }}>
										<li>
											<Typography>
												Reach out to the admin to be added.
											</Typography>
										</li>
										<li>
											<Typography>Switch to the correct wallet.</Typography>
										</li>
										<li>
											<StyledFlexBox>
												<Link href={'/project/create'}>
													<TypographyButton>Create</TypographyButton>
												</Link>
												<Typography>a new project.</Typography>
											</StyledFlexBox>
										</li>
									</ul>
								</div>
							) : null}
						</PrivilegeContent>
					</PrivilegeContainer>
				)}

				<ContributionList projectId={params.id} />
			</div>
		</Img3Provider>
	);
}

const PrivilegeContainer = styled(StyledFlexBox)({
	width: '100%',
	padding: '6px 18px',
	backgroundColor: '#F5F5F5',
	borderRadius: '4px',
	alignItems: 'flex-start',
	color: '#475569',
});
const PrivilegeContent = styled(StyledFlexBox)({
	// marginLeft: '12px',
	minHeight: '38px',
});
const InfoIconContainer = styled('div')({
	display: 'flex',
	justifyContent: 'flex-start',
	alignItems: 'center',
	width: '34px',
	height: '38px',
});
const TypographyButton = styled(Typography)({
	color: '#437EF7',
	cursor: 'pointer',
	marginRight: '4px',
	'&:active': {
		fontWeight: 'bold',
	},
});
