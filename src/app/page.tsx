import { Box, Card, Container, Typography } from '@mui/material';

import Link from 'next/link';

import Example from '@/components/example/example';

import SimpleGlobalLoading from '@/components/loading';

export default function Home() {
	return (
		<main style={{ flex: 1, padding: '24px' }}>
			<Container maxWidth="lg">
				<Box>
					<Card raised sx={{ padding: '20px' }}></Card>
				</Box>
			</Container>
		</main>
	);
}
