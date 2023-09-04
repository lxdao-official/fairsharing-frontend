'use client';

import { styled, Typography } from '@mui/material';
import Image from 'next/image';
import Link from 'next/link';
import { useParams, usePathname } from 'next/navigation';
import { useEffect } from 'react';

import { useAccount } from 'wagmi';

import { setAllProjectList, setCurrentProjectId, useProjectStore } from '@/store/project';
import { getUserInfo } from '@/services/user';
import { setUser } from '@/store/user';
import { getProjectList } from '@/services/project';

export default function Nav() {
	const { currentProjectId, projectList } = useProjectStore();
	const pathname = usePathname();
	const queryParams = useParams();
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
		getUserProjectList();
	}, []);

	useEffect(() => {
		if (myAddress) {
			getUserProjectList(myAddress);
		}
	}, [myAddress]);

	const getUserProjectList = async (userWallet?: string) => {
		const params = {
			currentPage: 1,
			pageSize: 50,
		};
		if (userWallet) {
			// also create user
			const myInfo = await getUserInfo(userWallet);
			setUser(myInfo);
			console.log('myInfo', myInfo);
			Object.assign(params, { userId: myInfo.id });
		}
		const { data } = await getProjectList(params);
		console.log('getProjectList', data?.list);
		if (data?.list) {
			setAllProjectList(data?.list || []);
		}
	};

	return (
		<NavContainer>
			<Item href={'/'} image={'/images/home.png'} isActive={pathname === '/'} />
			{projectList.map((project, idx) => (
				<Item
					href={`/project/${project.id}/contribution`}
					key={project.id}
					name={project.name}
					isActive={currentProjectId === project.id}
				/>
			))}
			<Item
				href={'/project/create'}
				image={'/images/new.png'}
				isActive={pathname === '/project/create'}
				prefetch={true}
			/>
		</NavContainer>
	);
}

const Item = ({
	href,
	image,
	name,
	isActive,
	prefetch,
}: {
	href: string;
	image?: string;
	isActive?: boolean;
	name?: string;
	prefetch?: boolean;
}) => {
	return (
		<Link href={href} prefetch={!!prefetch}>
			<NavItem active={!!isActive}>
				{image ? (
					<Image src={image} width={56} height={56} alt={'new'} />
				) : (
					<Typography variant={'h4'}>{name || 'Project'}</Typography>
				)}
			</NavItem>
		</Link>
	);
};

const NavContainer = styled('nav')({
	width: '80px',
	height: '100%',
	borderRight: '0.5px solid #CBD5E1',
	background: '#fff',
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
