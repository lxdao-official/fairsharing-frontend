import { Typography } from '@mui/material';
import { useMemo } from 'react';

import { formatDistanceToNow, isFuture } from 'date-fns';

import { IContribution, Status } from '@/services/types';

export interface IStatusTextProps {
	contribution: IContribution;
	onClaim: () => void;
	period: string;
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

const StatusText = ({ contribution, onClaim, period }: IStatusTextProps) => {
	const { status } = contribution;

	const text = useMemo(() => {
		if (status === Status.CLAIM) {
			return 'Claimed';
		} else if (status === Status.READY) {
			return 'To be claimed';
		} else {
			if (isFuture(Number(period))) {
				const distance = formatDistanceToNow(Number(period));
				return `Vote ends in ${distance}`;
			} else {
				return 'Out of Date';
			}
		}
	}, [status, period]);

	const handleClaim = () => {
		if (status === Status.READY) {
			onClaim();
		} else {
			console.log('not in claim status');
		}
	};

	return (
		<Typography
			variant={'body2'}
			color={StatusColor[status]}
			sx={{ cursor: CursorStatus[status] }}
			onClick={handleClaim}
		>
			{text}
		</Typography>
	);
};

export default StatusText;
