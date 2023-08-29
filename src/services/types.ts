import { PermissionEnum } from '@/components/createProject/step/contributor';

export interface IProject {
	id: number;
	name: string;
	intro: string;
	logo: string;
	network: number;
	votePeriod: number;
	symbol: string;
	pointConsensus: string;
	contributions: IContribution[];
	contributors: IContributor[];
}

export interface IContribution {
	id: string;
	detail: string;
	proof: string;
	credit: number;
	toIds: string[];
	status: Status;
	agree: number;
	disagree: number;
	ownerId: string;
	projectId: string;
	deleted: boolean;
	MintRecord: IMintRecord[];

	[key: string]: any;
}

export enum Status {
	UNREADY,
	READY,
	CLAIM,
}

export interface IContributor {
	id: string;
	nickname: string;
	wallet: string;
	userId: string;
	projectId: string;
	permission: PermissionEnum;
	role: string;
}

export interface IUser {
	id: string;
	avatar: string;
	bio: string;
	wallet: string;
	contributions: IContribution[];
	contributors: IContributor[];
	MintRecord: IMintRecord[];
}

export interface IMintRecord {
	id: string;
	userId: string;
	credit: number;
	contribution: IContribution;
	contributionId: string;
	status: MintStatus;
}

export enum MintStatus {
	UNMINT,
	MINTED,
}
