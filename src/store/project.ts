import { proxy, useSnapshot } from 'valtio';

import { IProject } from '@/services/types';

export interface StoreTypes {
	userProjectList: IProject[];
	currentProjectId: string;
	contributionUids: string[];
	contributionListParam: string;
}

export const ProjectStore = proxy<StoreTypes>({
	userProjectList: [],
	currentProjectId: '',
	contributionUids: [],
	contributionListParam: '',
});

export const useProjectStore = () => useSnapshot(ProjectStore);

export const setUserProjectList = (list: IProject[]) => {
	ProjectStore.userProjectList = list;
};
export const setCurrentProjectId = (projectId: string) => {
	ProjectStore.currentProjectId = projectId;
};

export const setContributionUids = (uIds: string[]) => {
	ProjectStore.contributionUids = uIds;
};

export const setContributionListParam = (param: string) => {
	ProjectStore.contributionListParam = param;
};
