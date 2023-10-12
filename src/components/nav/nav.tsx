'use client';

import { styled, Typography } from '@mui/material';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React, { useEffect } from 'react';

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

	useEffect(() => {
		if (pathname.indexOf('project') < 0) {
			setCurrentProjectId('');
		}
		if (pathname.indexOf('create')) {
			setCurrentProjectId('');
		}
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
			console.log('myInfo', myInfo);
			const list = await getProjectListByWallet(myInfo.wallet);
			console.log('UserProjectList', list);
			setUserProjectList(list || []);
		} catch (err) {
			console.error('fetchUserProjectList error', err);
		}
	};

	return (
		<NavContainer>
			<Item
				href={'/'}
				image={'/images/home.png'}
				isActive={pathname === '/'}
				icon={<HomeIcon />}
			/>
			{userProjectList.map((project, idx) => (
				<Item
					key={project.id}
					href={`/project/${project.id}/contribution`}
					name={project.name}
					isActive={currentProjectId === project.id}
					image={project.logo}
				/>
			))}
			<Item
				href={'/project/create'}
				image={'/images/new.png'}
				isActive={pathname === '/project/create'}
				icon={<AddIcon />}
			/>
		</NavContainer>
	);
}

const Item = ({
	href,
	image,
	name,
	isActive,
	icon,
}: {
	href: string;
	isActive: boolean;
	name?: string;
	icon?: JSX.Element
	image?: string;
}) => {
	return (
		<Link href={href} prefetch={true}>
			<NavItem active={isActive}>
				{icon ? icon : image ? (
					<Img3
						src={image}
						style={{
							width: '56px',
							height: '56px',
							borderRadius: '56px',
						}}
					/>
				) : (
					<Typography variant={'h4'}>{name || 'Project'}</Typography>
				)}

			</NavItem>
		</Link>
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
