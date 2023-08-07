import { Box, Card, Container, Typography } from '@mui/material';

import Example from '@/components/example/example';

import SimpleGlobalLoading from '@/components/loading';

import styles from '../styles/page.module.css';

export default function Home() {
	return (
		<main className={styles.main}>
			<Container maxWidth="lg">
				<Box>
					<Card raised sx={{ padding: '20px' }}>
						<Typography variant="h2">Hello FairSharing</Typography>
						<Example />
						<SimpleGlobalLoading />
					</Card>
				</Box>
			</Container>
		</main>
	);
}
