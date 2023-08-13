'use client';

import { usePathname, useParams } from 'next/navigation';

import { Typography } from '@mui/material';
import React, { useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

import styles from '@/styles/project.module.css';

const ProjectNav = () => {
	const pathname = usePathname();
	const params = useParams();
	useEffect(() => {
		console.log('useParams', params);
	}, [params]);
	return (
		<div className={styles.projectNavContainer}>
			<Typography variant={'subtitle2'} style={{ fontWeight: 'bold' }}>
				Project Name
			</Typography>
			<NavItem
				href={`/project/${params.id}/contribution`}
				name={'Contributions'}
				icon={'/images/home.png'}
			/>
			<NavItem
				href={`/project/${params.id}/contributor`}
				name={'Contributors'}
				icon={'/images/home.png'}
			/>
			<NavItem
				href={`/project/${params.id}/dashboard`}
				name={'Dashboard'}
				icon={'/images/home.png'}
			/>
			<NavItem
				href={`/project/${params.id}/setting`}
				name={'Settings'}
				icon={'/images/home.png'}
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
		<Link href={href} style={{ display: 'flex' }}>
			<Image src={icon} width={24} height={24} alt={'icon'} />
			<Typography variant={'body1'}>{name}</Typography>
		</Link>
	);
};
