'use client';

import { Box, Grid, styled, Typography } from '@mui/material';

import { Img3 } from '@lxdao/img3';
import React from 'react';
import Link from 'next/link';

import { IProject } from '@/services/types';

export interface IProjectItemProps {
	project: IProject;
}

const ProjectItem = (props: IProjectItemProps) => {
	const { project } = props;

	return (
		<Grid item lg={4} xl={3}>
			<Link href={`/project/${project.id}/contribution`} prefetch={true}>
				<Container>
					<Img3
						src={project.logo as string}
						style={{
							width: '88px',
							height: '88px',
							borderRadius: '88px',
							border: '0.5px solid #CBD5E1',
						}}
					/>
					<Typography
						variant={'h3'}
						sx={{ marginTop: '16px', fontSize: '24px', color: '#0F172A' }}
					>
						{project.name}
					</Typography>
				</Container>
			</Link>
		</Grid>
	);
};

export default ProjectItem;

const Container = styled(Box)({
	width: '280px',
	height: '256px',
	border: '1px solid #0F172A29',
	borderRadius: '8px',
	cursor: 'pointer',
	// margin: '0 24px 24px 0',
	'&:hover': {
		opacity: [0.9, 0.8, 0.7],
		boxShadow: '0px 4px 18px 3px #0000000A',
	},
	display: 'flex',
	flexDirection: 'column',
	justifyContent: 'center',
	alignItems: 'center',
});
