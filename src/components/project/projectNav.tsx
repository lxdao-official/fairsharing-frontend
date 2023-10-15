'use client';

import { usePathname, useParams } from 'next/navigation';

import { styled, Typography } from '@mui/material';
import React, { useEffect, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';

import styles from '@/styles/project.module.css';
import { useProjectStore } from '@/store/project';

const ProjectNav = () => {
	const pathname = usePathname();
	const params = useParams();
	const { currentProjectId, userProjectList } = useProjectStore();

	const isMatch = (name: string) => {
		return pathname.indexOf(name) > -1;
	};

	const projectName = useMemo(() => {
		return userProjectList.find((item) => item.id === currentProjectId)?.name;
	}, [currentProjectId, userProjectList]);

	return (
		<div className={styles.projectNavContainer}>
			<ProjectTitle variant={'subtitle1'}>{projectName || 'Project'}</ProjectTitle>
			<NavItem
				href={`/project/${params.id}/contribution`}
				name={'Contributions'}
				icon={'/images/projectNav/contribution.png'}
				isActive={isMatch('contribution')}
			/>
			<NavItem
				href={`/project/${params.id}/contributor`}
				name={'Contributors'}
				icon={'/images/projectNav/contributor.png'}
				isActive={isMatch('contributor')}
			/>
			<NavItem
				href={`/project/${params.id}/dashboard`}
				name={'Dashboard'}
				icon={'/images/projectNav/dashboard.png'}
				isActive={isMatch('dashboard')}
			/>
			<NavItem
				href={`/project/${params.id}/setting`}
				name={'Settings'}
				icon={'/images/projectNav/setting.png'}
				isActive={isMatch('setting')}
			/>
		</div>
	);
};

export default ProjectNav;

const NavItem = ({
	href,
	name,
	icon,
	isActive,
}: {
	href: string;
	name: string;
	icon: string;
	isActive?: boolean;
}) => {
	return (
		<Link
			href={href}
			style={{
				display: 'flex',
				justifyContent: 'center',
				alignItems: 'center',
				height: '56px',
				padding: '0 24px',
			}}
		>
			<Image src={icon} width={24} height={24} alt={'icon'} />
			<Typography
				sx={{ marginLeft: '24px', flex: '1', color: isActive ? '#0F172A' : '#475569', fontWeight: isActive ? '500' : 'normal' }}
				variant={'body1'}
			>
				{name}
			</Typography>
		</Link>
	);
};

const ProjectTitle = styled(Typography) ({
	maxWidth: '208px',
	borderBottom: '1px solid rgba(15, 23, 42, 0.16)',
	padding: '8px 16px',
	overflow: 'hidden',
	whiteSpace: 'nowrap',
	textOverflow: 'ellipsis'
})
