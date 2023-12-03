'use client';

import * as React from 'react';
import '@rainbow-me/rainbowkit/styles.css';
import {
	RainbowKitProvider,
	getDefaultWallets,
	connectorsForWallets,
} from '@rainbow-me/rainbowkit';
import { argentWallet, trustWallet, ledgerWallet } from '@rainbow-me/rainbowkit/wallets';

import { configureChains, createConfig, WagmiConfig } from 'wagmi';
import { mainnet, polygon, optimism, arbitrum, zora, goerli, optimismGoerli } from 'wagmi/chains';
import { alchemyProvider } from 'wagmi/providers/alchemy';
import { publicProvider } from 'wagmi/providers/public';

import { isProd } from '@/constant/env';

// TODO Determine the configuration in different environments
const Chains = [mainnet, optimism, polygon, optimismGoerli, goerli];
const AlchemyApiKey = isProd
	? process.env.NEXT_PUBLIC_ALCHEMY_ID_PROD
	: process.env.NEXT_PUBLIC_ALCHEMY_ID_TEST;
const ProjectId = process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID as string;

// @ts-ignore
const { chains, publicClient, webSocketPublicClient } = configureChains(Chains, [
	alchemyProvider({ apiKey: AlchemyApiKey as string }),
	publicProvider(),
]);

const { wallets } = getDefaultWallets({
	appName: process.env.NEXT_PUBLIC_WALLET_CONNECT_NAME as string,
	projectId: ProjectId,
	chains,
});

const demoAppInfo = {
	appName: process.env.NEXT_PUBLIC_WALLET_CONNECT_NAME as string,
};

const connectors = connectorsForWallets([
	...wallets,
	{
		groupName: 'Other',
		wallets: [
			argentWallet({ projectId: ProjectId, chains }),
			trustWallet({ projectId: ProjectId, chains }),
			ledgerWallet({ projectId: ProjectId, chains }),
		],
	},
]);

const wagmiConfig = createConfig({
	autoConnect: true,
	connectors,
	publicClient,
	webSocketPublicClient,
});

export function RainbowProvider({ children }: { children: React.ReactNode }) {
	const [mounted, setMounted] = React.useState(false);
	React.useEffect(() => setMounted(true), []);
	return (
		<WagmiConfig config={wagmiConfig}>
			<RainbowKitProvider chains={chains} appInfo={demoAppInfo}>
				{mounted && children}
			</RainbowKitProvider>
		</WagmiConfig>
	);
}
