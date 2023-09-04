import { request } from '@/common/request';
import { PageListData, PageListParams } from '@/common/types';
import { IContributor, IProject } from '@/services/types';

export interface CreateProjectParams {
	name: string;
	/**
	 * project 合约地址
	 */
	address: string;
	// TODO symbol含义？
	symbol: string;
	// TODO 确认是token
	pointConsensus: string;
	logo: string;
	intro: string;
	network: number;
	/**
	 * 改为截止日期
	 */
	votePeriod: string;
	contributors: Contributor[];
}

export interface Contributor {
	nickName: string;
	wallet: string;
	permission: PermissionEnum;
	role: string;
	id?: string;
}

export enum PermissionEnum {
	Owner = 1,
	Admin,
	Contributor,
}

/**
 * createProject a new project
 * @param params
 */
export function createProject(params: CreateProjectParams): Promise<IProject> {
	return request.post('project/create', 1, params);
}

export function getProjectList(
	params: PageListParams & { userId?: string },
): Promise<{ data: PageListData<IProject> }> {
	return request('project/list', 1, params);
}

export function getProjectDetail(projectId: string): Promise<IProject> {
	return request(`project/${projectId}`, 1);
}
