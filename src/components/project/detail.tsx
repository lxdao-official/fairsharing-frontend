'use client';

import { useEffect } from 'react';

import { usePathname } from 'next/navigation';

import { getProjectList } from '@/services/project';

export default function ProjectDetail() {
	const pathname = usePathname();

	useEffect(() => {
		getProjectList({
			currentPage: 1,
			pageSize: 20,
		});
	}, []);

	return <div>My Project: {pathname}</div>;
}
