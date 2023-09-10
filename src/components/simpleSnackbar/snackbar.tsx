'use client';

import { Alert, Snackbar } from '@mui/material';

import { closeToast, useUtilsStore } from '@/store/utils';

const SimpleSnackbar = () => {
	const { alert } = useUtilsStore();

	const handleClose = () => {
		closeToast();
	};

	return (
		<Snackbar
			anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
			open={alert.open}
			autoHideDuration={3000}
			onClose={handleClose}
		>
			<Alert onClose={handleClose} severity={alert.severity} sx={{ width: '100%' }}>
				{alert.content}
			</Alert>
		</Snackbar>
	);
};

export default SimpleSnackbar;
