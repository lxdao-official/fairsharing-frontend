import { useMemo, useState } from 'react';

import {
	AttestationShareablePackageObject,
	EAS,
	Offchain,
} from '@ethereum-attestation-service/eas-sdk';

import { useAccount } from 'wagmi';

import axios from 'axios';

import { DefaultEasChainConfig, EAS_CHAIN_CONFIGS } from '@/constant/contract';
import { useEthersSigner } from '@/common/ether';
import { request } from '@/common/request';

export type StoreAttestationRequest = { filename: string; textJson: string };

export type StoreIPFSActionReturn = {
	error: null | string;
	ipfsHash: string | null;
	offchainAttestationId: string | null;
};

const useEas = () => {
	const signer = useEthersSigner();
	const { chainId } = useAccount();

	const easConfig = useMemo(() => {
		const activeChainConfig = EAS_CHAIN_CONFIGS.find((config) => config.chainId === chainId);
		return activeChainConfig || DefaultEasChainConfig;
	}, [chainId]);

	const eas = useMemo(() => {
		const EASContractAddress = easConfig?.contractAddress;
		if (!signer) {
			return new EAS(EASContractAddress);
		}
		return new EAS(EASContractAddress, { signerOrProvider: signer });
	}, [signer, easConfig]);

	const getEasScanURL = () => {
		return easConfig.etherscanURL;
	};

	const submitSignedAttestation = async (
		pkg: AttestationShareablePackageObject,
		chainId: number,
	) => {
		// const baseURL = getEasScanURL();
		// console.log('baseURL', baseURL, pkg);
		// const data: StoreAttestationRequest = {
		// 	filename: `${new Date().getTime()}_eas.txt`,
		// 	textJson: JSON.stringify(pkg),
		// };
		// return await axios.post<StoreIPFSActionReturn>(`${baseURL}/offchain/store`, data);

		// backend act to post
		return await request.post('contribution/submitSignedAttestation', 1, {
			chainId: chainId,
			filename: `${new Date().getTime()}_eas.txt`,
			textJson: JSON.stringify(pkg),
		});
	};

	const getOffchain = () => {
		const { contractAddress, chainId, version } = easConfig;
		return new Offchain(
			{
				address: contractAddress,
				version: version,
				chainId: BigInt(chainId),
			},
			1,
		);
	};

	return {
		eas,
		easConfig,
		getEasScanURL,
		submitSignedAttestation,
		getOffchain,
	};
};

export default useEas;
