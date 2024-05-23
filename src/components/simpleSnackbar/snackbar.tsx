'use client';

import { Alert, Snackbar } from '@mui/material';

import { closeToast, useUtilsStore } from '@/store/utils';

const SimpleSnackbar = () => {
	const { alert } = useUtilsStore();

	const handleClose = () => {
		closeToast();
	};

	return (
		<>
			{alert.open ? (
				<Snackbar
					anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
					open
					autoHideDuration={alert.autoHideDuration}
					onClose={handleClose}
				>
					<Alert onClose={handleClose} severity={alert.severity} sx={{ width: '100%' }}>
						{alert.content}
					</Alert>
				</Snackbar>
			) : null}
		</>
	);
};

export default SimpleSnackbar;
