'use client';

import { styled, Typography } from '@mui/material';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

import { useProjectStore } from '@/store/project';

export default function Nav() {
	const { currentProject, projectList } = useProjectStore();
	const pathname = usePathname();
	useEffect(() => {
		console.log('pathname', pathname);
	}, [pathname]);
	return (
		<NavContainer>
			<Item href={'/'} image={'/images/home.png'} isActive={pathname === '/'} />
			{projectList.map((project, idx) => (
				<Item
					href={`/project/${project.id}/contribution`}
					key={project.id}
					name={project.name}
					isActive={pathname.indexOf(`/project/${project.id}`) > -1}
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
