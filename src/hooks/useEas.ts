import { useMemo } from 'react';

import { AttestationShareablePackageObject, EAS } from '@ethereum-attestation-service/eas-sdk';

import { useNetwork } from 'wagmi';

import axios from 'axios';

import { EAS_CHAIN_CONFIGS } from '@/constant/eas';
import { useEthersSigner } from '@/common/ether';

export type StoreAttestationRequest = { filename: string; textJson: string };

export type StoreIPFSActionReturn = {
	error: null | string;
	ipfsHash: string | null;
	offchainAttestationId: string | null;
};

const useEas = () => {
	const signer = useEthersSigner();
	const network = useNetwork();

	const eas = useMemo(() => {
		const activeChainConfig =
			EAS_CHAIN_CONFIGS.find((config) => config.chainId === network.chain?.id) ||
			EAS_CHAIN_CONFIGS[2];
		const EASContractAddress = activeChainConfig?.contractAddress;
		if (!signer) {
			return new EAS(EASContractAddress);
		}
		return new EAS(EASContractAddress, { signerOrProvider: signer });
	}, [network, signer]);

	const getEasScanURL = () => {
		const activeChainConfig = EAS_CHAIN_CONFIGS.find(
			(config) => config.chainId === network.chain?.id,
		);

		return `https://${activeChainConfig!.subdomain}easscan.org`;
	};

	const submitSignedAttestation = async (pkg: AttestationShareablePackageObject) => {
		const baseURL = getEasScanURL();

		console.log('baseURL:', baseURL);

		const data: StoreAttestationRequest = {
			filename: `${new Date().getTime()}_eas.txt`,
			textJson: JSON.stringify(pkg),
		};

		return await axios.post<StoreIPFSActionReturn>(`${baseURL}/offchain/store`, data);
	};

	return {
		eas,
		getEasScanURL,
		submitSignedAttestation,
	};
};

export default useEas;
