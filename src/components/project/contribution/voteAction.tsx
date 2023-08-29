import { IContribution } from '@/services/types';

export enum VoteTypeEnum {
	FOR = 'FOR',
	AGAINST = 'AGAINST',
	ABSTAIN = 'ABSTAIN',
}

export interface IVoteActionProps {
	type: VoteTypeEnum;
	contribution: IContribution;
	onConfirm: () => void;
}

// TODO API 个人是否已经投过票

const VoteAction = (props: IVoteActionProps) => {
	return 'VoteAction';
};

export default VoteAction;
