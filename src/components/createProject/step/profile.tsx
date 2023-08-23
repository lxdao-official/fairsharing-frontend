import { Button, TextField, Typography } from '@mui/material';
import React, { forwardRef, useImperativeHandle, useState } from 'react';

import { IStepBaseProps, IStepStartProps } from '@/components/createProject/step/start';

export interface IStepProfileProps extends IStepBaseProps {}

export interface StepProfileRef {
	getFormData: () => {
		name: string;
		intro: string;
	};
}

const StepProfile = forwardRef<StepProfileRef, IStepProfileProps>(
	(props: IStepProfileProps, ref) => {
		const { step, setActiveStep } = props;
		const [name, setName] = useState('Default Name');
		const [intro, setIntro] = useState('Default Intro');
		const [nameError, setNameError] = useState(false);
		const [introError, setIntroError] = useState(false);

		// 通过 useImperativeHandle 定义父组件可以调用的方法
		useImperativeHandle(
			ref,
			() => ({
				getFormData: () => ({ name, intro }),
			}),
			[name, intro],
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

			// 在这里执行提交逻辑
			console.log('Form submitted:', { name, intro });
			setActiveStep(step + 1);
		};

		return (
			<>
				{/*TODO avatar */}

				<Typography>TODO: avatar</Typography>

				<TextField
					required
					label="Name"
					value={name}
					placeholder={''}
					onChange={handleNameInputChange}
					sx={{ display: 'block', marginTop: '40px' }}
					error={nameError}
					helperText={'Name is required'}
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
					helperText={'Intro is required'}
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
