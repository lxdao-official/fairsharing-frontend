import React from 'react';
import { Dialog, DialogContent, DialogTitle, IconButton, styled } from '@mui/material';

import { CloseGrayIcon } from '@/icons';

export interface IProps {
	children: React.ReactNode;
	title: string;
	open: boolean;
	onClose: () => void;
}

const CustomDialog = (props: IProps) => {
	const { title, open, onClose, children } = props;
	return (
		<BootstrapDialog onClose={onClose} aria-labelledby="customized-dialog-title" open={open}>
			<DialogTitle
				sx={{ m: 0, p: 2, height: '64', fontSize: '20px', fontWeight: '500' }}
				id="customized-dialog-title"
			>
				{title}
			</DialogTitle>
			<IconButton
				aria-label="close"
				onClick={onClose}
				sx={{
					position: 'absolute',
					right: 8,
					top: 8,
					color: (theme) => theme.palette.grey[500],
				}}
			>
				<CloseGrayIcon />
			</IconButton>
			<DialogContent>{children}</DialogContent>
		</BootstrapDialog>
	);
};

export default CustomDialog;

const BootstrapDialog = styled(Dialog)(({ theme }) => ({
	'& .MuiDialogContent-root': {
		padding: theme.spacing(2),
		minWidth: '500px',
	},
	'& .MuiDialogActions-root': {
		padding: theme.spacing(1),
	},
}));
