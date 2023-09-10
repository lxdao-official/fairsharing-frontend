import { proxy, useSnapshot } from 'valtio';

import { IProject } from '@/services/types';

export interface StoreTypes {
	userProjectList: IProject[];
	projectList: IProject[];
	currentProjectId: string;
}

export const ProjectStore = proxy<StoreTypes>({
	userProjectList: [],
	projectList: [],
	currentProjectId: '',
});

export const useProjectStore = () => useSnapshot(ProjectStore);

export const setUserProjectList = (list: IProject[]) => {
	ProjectStore.userProjectList = list;
};
export const setAllProjectList = (list: IProject[]) => {
	ProjectStore.projectList = list;
};
export const setCurrentProjectId = (projectId: string) => {
	ProjectStore.currentProjectId = projectId;
};
