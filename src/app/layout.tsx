import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import React from 'react';

import { AppBar, Toolbar, Typography } from '@mui/material';
import { Dashboard as DashboardIcon } from '@mui/icons-material';

import ThemeRegistry from '@/components/themeRegistry/themeRegistry';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
	title: 'FairSharing',
	description: 'FairSharing Platform',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en">
			<body className={inter.className}>
				<ThemeRegistry>
					<AppBar position="fixed" sx={{ zIndex: 2000 }}>
						<Toolbar sx={{ backgroundColor: 'background.paper' }}>
							<DashboardIcon
								sx={{ color: '#444', mr: 2, transform: 'translateY(-2px)' }}
							/>
							<Typography variant="h6" noWrap component="div" color="black">
								LXDAO FairSharing at Web3
							</Typography>
						</Toolbar>
					</AppBar>
					{children}
				</ThemeRegistry>
			</body>
		</html>
	);
}
