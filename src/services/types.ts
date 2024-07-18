import { Contributor, PermissionEnum } from '@/services/project';

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
	voteSystem: VoteSystemEnum;
	voteApprove: VoteApproveEnum;
	voteThreshold: number;
	ContributionType: ContributionType[];
}

export interface IContribution {
	id: string;
	detail: string;
	proof: string;
	imageList?: string[];
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
	type: string[];
	/**
	 * 2024.02.25 add startDate and endDate, remove contributionDate
	 */
	contributionDate: string | null;
	startDate: number | Date | null;
	endDate: number | Date | null;
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
	voteWeight: number;
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

export interface IMintRecord {
	id: string;
	credit: number;
	contributor: IContributor;
	contributorId: string;
	projectId: string;
}

export enum VoteSystemEnum {
	EQUAL = 'EQUAL',
	WEIGHT = 'WEIGHT',
}

export enum VoteApproveEnum {
	DEFAULT = 'DEFAULT',
	RELATIVE2 = 'RELATIVE2',
	ABSOLUTE1 = 'ABSOLUTE1',
	ABSOLUTE2 = 'ABSOLUTE2',
}

export interface ContributionType {
	id: string;
	name: string;
	projectId: string;
	color: string;
}
