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
}

export interface IUpdateContributionParams {
	type: 'claim' | 'ready';
	uId?: string;
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

export const getContributionList = (params: PageListParams & { projectId: string }) => {
	return request<PageListData<IContribution>>('contribution/list', 1, params);
};
