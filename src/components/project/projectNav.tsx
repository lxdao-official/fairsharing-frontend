'use client';

import { usePathname, useParams } from 'next/navigation';

import { styled, Typography } from '@mui/material';
import React, { useMemo } from 'react';
import Link from 'next/link';

import styles from '@/styles/project.module.css';
import { ContributionIcon, ContributorIcon, DashboardIcon, SettingIcon } from '@/icons';
import useSWR from 'swr';
import { getProjectDetail } from '@/services';

export enum ProjectSubPageEnum {
	Contribution = 'contribution',
	Contributor = 'contributor',
	Dashboard = 'dashboard',
	Setting = 'setting',
}

const NameMap = {
	[ProjectSubPageEnum.Contribution]: 'Contributions',
	[ProjectSubPageEnum.Contributor]: 'Contributors',
	[ProjectSubPageEnum.Dashboard]: 'Dashboard',
	[ProjectSubPageEnum.Setting]: 'Settings',
};

const IconMap = {
	[ProjectSubPageEnum.Contribution]: ContributionIcon,
	[ProjectSubPageEnum.Contributor]: ContributorIcon,
	[ProjectSubPageEnum.Dashboard]: DashboardIcon,
	[ProjectSubPageEnum.Setting]: SettingIcon,
};

const ProjectNav = () => {
	const pathname = usePathname();
	const params = useParams();

	const { data: projectDetail } = useSWR(
		['project/detail', params.id],
		() => {
			if (params.id) {
				return getProjectDetail(params.id as string);
			} else {
				return Promise.reject();
			}
		},
		{
			onSuccess: (data) => console.log('[ProjectNav projectDetail]', data),
		},
	);

	const isMatch = (name: string) => {
		return pathname.indexOf(name) > -1;
	};

	const currentPageName = useMemo(() => {
		if (isMatch(ProjectSubPageEnum.Contribution)) {
			return ProjectSubPageEnum.Contribution;
		} else if (isMatch(ProjectSubPageEnum.Contributor)) {
			return ProjectSubPageEnum.Contributor;
		} else if (isMatch(ProjectSubPageEnum.Dashboard)) {
			return ProjectSubPageEnum.Dashboard;
		} else if (isMatch(ProjectSubPageEnum.Setting)) {
			return ProjectSubPageEnum.Setting;
		} else {
			return ProjectSubPageEnum.Contribution;
		}
	}, [pathname]);

	return (
		<div className={styles.projectNavContainer}>
			<ProjectTitle variant={'subtitle1'}>{projectDetail?.name || 'Project'}</ProjectTitle>
			<NavItem
				href={`/project/${params.id}/contribution`}
				name={ProjectSubPageEnum.Contribution}
				isActive={currentPageName === ProjectSubPageEnum.Contribution}
			/>
			<NavItem
				href={`/project/${params.id}/contributor`}
				name={ProjectSubPageEnum.Contributor}
				isActive={currentPageName === ProjectSubPageEnum.Contributor}
			/>
			<NavItem
				href={`/project/${params.id}/dashboard`}
				name={ProjectSubPageEnum.Dashboard}
				isActive={currentPageName === ProjectSubPageEnum.Dashboard}
			/>
			<NavItem
				href={`/project/${params.id}/setting`}
				name={ProjectSubPageEnum.Setting}
				isActive={currentPageName === ProjectSubPageEnum.Setting}
			/>
		</div>
	);
};

export default ProjectNav;

export interface INavItemProps {
	href: string;
	name: ProjectSubPageEnum;
	isActive: boolean;
}

const NavItem = ({ href, name, isActive }: INavItemProps) => {
	const Icon = useMemo(() => {
		return IconMap[name];
	}, [name]);

	return (
		<StyledLink href={href}>
			<Icon fill={isActive ? '#0F172A' : '#64748B'} />
			<StyledName variant={'body1'} active={isActive ? 'true' : 'false'}>
				{NameMap[name]}
			</StyledName>
		</StyledLink>
	);
};

const ProjectTitle = styled(Typography)({
	maxWidth: '240px',
	borderBottom: '1px solid rgba(15, 23, 42, 0.16)',
	padding: '8px 16px',
	overflow: 'hidden',
	whiteSpace: 'nowrap',
	textOverflow: 'ellipsis',
});

const StyledLink = styled(Link)({
	display: 'flex',
	justifyContent: 'center',
	alignItems: 'center',
	height: '56px',
	padding: '0 24px',
});
const StyledName = styled(Typography)<{ active: string }>(({ active }) => ({
	marginLeft: '24px',
	flex: '1',
	color: active === 'true' ? '#0F172A' : '#475569',
	fontWeight: active === 'true' ? '500' : 'normal',
}));
