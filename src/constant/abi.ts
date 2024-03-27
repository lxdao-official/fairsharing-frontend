// @ts-ignore
import project_register_abi = require('../../abi/project_register_abi.json');
// @ts-ignore
import project_abi = require('../../abi/project_abi.json');
// @ts-ignore
import vote_strategy_relative_v1_abi = require('../../abi/vote_strategy_relative_v1_abi.json');
// @ts-ignore
import vote_strategy_relative_v2_abi = require('../../abi/vote_strategy_relative_v2_abi.json');
// @ts-ignore
import vote_strategy_absolute_v1_abi = require('../../abi/vote_strategy_absolute_v1_abi.json');
// @ts-ignore
import vote_strategy_absolute_v2_abi = require('../../abi/vote_strategy_absolute_v2_abi.json');

export const ProjectRegisterABI = project_register_abi;
export const ProjectABI = project_abi;

export const VoteStrategyABIMap = {
	RelativeV1: vote_strategy_relative_v1_abi,
	RelativeV2: vote_strategy_relative_v2_abi,
	AbsoluteV1: vote_strategy_absolute_v1_abi,
	AbsoluteV2: vote_strategy_absolute_v2_abi,
};
