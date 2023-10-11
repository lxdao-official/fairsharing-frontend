'use client';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Avatar } from '@mui/material';

import React from 'react';
import useSWR from 'swr';

import { useAccount } from 'wagmi';
import { useRouter } from 'next/navigation';

import { getUserInfo } from '@/services';
import { StyledFlexBox } from '@/components/styledComponents';

export default function User() {
	const { address } = useAccount();
	const { data: userInfoData } = useSWR(address ? ['getUserInfo', address] : null, () =>
		getUserInfo(address!),
	);
	const route = useRouter();
	return (
		<StyledFlexBox style={{ fontSize: '12px', gap: '16px' }}>
			<ConnectButton showBalance={false} accountStatus="address" />
			{userInfoData ? (
				<Avatar
					variant="circular"
					style={{ width: 40, height: 40, cursor: 'pointer' }}
					src={userInfoData.avatar}
					onClick={() => {
						route.push(`/profile/${userInfoData.wallet}`);
					}}
				>
					{userInfoData.name || ''}
				</Avatar>
			) : null}
		</StyledFlexBox>
	);
}
