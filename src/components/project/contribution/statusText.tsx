import { Typography } from '@mui/material';
import { useMemo } from 'react';

import { IContribution, Status } from '@/services/types';

export interface IStatusTextProps {
	contribution: IContribution;
	onClaim: () => void;
}

const StatusColor = {
	[Status.UNREADY]: '#D32F2F',
	[Status.READY]: '#0A9B80',
	[Status.CLAIM]: '#64748B',
};

const CursorStatus = {
	[Status.UNREADY]: 'wait',
	[Status.READY]: 'pointer',
	[Status.CLAIM]: 'not-allowed',
};

const StatusText = ({ contribution, onClaim }: IStatusTextProps) => {
	const { status } = contribution;

	const text = useMemo(() => {
		if (status === Status.CLAIM) {
			return 'Claimed';
		} else if (status === Status.READY) {
			return 'To be claimed';
		} else {
			// TODO 时间限制
			return 'Vote ends in 6d 20h';
		}
	}, [status]);

	return (
		<Typography
			variant={'body2'}
			color={StatusColor[status]}
			sx={{ cursor: CursorStatus[status] }}
			onClick={onClaim}
		>
			{text}
		</Typography>
	);
};

export default StatusText;
