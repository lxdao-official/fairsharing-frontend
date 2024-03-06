'use client';

import * as React from 'react';
import '@rainbow-me/rainbowkit/styles.css';
import {
	RainbowKitProvider, getDefaultConfig,
} from '@rainbow-me/rainbowkit';

import { WagmiProvider } from 'wagmi';
import {
	optimism,
	optimismSepolia,
} from 'wagmi/chains';

import { isProd } from '@/constant/env';
import { ContractConfigMap } from '@/constant/contract';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// TODO Determine the configuration in different environments

const ProjectId = process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID as string;

export const ChainList = isProd
	? [
		{
			name: 'Optimism',
			chainId: ContractConfigMap.Optimism.easChainConfig.chainId,
		},
	]
	: [
		{
			name: 'Optimism Sepolia',
			chainId: ContractConfigMap.OptimismSepolia.easChainConfig.chainId,
		},
	];


const wagmiConfig = getDefaultConfig({
	appName: process.env.NEXT_PUBLIC_WALLET_CONNECT_NAME as string,
	projectId: ProjectId,
	chains: isProd ? [optimism] : [optimismSepolia],
	ssr: true, // If your dApp uses server side rendering (SSR)
});

const queryClient = new QueryClient();

export function RainbowProvider({ children }: { children: React.ReactNode }) {
	const [mounted, setMounted] = React.useState(false);
	React.useEffect(() => setMounted(true), []);
	return (
		<WagmiProvider config={wagmiConfig}>
			<QueryClientProvider client={queryClient}>
				<RainbowKitProvider>
					{mounted && children}
				</RainbowKitProvider>
			</QueryClientProvider>
		</WagmiProvider>
	);
}
