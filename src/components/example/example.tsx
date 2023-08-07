'use client';

import { Box, Button, Container, Typography } from '@mui/material';
import { useEffect } from 'react';

const Example = () => {
	const handleClickButton = () => {
		console.log('hi');
	};
	return (
		<Container maxWidth="lg">
			<Box
				sx={{
					display: 'flex',
					flexDirection: 'column',
					justifyContent: 'center',
					alignItems: 'center',
				}}
			>
				<Typography variant="body1" gutterBottom>
					Example Component
				</Typography>
			</Box>
		</Container>
	);
};

export default Example;
