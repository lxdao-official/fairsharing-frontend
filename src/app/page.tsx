'use client';

import { Container, Typography } from '@mui/material';

import useSWR from 'swr';

import { Img3Provider } from '@lxdao/img3';

import ProjectItem from '@/components/project/projectItem';
import { getProjectList } from '@/services/project';
import { defaultGateways } from '@/constant/img3';

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
			// onSuccess: (data) => console.log('getProjectList ALL', data),
		},
	);

	return (
		<Img3Provider defaultGateways={defaultGateways}>
			<main style={{ flex: 1, padding: '24px', overflowY: 'scroll' }}>
				<Container maxWidth="xl">
					<Typography variant={'h4'} sx={{ marginBottom: '24px' }}>
						All Projects({total})
					</Typography>
					<div
						style={{
							display: 'grid',
							gridGap: '28px',
							gridTemplateColumns: 'repeat(auto-fit, 280px)',
							justifyContent: 'center',
						}}
					>
						{projectList.map((project, idx) => (
							// @ts-ignore
							<ProjectItem key={idx} project={project} />
						))}
					</div>
				</Container>
			</main>
		</Img3Provider>
	);
}
