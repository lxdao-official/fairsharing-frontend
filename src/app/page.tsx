'use client';

import { Container, Typography } from '@mui/material';

import ProjectItem from '@/components/project/projectItem';
import { StyledFlexBox } from '@/components/styledComponents';
import { useProjectStore } from '@/store/project';

export default function Home() {
	const { projectList } = useProjectStore();

	return (
		<main style={{ flex: 1, padding: '24px' }}>
			<Container maxWidth="lg">
				<Typography variant={'h4'}>All Projects({projectList.length})</Typography>
				<StyledFlexBox sx={{ flexWrap: 'wrap', marginTop: '24px' }}>
					{projectList.map((project, idx) => (
						// @ts-ignore
						<ProjectItem key={idx} project={project} />
					))}
				</StyledFlexBox>
			</Container>
		</main>
	);
}
