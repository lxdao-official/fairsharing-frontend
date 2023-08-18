import { request } from '@/common/request';
import { PageListData, PageListParams } from '@/common/types';

export interface CreateProjectParams {}

export interface CreateProjectRes {
	id: number | string;
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
	return request('project/createProject', 1, params);
}

export function getProjectList(params: PageListParams): Promise<PageListData<Project>> {
	return request('project/list', 1, params);
}
