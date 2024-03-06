import useSWR from 'swr';

import { useAccount } from 'wagmi';
import { useMemo } from 'react';

import { getContributorList } from '@/services';
import { DefaultEasChainConfig } from '@/constant/contract';

export interface IProps {
	projectId: string;
}

const usePrivilege = ({ projectId }: IProps) => {
	const { address, chainId } = useAccount();
	const { data: contributorList } = useSWR(
		['contributor/list', projectId],
		() => getContributorList(projectId),
		{
			fallbackData: [],
			onSuccess: (data) => {},
		},
	);
	const isWalletConnected = useMemo(() => {
		return !!address;
	}, [address]);

	const isChainCorrect = useMemo(() => {
		if (!chainId) return false;
		return chainId === DefaultEasChainConfig.chainId;
	}, [chainId]);

	const isProjectContributor = useMemo(() => {
		if (!address) return false;
		if (contributorList.length === 0) return false;
		const item = contributorList.find((contributor) => contributor.wallet === address);
		return !!item;
	}, [address, contributorList]);

	return {
		isWalletConnected,
		isChainCorrect,
		isProjectContributor,
	};
};

export default usePrivilege;
