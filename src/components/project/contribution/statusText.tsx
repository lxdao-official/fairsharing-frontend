import { IContribution, Status } from '@/services/types';
import { Typography } from '@mui/material';
import { useMemo } from 'react';

export interface IStatusTextProps {
	contribution: IContribution;
}

const StatusColor = {
	[Status.UNREADY]: '#D32F2F',
	[Status.READY]: '#0A9B80',
	[Status.CLAIM]: '#64748B',
};

const StatusText = ({ contribution }: IStatusTextProps) => {
	const { status } = contribution;

	const text = useMemo(() => {
		if (status === Status.CLAIM) {
			return 'Claimed';
		} else if (status === Status.READY) {
			return 'To be claimed';
		} else {
			return 'Vote ends in 6d 20h';
		}
	}, [status]);

	return (
		<Typography variant={'body2'} color={StatusColor[status]}>
			{text}
		</Typography>
	);
};

export default StatusText;
