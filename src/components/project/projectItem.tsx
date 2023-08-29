'use client';

import { Box, styled, Typography } from '@mui/material';
import { IProject } from '@/services/types';
import { Img3 } from '@lxdao/img3';
import React from 'react';
import Link from 'next/link';

export interface IProjectItemProps {
	project: Partial<IProject> & {
		[key: string]: any
	};
}

const ProjectItem = (props: IProjectItemProps) => {
	const { project } = props;

	return <Link href={`/project/${project.id}/contribution`}>
		<Container>
			<Img3
				src={project.logo as string}
				style={{ width: '88px', height: '88px', borderRadius: '88px' }}
			/>
			<Typography variant={'h5'} sx={{ marginTop: '16px' }}>{project.name}</Typography>
			<Typography variant={'body1'} sx={{ marginTop: '8px' }}>{project.contributionCount}k
				contributions</Typography>
		</Container>;
	</Link>;
};

export default ProjectItem;

const Container = styled(Box)({
	width: '280px',
	height: '256px',
	border: '1px solid #0F172A29',
	borderRadius: '8px',
	cursor: 'pointer',
	margin: '0 24px 24px 0',
	'&:hover': {
		opacity: [0.9, 0.8, 0.7],
		boxShadow: '0px 4px 18px 3px #0000000A',
	},
	display: 'flex',
	flexDirection: 'column',
	justifyContent: 'center',
	alignItems: 'center',
});
