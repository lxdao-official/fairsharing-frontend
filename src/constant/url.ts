import { isProd } from '@/constant/env';

export const scanUrl = isProd
	? 'https://optimistic.etherscan.io/'
	: 'https://goerli-optimism.etherscan.io/';
