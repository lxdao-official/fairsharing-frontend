'use client';

import React from 'react';
import { Backdrop, Button, CircularProgress, styled, Typography } from '@mui/material';

import { useUtilsStore } from '@/store/utils';
import { ZIndexMap } from '@/constant/style';
import { StyledFlexBox } from '@/components/styledComponents';

export default function SimpleGlobalLoading() {
	const { open } = useUtilsStore();
	const handleClose = () => {
		// closeGlobalLoading();
	};

	return (
		<div>
			<Backdrop
				sx={{ color: '#fff', zIndex: ZIndexMap.Loading }}
				open={open}
				onClick={handleClose}
			>
				<LoadingBlock>
					<CircularProgress sx={{ color: '#0F172A' }} />
					<Typography sx={{ color: '#0F172A', marginTop: '8px' }}>Loading...</Typography>
				</LoadingBlock>
			</Backdrop>
		</div>
	);
}

const LoadingBlock = styled(StyledFlexBox)({
	flexDirection: 'column',
	justifyContent: 'center',
	background: '#FFFFFF',
	boxShadow: '0px 6px 6px -3px #0F172A1F',
	width: '444px',
	height: '244px',
	borderRadius: '4px',
});
