'use client';

import { Box, Button, Container, Paper, Step, StepLabel, Stepper, Typography } from '@mui/material';
import { createContext, ReactNode, useContext, useState } from 'react';

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
			<Box sx={{ flex: 1, maxWidth: '860px', marginLeft: '40px' }}>
				<StepContent step={0} activeStep={activeStep}>
					<Typography variant={'h2'} style={{ fontWeight: 'bold' }}>
						Create a project
					</Typography>
				</StepContent>
				<StepContent step={1} activeStep={activeStep}>
					<Typography variant={'h2'} style={{ fontWeight: 'bold' }}>
						Profile
					</Typography>
				</StepContent>
				<StepContent step={2} activeStep={activeStep}>
					<Typography variant={'h2'} style={{ fontWeight: 'bold' }}>
						Strategy
					</Typography>
				</StepContent>
				<StepContent step={3} activeStep={activeStep}>
					<Typography variant={'h2'} style={{ fontWeight: 'bold' }}>
						Contributors
					</Typography>
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
