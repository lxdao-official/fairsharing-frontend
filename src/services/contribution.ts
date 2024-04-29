import { request } from '@/common/request';
import { IContribution } from '@/services/types';
import { PageListData, PageListParams } from '@/common/types';

export interface IAuthBody {
	signature?: string;
	operatorId?: string;
}

export interface ICreateContributionParams extends IAuthBody {
	operatorId: string;
	detail: string;
	proof: string;
	projectId: string;
	credit: number;
	toIds: string[];
	uId?: string;
	type: string[];
	/**
	 * 2024.02.25 remove contributionDate
	 */
	startDate: number;
	endDate: number;
}

export interface IUpdateContributionParams {
	type: 'claim' | 'ready';
	uId?: string;
	operatorId: string;
}

export const createContribution = (params: ICreateContributionParams) => {
	return request.post<IContribution>('contribution/create', 1, params);
};

/**
 * @deprecated 暂无法编辑
 */
export const editContribution = (
	cid: string,
	params: Omit<ICreateContributionParams, 'projectId'>,
) => {
	return request.put<IContribution>(`contribution/${cid}/edit`, 1, params);
};

export const updateContributionStatus = (cid: string, params: IUpdateContributionParams) => {
	return request.put<IContribution>(`contribution/${cid}/updateState`, 1, params);
};

export interface IContributionListParams extends PageListParams {
	projectId: string;
	wallet?: string;
	endDateFrom?: number;
	endDateTo?: number;
}
export const getContributionList = (params: IContributionListParams) => {
	return request<PageListData<IContribution>>('contribution/list', 1, params);
};

export const prepareClaim = (data: {
	wallet: string;
	toWallets: string[];
	chainId: number;
	contributionIds: string;
}) => {
	return request.post<string[]>(`contribution/prepareClaim`, 1, data);
};

export const deleteContribution = (contributionId: string, operatorId: string) => {
	return request.delete(`contribution/${contributionId}`, 1, { operatorId });
};

export interface IAllocationQuery {
	projectId: string;
	endDateFrom: number;
	endDateTo: number;
	type: string;
}

/**
 * res: Record<contributorId, credit>
 */
export const getAllocationDetails = (query: IAllocationQuery) => {
	return request<Record<string, number>>('contribution/allocationDetails', 1, query);
};
