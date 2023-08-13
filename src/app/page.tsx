import { Box, Card, Container, Typography } from '@mui/material';

import Link from 'next/link';

import Example from '@/components/example/example';

import SimpleGlobalLoading from '@/components/loading';

export default function Home() {
	return (
		<main style={{ flex: 1, padding: '24px' }}>
			<Container maxWidth="lg">
				<Box>
					<Card raised sx={{ padding: '20px' }}>
						<Typography variant="h2">Hello FairSharing</Typography>
						<Link href={'/project/1'}>
							<Typography variant="subtitle1">Go to project pages</Typography>
						</Link>
						<Link href={'/project/create'}>
							<Typography variant="subtitle1">create project</Typography>
						</Link>
						<Example />
						<SimpleGlobalLoading />
					</Card>
				</Box>
			</Container>
		</main>
	);
}
