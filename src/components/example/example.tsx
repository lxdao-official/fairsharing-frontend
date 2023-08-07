'use client';

import { Box, Button, Container, Typography } from '@mui/material';

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
					Environment: {process.env.APP_ENV}
				</Typography>
			</Box>
		</Container>
	);
};

export default Example;
