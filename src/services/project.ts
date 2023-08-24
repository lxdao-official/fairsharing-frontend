import { request } from '@/common/request';
import { PageListData, PageListParams } from '@/common/types';
import { IContributor, IProject } from '@/services/types';

export interface CreateProjectParams {
	logo: string;
	name: string;
	intro: string;
	symbol: string;
	network: number;
	votePeriod: number;
	contributors: IContributor[];
}

/**
 * createProject a new project
 * @param params
 */
export function createProject(params: CreateProjectParams): Promise<IProject> {
	return request.post('project/create', 1, params);
}

export function getProjectList(params: PageListParams): Promise<PageListData<IProject>> {
	return request('project/list', 1, params);
}
