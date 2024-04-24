'use client';

import React, { useEffect, useState } from 'react';

import { SafeProvider } from '@safe-global/safe-apps-react-sdk';
import { CircularProgress, Typography } from '@mui/material';

export default function ProjectLayout({ children }: { children: React.ReactNode }) {
	return (
		<SafeProvider
			loader={
				<>
					<Typography variant="h6">Waiting for Safe...</Typography>
					<CircularProgress color="primary" />
				</>
			}
		>
			{children}
		</SafeProvider>
		// <>{children}</>
	);
}
