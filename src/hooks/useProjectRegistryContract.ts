import { useReadContract } from 'wagmi';

import { ProjectRegisterABI } from '@/constant/abi';
import { DefaultContractConfig } from '@/constant/contract';

function useProjectRegistryContract() {
	const { data, isLoading, error } = useReadContract({
		address: DefaultContractConfig.projectRegisterUpgradeableProxy as `0x${string}`,
		abi: ProjectRegisterABI,
	});

	if (isLoading) return null; // 加载中
	if (error) return null; // 发生错误

	return data;
}

export default useProjectRegistryContract;
