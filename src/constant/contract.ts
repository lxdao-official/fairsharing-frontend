import { isProd } from '@/constant/env';

export interface EASChainConfig {
	chainId: number;
	chainName: string;
	version: string;
	contractAddress: string;
	schemaRegistryAddress: string;
	etherscanURL: string;
	/** Must contain a trailing dot (unless mainnet). */
	subdomain: string;
	rpcProvider: string;
	graphQLEndpoint: string;
}

export interface IContractConfig {
	schema: {
		contribution: string,
		vote: string,
		claim: string,
	},
	projectRegisterUpgradeableProxy: string,
	voteStrategyMap: {
		RelativeV1: string,
		RelativeV2: string,
		AbsoluteV1: string,
		AbsoluteV2: string
	},
	easChainConfig: EASChainConfig
}

export type IChainType = 'Optimism' | 'OptimismSepolia' | 'OptimismGoerli'

export const ContractConfigMap: Record<IChainType, IContractConfig> = {
	Optimism: {
		schema: {
			contribution: process.env.NEXT_PUBLIC_EAS_SCHEMA_CONTRIBUTION as string,
			vote: process.env.NEXT_PUBLIC_EAS_SCHEMA_VOTE as string,
			claim: process.env.NEXT_PUBLIC_EAS_SCHEMA_CLAIM as string,
		},
		projectRegisterUpgradeableProxy: process.env.NEXT_PUBLIC_CONTRACT_PROJECT_REGISTER as string,
		voteStrategyMap: {
			RelativeV1: process.env.NEXT_PUBLIC_CONTRACT_VOTE_STRATEGY_RELATIVE_V1 as string,
			RelativeV2: process.env.NEXT_PUBLIC_CONTRACT_VOTE_STRATEGY_RELATIVE_V2 as string,
			AbsoluteV1: process.env.NEXT_PUBLIC_CONTRACT_VOTE_STRATEGY_ABSOLUTE_V1 as string,
			AbsoluteV2: process.env.NEXT_PUBLIC_CONTRACT_VOTE_STRATEGY_ABSOLUTE_V2 as string,
		},
		easChainConfig: {
			chainId: 10,
			chainName: 'optimism',
			subdomain: 'optimism.',
			version: '1.0.1',
			contractAddress: '0x4200000000000000000000000000000000000021',
			schemaRegistryAddress: '0x4200000000000000000000000000000000000020',
			etherscanURL: 'https://optimism.easscan.org',
			rpcProvider: 'https://opt-mainnet.g.alchemy.com/v2',
			graphQLEndpoint: 'https://optimism.easscan.org/graphql',
		}
	},
	OptimismSepolia: {
		schema: {
			contribution: '0xa429ad803ae12a0fcb9c0c130673a4c7357da08e1407b62bce5cfe358d673526',
			vote: '0x6e4068d80a37bc2fb9223e2f07b909b98b370d76b1d94cd83c1a64bb6006a9e5',
			claim: '0x957c1ce9579ea03fcd9e08f0ef9d0ef4ba3ca67f7b459655bcf87a060fd772ca',
		},
		projectRegisterUpgradeableProxy: '0x9B2A807084B7a6ECD646a1dFc217dfAaDBEFEF10',
		voteStrategyMap: {
			RelativeV1: '0x7c0a966f373a3935D51fa29a239FC54e1d981aA6',
			RelativeV2: '0x4911fC85BfED269f7A37214028CF428C637Bc196',
			AbsoluteV1: '0x9843cdD2F79723596df556068759cDA510602b92',
			AbsoluteV2: '0xe5ffAF764995fD864651bb71f4bb1d6ffe17665F'
		},
		// https://docs.optimism.io/chain/networks
		easChainConfig: {
			chainId: 11155420,
			chainName: 'optimism-sepolia',
			subdomain: 'optimism-sepolia.',
			version: '1.0.2',
			contractAddress: '0x4200000000000000000000000000000000000021',
			schemaRegistryAddress: '0x4200000000000000000000000000000000000020',
			etherscanURL: 'https://optimism-sepolia.easscan.org',
			rpcProvider: `https://sepolia.optimism.io`,
			graphQLEndpoint: 'https://optimism-sepolia.easscan.org/graphql',
		}
	},
	OptimismGoerli: {
		schema: {
			contribution: '0x0228657dc20f814b0770867d1a85ac473a0dc393c52603ef318bdab79dd9ea63',
			vote: '0xe045889447a1b5ec1e4771b23e89f38f1cf379ec2e708e1789dfbf4739cdf56f',
			claim: '0x4670eabb8d0ed4d28ed4b411defaf202695497dd78f32627dd77d3a0c4c00024',
		},
		projectRegisterUpgradeableProxy: '0x5AeA8cbF64f9Cc353E56D1EC1bEE2D49b3e4a24f',
		voteStrategyMap: {
			RelativeV1: '0xCdff95c4a99c1A645D6Be65c01be027cFE8cDC26',
			RelativeV2: '0xD52A7eF9E7736506988c3B9b1a7Ffde451a236f7',
			AbsoluteV1: '0xE0289920f9aB0d1303e6c53CE3A124509fbe55e1',
			AbsoluteV2: '0xF919c9C0345f381de69EAA89ED20791Aca00CFcE'
		},
		easChainConfig: {
			chainId: 420,
			chainName: 'goerli-optimism',
			subdomain: 'optimism-goerli-bedrock.',
			version: '1.0.1',
			contractAddress: '0x4200000000000000000000000000000000000021',
			schemaRegistryAddress: '0x4200000000000000000000000000000000000020',
			etherscanURL: 'https://optimism-goerli-bedrock.easscan.org',
			rpcProvider: `https://opt-goerli.g.alchemy.com/v2`,
			graphQLEndpoint: 'https://optimism-goerli-bedrock.easscan.org/graphql',
		}
	}
}
export const EAS_CHAIN_CONFIGS: EASChainConfig[] = [
	ContractConfigMap.Optimism.easChainConfig,
	ContractConfigMap.OptimismGoerli.easChainConfig,
	ContractConfigMap.OptimismSepolia.easChainConfig
];

export const DefaultContractConfig = isProd ? ContractConfigMap.Optimism : ContractConfigMap.OptimismSepolia
export const DefaultEasChainConfig = DefaultContractConfig.easChainConfig

/**
 * 本地开发使用.env.local里的变量, 线上从 vercel 获取环境变量
 */
export const EasSchemaMap = {
	contribution: process.env.NEXT_PUBLIC_EAS_SCHEMA_CONTRIBUTION as string,
	vote: process.env.NEXT_PUBLIC_EAS_SCHEMA_VOTE as string,
	claim: process.env.NEXT_PUBLIC_EAS_SCHEMA_CLAIM as string,
};

export const EasSchemaTemplateMap = {
	contribution:
		'address ProjectAddress, bytes32 ContributionID, string Detail, string Type, string Proof, uint256 StartDate, uint256 EndDate, uint256 TokenAmount, string Extended',
	vote: 'address ProjectAddress, bytes32 ContributionID, uint8 VoteChoice, string Comment',
	claim: 'address ProjectAddress, bytes32 ContributionID, address[] Voters, uint8[] VoteChoices, address Recipient, uint256 TokenAmount, bytes Signatures',
};

export type EasSchemaContributionKey =
	| 'ProjectAddress'
	| 'ContributionID'
	| 'Detail'
	| 'Type'
	| 'Proof'
	| 'StartDate'
	| 'EndDate'
	| 'TokenAmount'
	| 'Extended';
export type EasSchemaVoteKey = 'ProjectAddress' | 'ContributionID' | 'VoteChoice' | 'Comment';
export type EasSchemaClaimKey =
	| 'ProjectAddress'
	| 'ContributionID'
	| 'Voters'
	| 'VoteChoices'
	| 'Recipient'
	| 'TokenAmount'
	| 'Signatures';

export type EasSchemaData<T> = {
	name: T;
	value: any;
	type: string;
};
