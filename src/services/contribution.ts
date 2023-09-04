import { request } from '@/common/request';
import { IContribution } from '@/services/types';
import { PageListParams } from '@/common/types';

export interface ICreateContributionParams {
	signature: string;
	operatorId: string;
	detail: string;
	proof: string;
	credit: number;
	toIds: string[];
	projectId: string;
}

export interface IUpdateContributionParams {
	signature: string;
	operatorId: string;
	type: 'claim';
}

export const createContribution = (params: ICreateContributionParams) => {
	return request.post<IContribution>('contribution/create', 1, params);
};

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
	return request<IContribution[]>('contribution/list', 1, params);
};
