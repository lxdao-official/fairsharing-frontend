'use client';

import {
	Box,
	Button,
	Container,
	List,
	ListItem,
	ListItemIcon,
	ListItemText,
	Paper,
	Step,
	StepLabel,
	Stepper,
	Typography,
} from '@mui/material';
import CircleIcon from '@mui/icons-material/Circle';
import { createContext, ReactNode, useContext, useRef, useState } from 'react';

import StepStart from '@/components/createProject/step/start';
import StepStrategy, { StepStrategyRef } from '@/components/createProject/step/strategy';
import StepProfile, { StepProfileRef } from '@/components/createProject/step/profile';
import StepContributor from '@/components/createProject/step/contributor';

const steps = [
	{
		label: 'Getting started',
	},
	{
		label: 'Profile',
	},
	{
		label: 'Strategy',
	},
	{
		label: 'Contributors',
	},
];

export default function Page() {
	const [activeStep, setActiveStep] = useState(0);

	const stepProfileRef = useRef<StepProfileRef | null>(null);
	const stepStrategyRef = useRef<StepStrategyRef | null>(null);
	const handleGetFormData = () => {
		const profileFormData = stepProfileRef.current?.getFormData();
		const strategyFormData = stepStrategyRef.current?.getFormData();
		console.log('profileFormData Form Data:', profileFormData);
		console.log('strategyFormData Form Data:', strategyFormData);
	};

	return (
		<Container
			maxWidth={'xl'}
			sx={{
				display: 'flex',
				justifyContent: 'center',
				alignItems: 'flex-start',
				paddingTop: '56px',
			}}
		>
			<Box sx={{ maxWidth: 200 }}>
				<Stepper activeStep={activeStep} orientation="vertical">
					{steps.map((step, index) => (
						<Step sx={{ cursor: 'pointer' }} key={step.label}>
							<StepLabel onClick={() => setActiveStep(index)}>{step.label}</StepLabel>
						</Step>
					))}
				</Stepper>
			</Box>
			<Box sx={{ flex: 1, maxWidth: '860px', minWidth: '400px', marginLeft: '40px' }}>
				<Typography variant={'h2'} style={{ fontWeight: 'bold', marginBottom: '32px' }}>
					Create a project
				</Typography>
				<Button onClick={handleGetFormData}>console form data</Button>
				<StepContent step={0} activeStep={activeStep}>
					<StepStart step={0} setActiveStep={setActiveStep} />
				</StepContent>
				<StepContent step={1} activeStep={activeStep}>
					<StepProfile ref={stepProfileRef} step={1} setActiveStep={setActiveStep} />
				</StepContent>
				<StepContent step={2} activeStep={activeStep}>
					<StepStrategy ref={stepStrategyRef} step={2} setActiveStep={setActiveStep} />
				</StepContent>
				<StepContent step={3} activeStep={activeStep}>
					<StepContributor step={3} setActiveStep={setActiveStep} />
				</StepContent>
			</Box>
		</Container>
	);
}

function StepContent({
	step,
	children,
	activeStep,
}: {
	step: number;
	activeStep: number;
	children: ReactNode;
}) {
	return <div style={{ display: activeStep === step ? 'block' : 'none' }}>{children}</div>;
}
