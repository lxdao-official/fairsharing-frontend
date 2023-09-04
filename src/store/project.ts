import { proxy, useSnapshot } from 'valtio';

import { IProject } from '@/services/types';

export interface StoreTypes {
	projectList: IProject[];
	currentProjectId: string;
}

export const ProjectStore = proxy<StoreTypes>({
	projectList: [],
	currentProjectId: '',
});

export const useProjectStore = () => useSnapshot(ProjectStore);

export const setAllProjectList = (list: IProject[]) => {
	ProjectStore.projectList = list;
};
export const setCurrentProjectId = (projectId: string) => {
	ProjectStore.currentProjectId = projectId;
};
