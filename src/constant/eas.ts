// @ts-ignore
import project_register_abi = require('../../abi/project_register_abi.json');
// @ts-ignore
import project_abi = require('../../abi/project_abi.json');

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
	contribution: '0x90538b4421272d54351d6c867fc4575d0cc46b319d191a2ea39ba1a4fd89aa39',
	vote: '0x16798347274c3b96dce526092892afe07bb1e884a4a4208f976530ec97925780',
	claim: '0x584ad6d7183d0f29c4faaadf11c99d217b16a6bccd385ce3a5f4dda4a7b39467',
};

export const ProjectRegisterABI = project_register_abi;
export const ProjectABI = project_abi;
