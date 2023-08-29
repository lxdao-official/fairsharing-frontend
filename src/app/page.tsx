'use client';

import { Box, Card, Container, Typography } from '@mui/material';

import Link from 'next/link';

import Example from '@/components/example/example';

import SimpleGlobalLoading from '@/components/loading';
import ProjectItem from '@/components/project/projectItem';
import { StyledFlexBox } from '@/components/styledComponents';

const FakeProjectList = [
	{
		id: 1,
		name: 'FS',
		logo: 'https://nftstorage.link/ipfs/bafkreia6koxbcthmyrqqwy2jhmfuj4vaxgkcmdvxf3v5z7k2xtxaf2eauu',
		contributionCount: 12,
	},
	{
		id: 2,
		name: 'Crypto',
		logo: 'https://nftstorage.link/ipfs/bafkreia6koxbcthmyrqqwy2jhmfuj4vaxgkcmdvxf3v5z7k2xtxaf2eauu',
		contributionCount: 13,
	},
	{
		id: 3,
		name: 'Web3',
		logo: 'https://nftstorage.link/ipfs/bafkreia6koxbcthmyrqqwy2jhmfuj4vaxgkcmdvxf3v5z7k2xtxaf2eauu',
		contributionCount: 99,
	},
];

export default function Home() {
	return (
		<main style={{ flex: 1, padding: '24px' }}>
			<Container maxWidth="lg">
				<Typography variant={'h4'}>All Project List</Typography>
				<StyledFlexBox sx={{ flexWrap: 'wrap', marginTop: '24px' }}>
					{FakeProjectList.map((project, idx) => <ProjectItem key={idx} project={project} />)}
				</StyledFlexBox>
			</Container>
		</main>
	);
}
