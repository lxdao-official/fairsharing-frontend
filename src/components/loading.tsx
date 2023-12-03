'use client';

import React from 'react';
import { Backdrop, Button, CircularProgress } from '@mui/material';

import { closeGlobalLoading, openGlobalLoading, useUtilsStore } from '@/store/utils';

export default function SimpleGlobalLoading() {
	const { open } = useUtilsStore();
	const handleClose = () => {
		// closeGlobalLoading();
	};

	return (
		<div>
			<Backdrop sx={{ color: '#fff', zIndex: 1400 }} open={open} onClick={handleClose}>
				<CircularProgress color="inherit" />
			</Backdrop>
		</div>
	);
}
