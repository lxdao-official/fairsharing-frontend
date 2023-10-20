import { Button, Container, Typography } from '@mui/material';

import Link from 'next/link';

export default function Home() {
	return (
		<main style={{ flex: 1, padding: '24px', overflowY: 'scroll' }}>
			<Container maxWidth="lg">
				<Link href={'/list'}>
					<Button variant={'contained'}>All projects</Button>
				</Link>
			</Container>
		</main>
	);
}
