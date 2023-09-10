import { PermissionEnum } from '@/services/project';

export interface IProject {
	id: string;
	name: string;
	intro: string;
	logo: string;
	network: number;
	votePeriod: string;
	symbol: string;
	pointConsensus: string;
	contributions?: IContribution[];
	contributors?: IContributor[];
}

export interface IContribution {
	id: number;
	detail: string;
	proof: string;
	credit: number;
	toIds: string[];
	status: Status;
	uId?: string;
	ownerId: string;
	owner: IUser;
	projectId: string;
	project: IProject;
	deleted: boolean;
	updatedAt: string;
	createAt: string;
}

export enum Status {
	UNREADY = 'UNREADY',
	READY = 'READY',
	CLAIM = 'CLAIM',
}

export interface IContributor {
	id: string;
	nickName: string;
	wallet: string;
	user: IUser;
	userId: string;
	projectId: string;
	project: IProject;
	permission: PermissionEnum;
	role: string;
	deleted: boolean;
}

export interface IUser {
	id: string;
	name: string;
	avatar: string;
	bio: string;
	wallet: string;
	contributions?: IContribution[];
	contributors?: IContributor[];
}
