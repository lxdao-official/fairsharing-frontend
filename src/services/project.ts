import { request } from '@/common/request';
import { PageListData, PageListParams } from '@/common/types';
import { IContributor } from '@/components/createProject/step/contributor';

export interface CreateProjectParams {}

export interface CreateProjectRes {
	logo: string,
	name: string,
	intro: string,
	symbol: string,
	network: number,
	votePeriod: number,
	contributors: IContributor[]
}

export interface Project {
	id: number;
	[key: string]: any;
}

/**
 * createProject a new project
 * @param params
 */
export function createProject(params: CreateProjectParams): Promise<CreateProjectRes> {
	return request.post('project/create', 1, params);
}

export function getProjectList(params: PageListParams): Promise<PageListData<Project>> {
	return request('project/list', 1, params);
}
