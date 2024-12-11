import { request } from '@/common/request';
import { PageListData, PageListParams } from '@/common/types';
import {
	ContributionType,
	IMintRecord,
	IProject,
	VoteApproveEnum,
	VoteSystemEnum,
} from '@/services/types';

export interface CreateProjectParams {
	name: string;
	/**
	 * project合约地址
	 */
	address: string;
	symbol: string;
	pointConsensus: string;
	logo: string;
	intro: string;
	network: number;
	votePeriod: string;
	contributors: Contributor[];
	voteSystem: VoteSystemEnum;
	voteApprove: VoteApproveEnum;
	voteThreshold: number;
}

export interface EditProjectParams {
	operatorId: string;
	id: string;
	name: string;
	logo: string;
	intro: string;
	votePeriod: string;
	voteSystem: VoteSystemEnum;
	voteApprove: VoteApproveEnum;
	voteThreshold: number;
}

export interface Contributor {
	nickName: string;
	wallet: string;
	permission: PermissionEnum;
	role: string;
	id?: string;
	voteWeight: number;
}

export interface createAllocationBody {
	operatorId: string;
	wallet: string;
	title: string;
	projectId: string;
	contributors: string[];
	ratios: number[];
	credits: number[];
}

export interface createPoolBody {
	operatorId: string,
	wallet: string,
	allocationId: string,
	projectId: string,
	address: string,
	creator: string,
	lockDuration: number,
	depositor: string,
	tokens: PoolTokenBody[]
}

export interface PoolTokenBody {
	token: string;
	wallets: string[];
	amounts: string[];
	ratios: number[];
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

export function getContributionTypeList(projectId: string) {
	return request<ContributionType[]>(`project/${projectId}/contributionTypeList`, 1);
}

export interface CreateContributionTypeBody {
	name: string;
	color: string;
}

export function createContributionType(projectId: string, params: CreateContributionTypeBody) {
	return request.post<ContributionType>(`project/${projectId}/createContributionType`, 1, params);
}

export function editContributionType(params: CreateContributionTypeBody & { id: string }) {
	return request.put<ContributionType>('project/editContributionType', 1, params);
}

export function deleteContributionType(id: string) {
	return request.delete('project/deleteContributionType', 1, { id });
}


export function createAllocation(params: createAllocationBody) {
	return request.post('allocation/create', 1, params);
}

export function updateAllocationState(allocationId: string, params: any) {
	return request.put(`allocation/${allocationId}/updateState`, 1, params);
}

export function createPool(params: createPoolBody) {
	return request.post('pool/create', 1, params);
}

export function getPoolList(params: any) {
	return request('pool/list', 1, params);
}

export function getClaimStatusList(params: any) {
	return request('pool/claimStatus', 1, params);
}

export function poolClaim(params: any) {
	return request.post('pool/claim', 1, params);
}

