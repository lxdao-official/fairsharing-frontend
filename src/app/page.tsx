'use client';

import { Container, Grid, Typography } from '@mui/material';

import useSWR from 'swr';

import ProjectItem from '@/components/project/projectItem';
import { StyledFlexBox } from '@/components/styledComponents';
import { getProjectList } from '@/services/project';

export default function Home() {
	const {
		data: { list: projectList, total },
	} = useSWR(
		['project/list/all'],
		() =>
			getProjectList({
				currentPage: 1,
				pageSize: 50,
			}),
		{
			fallbackData: { list: [], total: 0, totalPage: 0, currentPage: 1, pageSize: 50 },
			onSuccess: (data) => console.log('getProjectList ALL', data),
		},
	);

	return (
		<main style={{ flex: 1, padding: '24px', overflowY: 'scroll' }}>
			<Container maxWidth="lg">
				<Typography variant={'h4'} sx={{ marginBottom: '24px' }}>
					All Projects({total})
				</Typography>
				<Grid container spacing={5}>
					{projectList.map((project, idx) => (
						// @ts-ignore
						<ProjectItem key={idx} project={project} />
					))}
				</Grid>
			</Container>
		</main>
	);
}
