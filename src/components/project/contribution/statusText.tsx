import { Typography } from '@mui/material';
import { useEffect, useMemo, useState } from 'react';

import { IContribution, Status } from '@/services/types';
import { showToast } from '@/store/utils';
import { ITimeLeft } from '@/hooks/useCountdownTime';

export interface IStatusTextProps {
	contribution: IContribution;
	onClaim: () => void;
	hasVoted: boolean;
	votePass: boolean;
	isEnd: boolean;
	timeLeft: ITimeLeft;
	isVoteResultFetched: boolean;
}

enum StatusColorEnum {
	GRAY = '#64748B',
	GREEN = '#0A9B80',
	RED = '#D32F2F',
}

const StatusText = (props: IStatusTextProps) => {
	const { contribution, onClaim, hasVoted, votePass, timeLeft, isEnd, isVoteResultFetched } =
		props;

	const { status } = contribution;
	const [showText, setShowText] = useState('');
	const [color, setColor] = useState(StatusColorEnum.GRAY);
	const [cursor, setCursor] = useState('wait');

	const countdownText = useMemo(() => {
		const { days, hours, minutes, seconds } = timeLeft;
		if (isEnd) {
			return 'Vote ended';
		}
		if (days > 0) {
			return `Vote ends in ${days}d ${hours}h`;
		} else if (hours > 0) {
			return `Vote ends in ${hours}h ${minutes}m`;
		} else if (minutes > 0) {
			return `Vote ends in ${minutes}m`;
		} else if (seconds > 0) {
			return `Vote ends in 1m`;
		} else {
			return 'Vote is ended';
		}
	}, [timeLeft, isEnd]);

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
				if (!isVoteResultFetched) {
					setShowText('Checking status');
					setCursor('not-allowed');
					setColor(StatusColorEnum.GRAY);
				} else {
					if (votePass) {
						setShowText('To be claimed');
						setCursor('pointer');
						setColor(StatusColorEnum.GREEN);
					} else {
						setShowText('Rejected');
						setCursor('not-allowed');
						setColor(StatusColorEnum.RED);
					}
				}
			} else {
				setShowText(countdownText);
				setColor(StatusColorEnum.GRAY);
				setCursor('not-allowed');
			}
		}
	}, [status, isEnd, countdownText, votePass, isVoteResultFetched]);

	const handleClaim = () => {
		if (!isEnd) {
			showToast(`You can claim once the vote has ended`, 'error');
			return false;
		}
		if (!hasVoted) {
			showToast('No votes cast for this contribution', 'error');
			return false;
		}
		if (!votePass) {
			return false;
		}
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
