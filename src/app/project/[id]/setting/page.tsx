'use client';

import useSWR from 'swr';
import { Typography, Tabs, Tab } from '@mui/material';

import { StyledFlexBox } from '@/components/styledComponents';
import { useCallback, useState } from 'react';

export default function Setting({ params }: { params: { id: string } }) {
	const [activeTab, setActiveTab] = useState('profile');

	const handleTabChange = useCallback((_: any, value: string) => {
		setActiveTab(value);
	}, []);

	return (
		<div>
			<StyledFlexBox sx={{ justifyContent: 'space-between', marginBottom: '10px' }}>
				<Typography variant="h3">Setting</Typography>
			</StyledFlexBox>
			<Tabs
				value={activeTab}
				onChange={handleTabChange}
				TabIndicatorProps={{
					style: {
						backgroundColor: '#0F172A',
					},
				}}
				sx={{
					'.Mui-selected': {
						color: `#0F172A`,
					},
				}}
			>
				<Tab value="profile" label="Profile" />
				<Tab value="strategy" label="Strategy" />
				<Tab value="contributors" label="Contributors" />
			</Tabs>
		</div>
	);
}
