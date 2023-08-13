import { proxy, useSnapshot } from 'valtio';

import { Project } from '@/services/project';

export interface StoreTypes {
	projectList: Project[];
	currentProject: Project | null;
}

export const ProjectStore = proxy<StoreTypes>({
	projectList: [{ id: 1 }, { id: 2 }, { id: 3 }],
	currentProject: {
		id: 2,
	},
});

export const useProjectStore = () => useSnapshot(ProjectStore);
