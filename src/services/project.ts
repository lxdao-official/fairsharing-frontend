import { request } from '@/common/request';

export interface CreateProjectParams {}

export interface CreateProjectRes {
	id: number | string;
}

/**
 * create a new project
 * @param params
 */
export function createProject(params: CreateProjectParams): Promise<CreateProjectRes> {
	return request('project/new', 1, params);
}
