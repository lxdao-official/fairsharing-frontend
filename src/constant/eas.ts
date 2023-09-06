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
		chainId: 11155111,
		chainName: 'sepolia',
		subdomain: 'sepolia.',
		version: '0.26',
		contractAddress: '0xC2679fBD37d54388Ce493F1DB75320D236e1815e',
		schemaRegistryAddress: '0x0a7E2Ff54e76B8E6659aedc9103FB21c038050D0',
		etherscanURL: 'https://sepolia.etherscan.io',
		rpcProvider: `https://sepolia.infura.io/v3/`,
		graphQLEndpoint: 'https://sepolia.easscan.org/graphql',
	},
	{
		chainId: 1,
		chainName: 'mainnet',
		subdomain: '',
		version: '0.26',
		contractAddress: '0xA1207F3BBa224E2c9c3c6D5aF63D0eb1582Ce587',
		schemaRegistryAddress: '0xA7b39296258348C78294F95B872b282326A97BDF',
		etherscanURL: 'https://etherscan.io',
		rpcProvider: `https://mainnet.infura.io/v3/`,
		graphQLEndpoint: 'https://easscan.org/graphql',
	},
	{
		chainId: 420,
		chainName: 'goerli-optimism',
		subdomain: 'optimism-goerli-bedrock.',
		version: '1.0.1',
		contractAddress: '0x4200000000000000000000000000000000000021',
		schemaRegistryAddress: '0x4200000000000000000000000000000000000020',
		etherscanURL: 'https://optimism-goerli-bedrock.easscan.org',
		rpcProvider: `https://mainnet.infura.io/v3/`,
		graphQLEndpoint: 'https://optimism-goerli-bedrock.easscan.org/graphql',
	},
];

export const EasSchemaUidMap = {
	contribution: '0x446a57b67cc7459c9aa55a372b1395251db4f4732fff04f76c134f57a0409fe4',
	vote: '0x82280290eeca50f5d7bf7b75bdf1241c8dbd8ae41dda1dde5d32159c00003c12',
	claim: '0x0f11736c835bc2050b478961f250410274d2d6c1f821154e8fd66ef7eb61d986',
};
