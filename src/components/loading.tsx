'use client';

import React from 'react';
import { Backdrop, Button, CircularProgress } from '@mui/material';

import { useUtilsStore } from '@/store/utils';
import { ZIndexMap } from '@/constant/style';

export default function SimpleGlobalLoading() {
	const { open } = useUtilsStore();
	const handleClose = () => {
		// closeGlobalLoading();
	};

	return (
		<div>
			<Backdrop sx={{ color: '#fff', zIndex: ZIndexMap.Loading }} open={open} onClick={handleClose}>
				<CircularProgress color="inherit" />
			</Backdrop>
		</div>
	);
}
