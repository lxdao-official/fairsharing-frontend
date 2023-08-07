'use client';

import React from 'react';
import { Backdrop, Button, CircularProgress } from '@mui/material';

import { closeGlobalLoading, openGlobalLoading, useUserStore } from '@/store/utils';

export default function SimpleGlobalLoading() {
	const { open } = useUserStore();
	const handleClose = () => {
		closeGlobalLoading();
	};
	const handleOpen = () => {
		openGlobalLoading();
	};

	return (
		<div>
			<Button variant={'contained'} onClick={handleOpen}>
				Show Loading
			</Button>
			<Backdrop
				sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
				open={open}
				onClick={handleClose}
			>
				<CircularProgress color="inherit" />
			</Backdrop>
		</div>
	);
}
