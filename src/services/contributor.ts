import { request } from '@/common/request';
import { IContributor } from '@/services/types';

export const getContributorList = (projectId: string) => {
	return request<IContributor[]>('contributor/list', 1, { projectId });
};
