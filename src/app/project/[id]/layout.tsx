'use client';

import React, { useEffect, useState } from 'react';

import styles from '@/styles/project.module.css';
import ProjectNav from '@/components/project/projectNav';
import { usePathname, useRouter } from 'next/navigation';

export default function ProjectLayout({ children }: { children: React.ReactNode }) {
	const pathname = usePathname();
	const [showNav, setShowNav] = useState(true);

	useEffect(() => {
		if (pathname.indexOf('/payment/create') > -1) {
			setShowNav(false);
		} else {
			setShowNav(true);
		}
	}, [pathname]);

	return (
		<div className={styles.projectContainer}>
			{showNav ? <ProjectNav /> : null}
			<div className={styles.content}>{children}</div>
		</div>
	);
}
