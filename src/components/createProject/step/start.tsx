'use client';

import { Button, List, ListItem, ListItemIcon, ListItemText, Typography } from '@mui/material';
import CircleIcon from '@mui/icons-material/Circle';
import { useConnectModal } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';

const StartTip = [
	'For a project, we facilitate it by recording contributions and ensuring fair allocation.',
	'For an individual, We empower you by taking ownership of your contributions and rewards.',
];

export interface IStepBaseProps {
	step: number;
	setActiveStep: (step: number) => void;
	onCreateProject?: () => void;
}

export interface IStepStartProps extends IStepBaseProps {}

const StepStart = ({ step, setActiveStep }: IStepStartProps) => {
	const { openConnectModal } = useConnectModal();
	const { address } = useAccount();

	const onClickStart = () => {
		if (!address) {
			openConnectModal?.();
			return false;
		}
		setActiveStep(step + 1);
	};

	return (
		<>
			<Typography variant={'subtitle1'} style={{ fontWeight: 'bold' }}>
				FairSharing is revolutionizing the way humans collaborate and allocate.
			</Typography>
			<List>
				{StartTip.map((item, index) => (
					<ListItem key={index} sx={{ padding: '0' }}>
						<ListItemIcon sx={{ minWidth: '16px' }}>
							<CircleIcon sx={{ color: '#475569', fontSize: 5 }} />
						</ListItemIcon>
						<ListItemText
							sx={{ margin: 0 }}
							primary={
								<Typography variant="body1" color={'#475569'}>
									{item}
								</Typography>
							}
						/>
					</ListItem>
				))}
			</List>
			<Button variant={'contained'} sx={{ marginTop: '40px' }} onClick={onClickStart}>
				Get started
			</Button>
		</>
	);
};

export default StepStart;
