import { Box, Card, Container, Typography } from '@mui/material';

import Example from '@/components/example/example';

import styles from './page.module.css';

export default function Home() {
	return (
		<main className={styles.main}>
			<Container maxWidth="lg">
				<Box>
					<Card raised sx={{ padding: '20px' }}>
						<Typography variant="h2">Hello World</Typography>
						<Example />
					</Card>
				</Box>
			</Container>
		</main>
	);
}
