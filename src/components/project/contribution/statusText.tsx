import { Typography } from '@mui/material';
import { useEffect, useMemo, useState } from 'react';

import { IContribution, Status } from '@/services/types';
import useCountdown from '@/hooks/useCountdown';
import { showToast } from '@/store/utils';

export interface IStatusTextProps {
	contribution: IContribution;
	onClaim: () => void;
	hasVoted: boolean;
	votePass: boolean;
	targetTime: number;
}

enum StatusColorEnum {
	GRAY = '#64748B',
	GREEN = '#0A9B80',
	RED = '#D32F2F',
}

const StatusText = ({
	contribution,
	onClaim,
	hasVoted,
	targetTime,
	votePass,
}: IStatusTextProps) => {
	const { status } = contribution;
	const { days, hours, minutes, seconds, isEnd } = useCountdown(targetTime);
	const [countdownText, setCountdownText] = useState('');

	const [showText, setShowText] = useState('');
	const [color, setColor] = useState(StatusColorEnum.GRAY);
	const [cursor, setCursor] = useState('wait');

	useEffect(() => {
		setCountdownText(getCountDownText(days, hours, minutes, seconds));
	}, [days, hours, minutes, seconds]);

	useEffect(() => {
		if (status === Status.UNREADY) {
			setShowText('Vote preparation in progress');
			setCursor('wait');
			setColor(StatusColorEnum.GRAY);
		} else if (status === Status.CLAIM) {
			setShowText('Claimed');
			setCursor('not-allowed');
			setColor(StatusColorEnum.GRAY);
		} else {
			if (isEnd) {
				if (votePass) {
					setShowText('To be claimed');
					setCursor('pointer');
					setColor(StatusColorEnum.GREEN);
				} else {
					setShowText('Rejected');
					setCursor('not-allowed');
					setColor(StatusColorEnum.RED);
				}
			} else {
				setShowText(countdownText);
				setColor(StatusColorEnum.GRAY);
				setCursor('not-allowed');
			}
		}
	}, [status, hasVoted, isEnd, countdownText, votePass]);

	const getCountDownText = (days: number, hours: number, minutes: number, seconds: number) => {
		if (days <= 0 && hours <= 0 && minutes <= 0 && seconds <= 0) {
			return 'Vote ended';
		}
		if (days > 0) {
			return `Vote ends in ${days}d ${hours}h`;
		} else if (hours > 0) {
			return `Vote ends in ${hours}h ${minutes}m`;
		} else if (minutes > 0) {
			return `Vote ends in ${minutes}m ${seconds}s`;
		} else if (seconds > 0) {
			return `Vote ends in ${seconds}s`;
		} else {
			return 'Vote is ended';
		}
	};

	const handleClaim = () => {
		if (!isEnd) {
			showToast(`Can't claim before the voting period has ended`, 'error');
			return false;
		}
		if (!hasVoted) {
			showToast('No votes have been recorded for this contribution', 'error');
			return false;
		}
		// 	TODO 如果投票数不通过(同一个人只有一票)
		if (status === Status.READY) {
			onClaim();
		}
	};

	return (
		<Typography variant={'body2'} color={color} sx={{ cursor: cursor }} onClick={handleClaim}>
			{showText}
		</Typography>
	);
};

export default StatusText;
