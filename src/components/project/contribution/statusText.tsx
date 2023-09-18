import { Typography } from '@mui/material';
import { useEffect, useMemo, useState } from 'react';

import { formatDistanceToNow, isFuture } from 'date-fns';

import { IContribution, Status } from '@/services/types';
import useCountdown from '@/hooks/useCountdown';
import { showToast } from '@/store/utils';

export interface IStatusTextProps {
	contribution: IContribution;
	onClaim: () => void;
	period: string;
	hasVoted: boolean;
}

const StatusColor = {
	[Status.UNREADY]: '#64748B',
	[Status.READY]: '#0A9B80',
	[Status.CLAIM]: '#64748B',
};

const CursorStatus = {
	[Status.UNREADY]: 'wait',
	[Status.READY]: 'pointer',
	[Status.CLAIM]: 'not-allowed',
};

const StatusText = ({ contribution, onClaim, period, hasVoted }: IStatusTextProps) => {
	const { status } = contribution;
	const { days, hours, minutes, seconds } = useCountdown(Number(period));
	const [countdownText, setCountdownText] = useState('');

	useEffect(() => {
		setCountdownText(getCountDownText(days, hours, minutes, seconds));
	}, [days, hours, minutes, seconds]);

	const text = useMemo(() => {
		if (status === Status.CLAIM) {
			return 'Claimed';
		} else if (status === Status.READY) {
			// TODO 投过票后才设置为claim
			if (!hasVoted) {
				return countdownText;
			} else {
				return 'To be claimed';
			}
		} else {
			return countdownText;
		}
	}, [status, period, countdownText, hasVoted]);

	const getCountDownText = (days: number, hours: number, minutes: number, seconds: number) => {
		if (days === 0 && hours === 0 && minutes === 0 && seconds === 0) {
			return 'Vote ended';
		}
		if (days > 0) {
			return `Vote ends in ${days}d ${hours}h`;
		} else if (hours > 0) {
			return `Vote ends in ${hours}h ${minutes}m`;
		} else if (minutes > 0) {
			return `Vote ends in ${minutes}m ${seconds}s`;
		} else {
			return `Vote ends in ${seconds}s`;
		}
	};

	const handleClaim = () => {
		if (!hasVoted) {
			showToast('No votes have been recorded for this contribution', 'error');
			return false;
		}
		if (status === Status.READY) {
			onClaim();
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
