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

export const EAS_CHAIN_CONFIGS: EASChainConfig[] = [
	{
		chainId: 1,
		chainName: 'mainnet',
		subdomain: '',
		version: '0.26',
		contractAddress: '0xA1207F3BBa224E2c9c3c6D5aF63D0eb1582Ce587',
		schemaRegistryAddress: '0xA7b39296258348C78294F95B872b282326A97BDF',
		etherscanURL: 'https://etherscan.io',
		rpcProvider: `https://eth-mainnet.g.alchemy.com/v2`,
		graphQLEndpoint: 'https://easscan.org/graphql',
	},
	{
		chainId: 10,
		chainName: 'optimism',
		subdomain: 'optimism.',
		version: '1.0.1',
		contractAddress: '0x4200000000000000000000000000000000000021',
		schemaRegistryAddress: '0x4200000000000000000000000000000000000020',
		etherscanURL: 'https://optimism.easscan.org',
		rpcProvider: 'https://opt-mainnet.g.alchemy.com/v2',
		graphQLEndpoint: 'https://optimism.easscan.org/graphql'
	},
	{
		chainId: 420,
		chainName: 'goerli-optimism',
		subdomain: 'optimism-goerli-bedrock.',
		version: '1.0.1',
		contractAddress: '0x4200000000000000000000000000000000000021',
		schemaRegistryAddress: '0x4200000000000000000000000000000000000020',
		etherscanURL: 'https://optimism-goerli-bedrock.easscan.org',
		rpcProvider: `https://opt-goerli.g.alchemy.com/v2`,
		graphQLEndpoint: 'https://optimism-goerli-bedrock.easscan.org/graphql',
	},
];

export const EasSchemaMap = {
	// contribution: '0xa7dca651e011d44363742bddfde1f72c5cec536858589b89778efc5bcdff868b',
	// vote: '0x1654a49365e83e920d7444dc48423cf16be33f9f902dca8500d00766cb9b8fd2',
	// claim: '0x7cc6a5995560f61cf4f77c00facfc83f93ec3ca95aad9a57e80504efb92a438a',
	contribution: process.env.NEXT_PUBLIC_EAS_SCHEMA_CONTRIBUTION as string,
	vote: process.env.NEXT_PUBLIC_EAS_SCHEMA_VOTE as string,
	claim: process.env.NEXT_PUBLIC_EAS_SCHEMA_CLAIM as string,
};

export const EasSchemaTemplateMap = {
	contribution:
		'address ProjectAddress, uint64 ContributionID, string Detail, string Type, string Proof, uint256 Token',
	vote: 'address ProjectAddress, uint64 ContributionID, uint8 VoteChoice, string Comment',
	claim: 'address ProjectAddress, uint64 ContributionID, address[] Voters, uint8[] VoteChoices, address Recipient, uint256 Token, bytes Signatures',
};

export type EasSchemaContributionKey =
	| 'ProjectAddress'
	| 'ContributionID'
	| 'Detail'
	| 'Type'
	| 'Proof'
	| 'Token';
export type EasSchemaVoteKey = 'ProjectAddress' | 'ContributionID' | 'VoteChoice' | 'Comment';
export type EasSchemaClaimKey =
	| 'ProjectAddress'
	| 'ContributionID'
	| 'Voters'
	| 'VoteChoices'
	| 'Recipient'
	| 'Token'
	| 'Signatures';

export type EasSchemaData<T> = {
	name: T;
	value: any;
	type: string;
};
