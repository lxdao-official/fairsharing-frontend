import { request } from '@/common/request';
import { IContributor } from '@/services/types';

export interface IEditContributor {
	projectId: string;
	contributors: IContributor[];
}

export const getContributorList = (projectId: string) => {
	return request<IContributor[]>('contributor/list', 1, { projectId });
};

export const editContributorList = (params: IEditContributor) => {
	return request.put('contributor/edit', 1, params);
};
