import { Button, Container, Typography } from '@mui/material';

import Link from 'next/link';

export default function Home() {
	return (
		<main style={{ flex: 1, padding: '24px', overflowY: 'scroll' }}>
			<Container maxWidth="lg">
				<Typography variant={'h4'} sx={{ marginBottom: '24px' }}>
					这是预留给官网的首页
				</Typography>
				<Link href={'/list'}>
					<Button variant={'contained'}>Project List page</Button>
				</Link>
			</Container>
		</main>
	);
}
