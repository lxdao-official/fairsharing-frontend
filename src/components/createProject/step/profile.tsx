import { Button, TextField, Typography } from '@mui/material';
import React, { forwardRef, useImperativeHandle, useState } from 'react';

import { IStepBaseProps, IStepStartProps } from '@/components/createProject/step/start';

import UploadImage from '@/components/uploadImage/uploadImage';

export interface IStepProfileProps extends IStepBaseProps {}

export interface StepProfileRef {
	getFormData: () => {
		name: string;
		intro: string;
		avatar: string;
	};
}

const StepProfile = forwardRef<StepProfileRef, IStepProfileProps>(
	(props: IStepProfileProps, ref) => {
		const { step, setActiveStep } = props;
		const [name, setName] = useState('');
		const [intro, setIntro] = useState('');
		const [nameError, setNameError] = useState(false);
		const [introError, setIntroError] = useState(false);
		const [avatar, setAvatar] = useState(
			'https://bafkreig4ikgldw4nnfkflakfq43r7inam2bi52na2tngm5sxluqwwdqcim.ipfs.nftstorage.link/',
		);

		useImperativeHandle(
			ref,
			() => ({
				getFormData: () => ({ name, intro, avatar }),
			}),
			[name, intro, avatar],
		);

		const handleNameInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
			setName(event.target.value);
			setNameError(false);
		};
		const handleIntroInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
			setIntro(event.target.value);
			setIntroError(false);
		};

		const handleSubmit = () => {
			if (!name) {
				setNameError(true);
				return;
			}
			if (!intro) {
				setIntroError(true);
				return;
			}
			setActiveStep(step + 1);
		};

		const uploadSuccess = (url: string) => {
			setAvatar(url);
		};

		return (
			<>
				<UploadImage defaultAvatar={avatar} uploadSuccess={uploadSuccess} />

				<TextField
					required
					label="Name"
					value={name}
					placeholder={''}
					onChange={handleNameInputChange}
					sx={{ display: 'block', marginTop: '40px' }}
					error={nameError}
				/>
				<TextField
					required
					label="Intro"
					value={intro}
					placeholder={''}
					onChange={handleIntroInputChange}
					sx={{ display: 'block', marginTop: '40px' }}
					fullWidth={true}
					error={introError}
				/>
				<Button variant={'contained'} sx={{ marginTop: '40px' }} onClick={handleSubmit}>
					Next
				</Button>
			</>
		);
	},
);

StepProfile.displayName = 'StepProfile';

export default StepProfile;
