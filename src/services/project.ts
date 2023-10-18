import { request } from '@/common/request';
import { PageListData, PageListParams } from '@/common/types';
import { IContributor, IMintRecord, IProject } from '@/services/types';

export interface CreateProjectParams {
	name: string;
	/**
	 * project合约地址
	 */
	address: string;
	// TODO symbol含义？
	symbol: string;
	// TODO 确认是token
	pointConsensus: string;
	logo: string;
	intro: string;
	network: number;
	votePeriod: string;
	contributors: Contributor[];
}

export interface EditProjectParams {
	id: string;
	name: string;
	logo: string;
	intro: string;
	votePeriod: string;
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

export function editProject(params: EditProjectParams): Promise<IProject> {
	const { id, ...data } = params;
	return request.put(`project/${id}/edit`, 1, data);
}

export function getProjectList(params: PageListParams): Promise<PageListData<IProject>> {
	return request('project/list', 1, params);
}

export function getProjectListByWallet(wallet: string): Promise<IProject[]> {
	return request('project/list', 1, {
		wallet,
	});
}

export function getProjectDetail(projectId: string): Promise<IProject> {
	return request(`project/${projectId}`, 1);
}

export function getMintRecord(projectId: string, wallet: string = '') {
	return request<IMintRecord[]>(`project/${projectId}/mintRecord?wallet=${wallet}`, 1);
}
