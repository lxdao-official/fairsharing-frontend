import { VoteApproveEnum, VoteSystemEnum } from '@/services';
import { VoteStrategyABIMap, VoteStrategyMap } from '@/constant/contract';

export function getVoteStrategyABI(voteApproveType: VoteApproveEnum) {
	const { RelativeV1, RelativeV2, AbsoluteV2, AbsoluteV1 } = VoteStrategyABIMap;
	switch (voteApproveType) {
		case VoteApproveEnum.ABSOLUTE1:
			return AbsoluteV1;
		case VoteApproveEnum.ABSOLUTE2:
			return AbsoluteV2;
		case VoteApproveEnum.RELATIVE2:
			return RelativeV2;
		default:
			return RelativeV1;
	}
}

export function getVoteStrategyContract(voteApproveType: VoteApproveEnum): string {
	const { RelativeV1, RelativeV2, AbsoluteV2, AbsoluteV1 } = VoteStrategyMap;
	switch (voteApproveType) {
		case VoteApproveEnum.ABSOLUTE1:
			return AbsoluteV1;
		case VoteApproveEnum.ABSOLUTE2:
			return AbsoluteV2;
		case VoteApproveEnum.RELATIVE2:
			return RelativeV2;
		default:
			return RelativeV1;
	}
}

export function getVoteThreshold(
	voteApproveType: VoteApproveEnum,
	forWeightOfTotal: number | string,
	differWeightOfTotal: number | string,
) {
	let voteThreshold = 50;
	if (voteApproveType === VoteApproveEnum.ABSOLUTE1) {
		voteThreshold = Number(forWeightOfTotal);
	} else if (voteApproveType === VoteApproveEnum.ABSOLUTE2) {
		voteThreshold = Number(differWeightOfTotal);
	}
	return voteThreshold;
}

export function getVoteWeights(
	voteSystem: VoteSystemEnum,
	voteWeights: number[],
	memberNum: number,
) {
	if (voteSystem === VoteSystemEnum.EQUAL) {
		const weight = Math.floor(100 / memberNum);
		return Array(memberNum).fill(weight);
	} else {
		return voteWeights;
	}
}
