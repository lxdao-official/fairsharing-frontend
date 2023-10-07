'use client';

import { Typography } from '@mui/material';

import React, { useCallback, useEffect, useState } from 'react';

import Image from 'next/image';

import { StyledFlexBox } from '@/components/styledComponents';

import ContributionList from '@/components/project/contribution/contributionList';

import { setCurrentProjectId } from '@/store/project';
import PostContribution from '@/components/project/contribution/postContribution';

export default function Page({ params }: { params: { id: string } }) {
	const [refresh, setRefresh] = useState(0);

	useEffect(() => {
		setCurrentProjectId(params.id as string);
	}, []);

	const onRefresh = useCallback((type: 'create' | 'edit') => {
		console.log('onRefresh', type);
		setRefresh((pre) => pre + 1);
	}, []);

	const onUpdate = useCallback(() => {
		console.log('onUpdate');
	}, []);

	return (
		<div style={{ flex: '1', minWidth: '600px' }}>
			<StyledFlexBox>
				<Typography typography={'h3'}>Post your contribution</Typography>
				<Image
					src={'/images/book.png'}
					width={24}
					height={24}
					alt={'contribution'}
					style={{ marginLeft: '10px' }}
				/>
			</StyledFlexBox>

			<PostContribution projectId={params.id} confirmText={'Post'} onUpdate={onRefresh} />

			<ContributionList projectId={params.id} refresh={refresh} onUpdate={onUpdate} />
		</div>
	);
}
