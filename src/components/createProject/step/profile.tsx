import { TextareaAutosize, TextField, Typography } from '@mui/material';
import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useState } from 'react';

import { Img3 } from '@lxdao/img3';

import { IStepBaseProps } from '@/components/createProject/step/start';

import UploadImage from '@/components/uploadImage/uploadImage';
import { CreateProjectParams } from '@/services';
import ButtonGroup from '@/components/createProject/step/buttonGroup';
import { LogoImage } from '@/constant/img3';
import useProjectCache from '@/components/createProject/useProjectCache';

export interface IStepProfileProps extends Partial<IStepBaseProps> {
	data?: Pick<CreateProjectParams, 'intro' | 'logo' | 'name'>;
	onSave?: () => void;
	canEdit?: boolean;
}

export interface StepProfileFormData {
	name: string;
	intro: string;
	avatar: string;
}

export interface StepProfileRef {
	getFormData: () => StepProfileFormData;
}

const StepProfile = forwardRef<StepProfileRef, IStepProfileProps>(
	(props: IStepProfileProps, ref) => {
		const { step, setActiveStep, data, onSave, canEdit = true } = props;

		const { setCache, cache: createProjectCache } = useProjectCache();

		const [name, setName] = useState(data?.name ?? '');
		const [intro, setIntro] = useState(data?.intro ?? '');
		const [nameError, setNameError] = useState(false);
		const [introError, setIntroError] = useState(false);
		const [avatar, setAvatar] = useState(data?.logo ?? LogoImage);
		const [isEdited, setIsEdited] = useState(false);

		const isSettingPage = !!data;

		useImperativeHandle(
			ref,
			() => ({
				getFormData: () => ({ name, intro, avatar }),
			}),
			[name, intro, avatar],
		);

		useEffect(() => {
			if (!isSettingPage && createProjectCache?.profile) {
				setName(createProjectCache.profile.name);
				setIntro(createProjectCache.profile.intro);
				setAvatar(createProjectCache.profile.avatar);
			}
		}, []);

		const handleNameInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
			setIsEdited(true);
			setName(event.target.value);
			setNameError(false);
		};
		const handleIntroInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
			setIsEdited(true);
			setIntro(event.target.value);
			setIntroError(false);
		};

		const handleSubmit = (action: 'BACK' | 'NEXT') => {
			if (action === 'BACK') {
				setActiveStep!(step! - 1);
				return;
			}
			if (!name) {
				setNameError(true);
				return;
			}
			if (!intro) {
				setIntroError(true);
				return;
			}
			if (isSettingPage) {
				onSave!();
				setIsEdited(false);
			} else {
				setCache('profile', { name, intro, avatar });
				setActiveStep!(step! + 1);
			}
		};

		const uploadSuccess = (url: string) => {
			setIsEdited(true);
			setAvatar(url);
		};

		const handleClick = (type: 'primary' | 'secondary') => {
			if (isSettingPage) {
				if (type === 'primary') {
					handleSubmit('NEXT');
				} else {
					setIsEdited(false);
					setName(data?.name ?? '');
					setIntro(data?.intro ?? '');
					setAvatar(data?.logo ?? '');
				}
			} else {
				handleSubmit(type === 'primary' ? 'NEXT' : 'BACK');
			}
		};

		return (
			<>
				{!canEdit ? (
					<>
						<Typography>Avatar</Typography>
						<Img3
							src={avatar}
							alt="logo"
							style={{
								width: 80,
								height: 80,
								marginTop: 16,
								borderRadius: '50px',
								border: '1px solid rgba(15,23,42,0.12)',
							}}
						/>
					</>
				) : (
					<UploadImage defaultAvatar={avatar} uploadSuccess={uploadSuccess} />
				)}

				<TextField
					required
					label="Name"
					value={name}
					placeholder={''}
					onChange={handleNameInputChange}
					sx={{ display: 'block', marginTop: '32px', width: '300px' }}
					fullWidth={true}
					error={nameError}
					disabled={!canEdit}
				/>
				<TextField
					required
					label="Intro"
					value={intro}
					placeholder={''}
					onChange={handleIntroInputChange}
					sx={{ display: 'block', marginTop: '32px' }}
					fullWidth={true}
					error={introError}
					disabled={!canEdit}
					InputProps={{
						inputComponent: TextareaAutosize,
						minRows: 1,
						maxRows: 20,
					}}
				/>
				<ButtonGroup
					canEdit={canEdit}
					isEdited={isEdited}
					isSettingPage={isSettingPage}
					handlePrimary={() => handleClick('primary')}
					handleSecondary={() => handleClick('secondary')}
				/>
			</>
		);
	},
);

StepProfile.displayName = 'StepProfile';

export default StepProfile;
