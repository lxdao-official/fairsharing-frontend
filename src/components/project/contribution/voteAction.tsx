import { Tooltip, Typography } from '@mui/material';

import { useMemo } from 'react';

import { IContribution, Status } from '@/services/types';
import { StyledFlexBox } from '@/components/styledComponents';
import {
	AbstainDisabledIcon,
	AbstainIcon,
	AbstainReadyIcon,
	AgainstDisabledIcon,
	AgainstIcon,
	AgainstReadyIcon,
	ForDisabledIcon,
	ForIcon,
	ForReadyIcon,
} from '@/icons';

export enum VoteTypeEnum {
	FOR = 'FOR',
	AGAINST = 'AGAINST',
	ABSTAIN = 'ABSTAIN',
}

export interface IVoteActionProps {
	type: VoteTypeEnum;
	contributionStatus: Status;
	count: number;
	isEnd: boolean;
	contribution: IContribution;
	onConfirm: () => void;
	isUserVoted: boolean;
}

const Colors = {
	deep: '#0F172A',
	medium: '#64748B',
	light: 'rgba(100, 116, 139, .5)',
};

const tooltipTextMap = {
	[VoteTypeEnum.FOR]: 'For',
	[VoteTypeEnum.AGAINST]: 'Against',
	[VoteTypeEnum.ABSTAIN]: 'Abstain',
};

const IconMap = {
	FOR: {
		normal: <ForIcon />,
		ready: <ForReadyIcon />,
		disabled: <ForDisabledIcon />,
	},
	AGAINST: {
		normal: <AgainstIcon />,
		ready: <AgainstReadyIcon />,
		disabled: <AgainstDisabledIcon />,
	},
	ABSTAIN: {
		normal: <AbstainIcon />,
		ready: <AbstainReadyIcon />,
		disabled: <AbstainDisabledIcon />,
	},
};

const VoteAction = ({
	type,
	count,
	isEnd,
	onConfirm,
	contributionStatus,
	isUserVoted,
}: IVoteActionProps) => {
	const isVoteDisabled = useMemo(() => {
		return isEnd || contributionStatus === Status.UNREADY;
	}, [isEnd, contributionStatus]);

	const icon = useMemo(() => {
		// 2023.12.03 issue by daisy: 自己投过票 -> 面性, 不计算时间
		return isUserVoted ? IconMap[type].normal : IconMap[type].ready;
		// if (isEnd) {
		// 	return IconMap[type].disabled;
		// } else {
		// 	// 只有自己投过票的才是面性
		// 	return isUserVoted ? IconMap[type].normal : IconMap[type].ready;
		// }
	}, [type, isUserVoted]);

	const color = useMemo(() => {
		if (isVoteDisabled) {
			return Colors.light;
		} else {
			return count > 0 ? Colors.deep : Colors.medium;
		}
	}, [isVoteDisabled, count]);

	const handleClick = () => {
		if (isVoteDisabled) {
			return false;
		}
		onConfirm();
	};

	return (
		<Tooltip title={tooltipTextMap[type]}>
			<StyledFlexBox
				sx={{
					marginRight: '24px',
					cursor: isVoteDisabled ? 'not-allowed' : 'pointer',
					opacity: isVoteDisabled ? '0.5' : '1',
				}}
				onClick={handleClick}
			>
				{icon}
				<Typography
					variant={'body2'}
					style={{ marginLeft: '8px', fontWeight: 'bold', color }}
				>
					{count}
				</Typography>
			</StyledFlexBox>
		</Tooltip>
	);
};

export default VoteAction;
