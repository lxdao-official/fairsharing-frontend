import { VoteApproveEnum, VoteSystemEnum } from '@/services';
import { VoteStrategyABIMap, VoteStrategyMap } from '@/constant/contract';


export function getVoteStrategyABI(voteApproveType: VoteApproveEnum) {
	if (voteApproveType === VoteApproveEnum.DEFAULT) {
		return VoteStrategyABIMap.RelativeV1;
	} else if (voteApproveType === VoteApproveEnum.RELATIVE2) {
		return VoteStrategyABIMap.RelativeV2;
	} else if (voteApproveType === VoteApproveEnum.ABSOLUTE1) {
		return VoteStrategyABIMap.AbsoluteV1;
	} else if (voteApproveType === VoteApproveEnum.ABSOLUTE2) {
		return VoteStrategyABIMap.AbsoluteV2;
	} else {
		return VoteStrategyABIMap.RelativeV1;
	}
}

export function getVoteStrategyContract(voteApproveType: VoteApproveEnum): string {
	if (voteApproveType === VoteApproveEnum.DEFAULT) {
		return VoteStrategyMap.RelativeV1;
	} else if (voteApproveType === VoteApproveEnum.RELATIVE2) {
		return VoteStrategyMap.RelativeV2;
	} else if (voteApproveType === VoteApproveEnum.ABSOLUTE1) {
		return VoteStrategyMap.AbsoluteV1;
	} else if (voteApproveType === VoteApproveEnum.ABSOLUTE2) {
		return VoteStrategyMap.AbsoluteV2;
	} else {
		return VoteStrategyMap.RelativeV1;
	}
}

export function getVoteThreshold(voteApproveType: VoteApproveEnum, forWeightOfTotal: number | string, differWeightOfTotal: number | string) {
	let voteThreshold = 50;
	if (voteApproveType === VoteApproveEnum.ABSOLUTE1) {
		voteThreshold = Number(forWeightOfTotal);
	} else if (voteApproveType === VoteApproveEnum.ABSOLUTE2) {
		voteThreshold = Number(differWeightOfTotal);
	}
	return voteThreshold;
}

export function getVoteWeights(voteSystem: VoteSystemEnum, voteWeights: number[], memberNum: number) {
	if (voteSystem === VoteSystemEnum.EQUAL) {
		const weight = Math.floor(100 / memberNum);
		return Array(memberNum).fill(weight);
	} else {
		return voteWeights;
	}
}
