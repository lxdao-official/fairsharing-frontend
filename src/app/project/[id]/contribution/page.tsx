'use client';

import { Typography } from '@mui/material';

import React, { useCallback, useEffect, useState } from 'react';

import Image from 'next/image';

import { StyledFlexBox } from '@/components/styledComponents';

import ContributionList from '@/components/project/contribution/contributionList';

import { setCurrentProjectId } from '@/store/project';
import PostContribution from '@/components/project/contribution/postContribution';

export default function Page({ params }: { params: { id: string } }) {
	useEffect(() => {
		setCurrentProjectId(params.id as string);
	}, []);

	return (
		<div style={{ flex: '1', minWidth: '600px' }}>
			<StyledFlexBox sx={{ marginBottom: '16px' }}>
				<Typography variant={'subtitle1'} sx={{ fontWeight: 500 }}>
					Post your contribution
				</Typography>
				<Image
					src={'/images/book.png'}
					width={24}
					height={24}
					alt={'contribution'}
					style={{ marginLeft: '10px' }}
				/>
			</StyledFlexBox>

			<PostContribution projectId={params.id} confirmText={'Post'} />

			<ContributionList projectId={params.id} />
		</div>
	);
}
