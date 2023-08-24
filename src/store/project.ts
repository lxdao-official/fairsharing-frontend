import { proxy, useSnapshot } from 'valtio';
import { IProject } from '@/services/types';


export interface StoreTypes {
	projectList: Partial<IProject>[];
	currentProject: Partial<IProject> | null;
}

export const ProjectStore = proxy<StoreTypes>({
	projectList: [{ id: 1, name: "FS" }, { id: 2, name: "Crypto" }, { id: 3, name: "Web3" }],
	currentProject: {
		id: 2,
		name: "Crypto"
	},
});

export const useProjectStore = () => useSnapshot(ProjectStore);
