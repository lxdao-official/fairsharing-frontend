import React from 'react';

import styles from '@/styles/project.module.css';
import ProjectNav from '@/components/project/projectNav';

export default function ProjectLayout({ children }: { children: React.ReactNode }) {
	return (
		<div className={styles.projectContainer}>
			<ProjectNav />
			{children}
		</div>
	);
}
