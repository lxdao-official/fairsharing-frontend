'use client';

import * as React from 'react';
import '@rainbow-me/rainbowkit/styles.css';
import { RainbowKitProvider, getDefaultConfig, Theme, darkTheme } from '@rainbow-me/rainbowkit';
import {
	okxWallet,
	walletConnectWallet,
	coinbaseWallet,
	rabbyWallet,
	bitgetWallet,
	phantomWallet,
	rainbowWallet,
} from '@rainbow-me/rainbowkit/wallets';

// @ts-ignore
import merge from 'lodash.merge';
import { WagmiProvider } from 'wagmi';
import { optimism, optimismSepolia } from 'wagmi/chains';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { isProd } from '@/constant/env';
import { ContractConfigMap } from '@/constant/contract';

// TODO Determine the configuration in different environments

// prod ? bruce : lgc
const ProjectId = isProd ? '6756806cba2601750f89e7fd325c28f1' : '7188673890c272bd9021dd19e64c9b7e';

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
	wallets: [
		{
			groupName: 'Recommended',
			wallets: [
				okxWallet,
				coinbaseWallet,
				rabbyWallet,
				bitgetWallet,
				phantomWallet,
				rainbowWallet,
				walletConnectWallet,
			],
		},
	],
});

const queryClient = new QueryClient();

const myTheme = merge(darkTheme(), {
	colors: {
		accentColor: '#0F172A',
		connectButtonBackground: '#0F172A',
	},
} as Theme);

export function RainbowProvider({ children }: { children: React.ReactNode }) {
	const [mounted, setMounted] = React.useState(false);
	React.useEffect(() => setMounted(true), []);
	return (
		<WagmiProvider config={wagmiConfig}>
			<QueryClientProvider client={queryClient}>
				<RainbowKitProvider theme={myTheme}>{mounted && children}</RainbowKitProvider>
			</QueryClientProvider>
		</WagmiProvider>
	);
}
