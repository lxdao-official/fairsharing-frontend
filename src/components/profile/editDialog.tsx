import {
	Button,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	styled,
	TextField,
} from '@mui/material';
import { Controller, useForm } from 'react-hook-form';
import LoadingButton from '@mui/lab/LoadingButton';
import React, { useCallback } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { object, string, TypeOf } from 'zod';

import { editUser, IUser } from '@/services';
import UploadImage from '@/components/uploadImage/uploadImage';
import { showToast } from '@/store/utils';

const registerSchema = object({
	avatar: string(),
	name: string(),
	bio: string(),
});

type FormData = TypeOf<typeof registerSchema>;

const FormContainer = styled('form')(() => ({
	display: 'flex',
	flexDirection: 'column',
	gap: '32px',
}));

export interface EditDialogProps {
	data: IUser;
	onClose: () => void;
	onConfirm: () => void;
}

export default function EditDialog(props: EditDialogProps) {
	const { onClose, onConfirm, data: userData } = props;
	const [isUploading, setIsUploading] = React.useState(false);
	const [isLoading, setIsLoading] = React.useState(false);

	const {
		control,
		formState: { isDirty },
		handleSubmit,
	} = useForm<FormData>({
		resolver: zodResolver(registerSchema),
		defaultValues: {
			avatar: userData.avatar,
			name: userData.name,
			bio: userData.bio,
		},
	});

	const handleConfirm = useCallback(
		async (data: any) => {
			setIsLoading(true);
			try {
				await editUser(userData.wallet, data);
				showToast('Edit profile success');
				onConfirm();
			} catch (e) {
				console.error(e);
			} finally {
				setIsLoading(false);
			}
		},
		[userData],
	);

	return (
		<Dialog open={true} maxWidth={'md'} onClose={onClose}>
			<DialogTitle>Edit your profile</DialogTitle>
			<DialogContent style={{ width: '600px' }}>
				<FormContainer>
					<Controller
						control={control}
						name="avatar"
						render={({ field }) => (
							<UploadImage
								defaultAvatar={field.value ?? ''}
								uploadSuccess={(url) => {
									setIsUploading(false);
									field.onChange(url);
								}}
								uploading={() => setIsUploading(true)}
							/>
						)}
					/>
					<Controller
						control={control}
						name="name"
						render={({ field }) => <TextField label="Name" {...field} />}
					/>
					<Controller
						control={control}
						name="bio"
						render={({ field }) => <TextField label="Intro" multiline {...field} />}
					/>
				</FormContainer>
			</DialogContent>
			<DialogActions sx={{ gap: '8px', paddingRight: '24px' }}>
				<Button
					variant="outlined"
					size="small"
					style={{ minWidth: 'auto' }}
					onClick={onClose}
				>
					Cancel
				</Button>
				<LoadingButton
					variant="contained"
					size="small"
					disabled={isUploading || !isDirty}
					loading={isLoading}
					onClick={handleSubmit(handleConfirm)}
					style={{ minWidth: 'auto' }}
				>
					Confirm
				</LoadingButton>
			</DialogActions>
		</Dialog>
	);
}
