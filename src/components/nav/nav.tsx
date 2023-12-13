'use client';

import { styled, Tooltip, Typography } from '@mui/material';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import React, { useCallback, useEffect, useMemo } from 'react';

import { useAccount } from 'wagmi';
import { Img3 } from '@lxdao/img3';

import { setCurrentProjectId, setUserProjectList, useProjectStore } from '@/store/project';
import { getUserInfo, signup } from '@/services/user';
import { setUser } from '@/store/user';
import { getProjectListByWallet } from '@/services/project';
import { AddIcon, HomeIcon } from '@/icons';

export default function Nav() {
	const { currentProjectId, userProjectList } = useProjectStore();
	const pathname = usePathname();
	const { address: myAddress } = useAccount();
	const router = useRouter();

	const isProjectRoute = useMemo(() => {
		return pathname.indexOf('project') > -1 && pathname.indexOf('/project/create') < 0;
	}, [pathname]);

	useEffect(() => {
		if (myAddress) {
			fetchUserProjectList();
		}
	}, [myAddress]);

	const fetchUserProjectList = async () => {
		try {
			let myInfo = await getUserInfo(myAddress as string);
			if (!myInfo) {
				myInfo = await signup(myAddress as string);
			}
			setUser(myInfo);
			const list = await getProjectListByWallet(myInfo.wallet);
			setUserProjectList(list || []);
		} catch (err) {
			console.error('fetchUserProjectList error', err);
		}
	};

	const handleClickItem = useCallback((projectId: string) => {
		setCurrentProjectId(projectId);
		router.push(`/project/${projectId}/contribution`);
	}, []);

	return (
		<NavContainer>
			<Link href={'/'}>
				<NavItem active={pathname === '/'}>
					<HomeIcon />
				</NavItem>
			</Link>
			{userProjectList.map((project, idx) => (
				<Item
					key={project.id}
					name={project.name}
					isActive={isProjectRoute && currentProjectId === project.id}
					image={project.logo}
					onClickEvent={handleClickItem}
					projectId={project.id}
				/>
			))}
			<Link href={'/project/create'}>
				<Tooltip title={'Create Project'} placement={'right'}>
					<NavItem active={pathname.indexOf('/project/create') > -1}>
						<AddIcon />
					</NavItem>
				</Tooltip>
			</Link>
		</NavContainer>
	);
}

export interface IItemProps {
	onClickEvent: (projectId: string) => void;
	isActive: boolean;
	projectId: string;
	name: string;
	image: string;
}

const Item = (props: IItemProps) => {
	const { image, name, projectId, isActive, onClickEvent } = props;
	return (
		<Tooltip title={name} placement={'right'}>
			<NavItem active={isActive} onClick={() => onClickEvent(projectId)}>
				{image ? (
					<Img3
						src={image}
						style={{
							width: '56px',
							height: '56px',
							borderRadius: '56px',
							border: '1px solid rgba(15,23,42,0.12)',
						}}
					/>
				) : (
					<Typography variant={'h4'}>{name || 'Project'}</Typography>
				)}
			</NavItem>
		</Tooltip>
	);
};

const NavContainer = styled('nav')({
	width: '80px',
	minWidth: '80px',
	height: '100%',
	paddingBottom: '40px',
	borderRight: '0.5px solid #CBD5E1',
	background: '#fff',
	overflowY: 'scroll',
});

const NavItem = styled('div')<{ active: boolean }>(({ theme, active }) => ({
	width: '80px',
	height: '80px',
	display: 'flex',
	justifyContent: 'center',
	alignItems: 'center',
	position: 'relative',
	cursor: 'pointer',
	'&::after': active
		? {
				content: '""',
				position: 'absolute',
				left: '0',
				top: '24px',
				height: '32px',
				width: '6px',
				borderRadius: '0 6px 6px 0',
				backgroundColor: '#475569',
		  }
		: {},
}));
