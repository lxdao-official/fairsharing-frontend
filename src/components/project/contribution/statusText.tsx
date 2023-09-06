import { Typography } from '@mui/material';
import { useMemo } from 'react';

import { IContribution, Status } from '@/services/types';

export interface IStatusTextProps {
	contribution: IContribution;
	onClaim: () => void;
}

const StatusColor = {
	[Status.UNREADY]: '#D32F2F',
	[Status.READY]: '#64748B',
	[Status.CLAIM]: '#0A9B80',
};

const StatusText = ({ contribution, onClaim }: IStatusTextProps) => {
	const { status } = contribution;

	const text = useMemo(() => {
		// if (status === Status.CLAIM) {
		// 	return 'Claimed';
		// } else if (status === Status.READY) {
		// 	return 'To be claimed';
		// } else {
		// 	return 'Vote ends in 6d 20h';
		// }
		// TODO use real status
		return 'To be claimed';
	}, [status]);

	return (
		<Typography
			variant={'body2'}
			color={StatusColor[Status.CLAIM]}
			sx={{ cursor: 'pointer' }}
			onClick={onClaim}
		>
			{text}
		</Typography>
	);
};

export default StatusText;
