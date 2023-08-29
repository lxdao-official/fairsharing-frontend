import Image from 'next/image';

import { Typography } from '@mui/material';

import { IContribution } from '@/services/types';
import { StyledFlexBox } from '@/components/styledComponents';

export enum VoteTypeEnum {
	FOR = 'FOR',
	AGAINST = 'AGAINST',
	ABSTAIN = 'ABSTAIN',
}

export enum VoteStatus {
	DONE = 'DONE',
	NORMAL = 'NORMAL',
	DISABLED = 'DISABLED',
}

export interface IVoteActionProps {
	type: VoteTypeEnum;
	status: VoteStatus;
	count: number;
	contribution: IContribution;
	onConfirm: () => void;
}

// TODO API 个人是否已经投过票
const VoteActionIcon: Record<VoteTypeEnum, Record<VoteStatus, string>> = {
	[VoteTypeEnum.FOR]: {
		[VoteStatus.DONE]: '/images/vote_for_done.png',
		[VoteStatus.NORMAL]: '/images/vote_for_normal.png',
		[VoteStatus.DISABLED]: '/images/vote_for_disabled.png',
	},
	[VoteTypeEnum.AGAINST]: {
		[VoteStatus.DONE]: '/images/vote_against_done.png',
		[VoteStatus.NORMAL]: '/images/vote_against_normal.png',
		[VoteStatus.DISABLED]: '/images/vote_against_disabled.png',
	},
	[VoteTypeEnum.ABSTAIN]: {
		[VoteStatus.DONE]: '/images/vote_abstain_done.png',
		[VoteStatus.NORMAL]: '/images/vote_abstain_normal.png',
		[VoteStatus.DISABLED]: '/images/vote_abstain_disabled.png',
	},
};

const Colors = {
	[VoteStatus.DONE]: '#0F172A',
	[VoteStatus.NORMAL]: '#64748B',
	[VoteStatus.DISABLED]: 'rgba(100, 116, 139, .5)',
};

const VoteAction = ({ type, status, count, onConfirm }: IVoteActionProps) => {
	return (
		<StyledFlexBox
			sx={{
				marginRight: '24px',
				cursor: 'pointer',
				opacity: status === VoteStatus.DISABLED ? '0.5' : '1',
			}}
		>
			<Image src={VoteActionIcon[type][status]} width={20} height={20} alt={''} />
			<Typography
				variant={'body2'}
				style={{ marginLeft: '8px', fontWeight: 'bold', color: Colors[status] }}
			>
				{count}
			</Typography>
		</StyledFlexBox>
	);
};

export default VoteAction;
