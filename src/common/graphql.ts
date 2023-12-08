import https from 'https';

import axios from 'axios';

import { EAS_CHAIN_CONFIGS } from '@/constant/eas';

const client = axios.create({
	timeout: 5000,
	httpsAgent: new https.Agent({
		rejectUnauthorized: false,
	}),
	headers: { 'Content-Type': 'application/json' },
});

client.interceptors.response.use(
	(response) => {
		const { data } = response ?? {};
		if (data.data) {
			return data.data;
		}
		return Promise.reject(response);
	},
	(error) => {
		return Promise.reject(error);
	},
);

export const fetchGraphqlData = async <T>(chainId: number, query: string): Promise<T> => {
	return client.request({
		method: 'POST',
		url: getGraphEndpoint(chainId),
		data: { query },
	});
};

export const getGraphEndpoint = (chainId: number) => {
	const activeChainConfig = EAS_CHAIN_CONFIGS.find((config) => config.chainId === chainId);
	return activeChainConfig!.graphQLEndpoint;
};
