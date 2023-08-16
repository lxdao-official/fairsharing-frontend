'use client';

import {
	Box,
	Button,
	Container,
	Paper,
	Step,
	StepContent,
	StepLabel,
	Stepper,
	Typography,
} from '@mui/material';
import { useState } from 'react';

import ProjectDetail from '@/components/project/detail';

const steps = [
	{
		label: 'Getting started',
	},
	{
		label: 'Profile',
		description: '',
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

	const handleNext = () => {
		setActiveStep((prevActiveStep) => prevActiveStep + 1);
	};

	const handleBack = () => {
		setActiveStep((prevActiveStep) => prevActiveStep - 1);
	};

	const handleReset = () => {
		setActiveStep(0);
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
						<Step key={step.label}>
							<StepLabel
								optional={
									index === 2 ? (
										<Typography variant="caption">Last step</Typography>
									) : null
								}
							>
								{step.label}
							</StepLabel>
							<StepContent>
								<Typography>{step.description}</Typography>
								<Box sx={{ mb: 2 }}>
									<div>
										<Button
											variant="contained"
											onClick={handleNext}
											sx={{ mt: 1, mr: 1 }}
										>
											{index === steps.length - 1 ? 'Finish' : 'Continue'}
										</Button>
										<Button
											disabled={index === 0}
											onClick={handleBack}
											sx={{ mt: 1, mr: 1 }}
										>
											Back
										</Button>
									</div>
								</Box>
							</StepContent>
						</Step>
					))}
				</Stepper>
				{activeStep === steps.length && (
					<Paper square elevation={0} sx={{ p: 3 }}>
						<Typography>All steps completed - you&apos;re finished</Typography>
						<Button onClick={handleReset} sx={{ mt: 1, mr: 1 }}>
							Reset
						</Button>
					</Paper>
				)}
			</Box>
			<Box sx={{ flex: 1, maxWidth: '860px' }}>
				<Typography variant={'h2'} style={{ fontWeight: 'bold' }}>
					Create a project
				</Typography>
				<ProjectDetail />
			</Box>
		</Container>
	);
}
