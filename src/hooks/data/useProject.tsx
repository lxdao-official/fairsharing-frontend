import useSWR from 'swr';

import { getProjectDetail } from '@/services/project';

export function useProjectDetail(projectId: string) {
	const { data, error, isLoading } = useSWR(`project/${projectId}`, () =>
		getProjectDetail(projectId),
	);
	return {
		projectDetail: data,
		error,
		isLoading,
	};
}
