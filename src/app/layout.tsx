import '../styles/globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import React from 'react';
import NextTopLoader from 'nextjs-toploader';

import { AppBar, Toolbar, Typography } from '@mui/material';

import Image from 'next/image';

import Link from 'next/link';

import ThemeRegistry from '@/components/themeRegistry/themeRegistry';
import { RainbowProvider } from '@/components/rainbow/provider';

import Nav from '@/components/nav/nav';

import SimpleGlobalLoading from '@/components/loading';

import SimpleSnackbar from '@/components/simpleSnackbar/snackbar';

import styles from '../styles/layout.module.css';
import User from '@/components/header/user';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
	title: 'FairSharing',
	description: 'FairSharing Platform ',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en">
			<body className={inter.className}>
				<NextTopLoader />
				<ThemeRegistry>
					<RainbowProvider>
						<AppBar
							position="fixed"
							sx={{
								backgroundColor: 'white',
								height: '64px',
								borderBottom: '0.5px solid #CBD5E1',
								boxShadow: 'none',
								zIndex: 1000,
							}}
							enableColorOnDark={true}
						>
							<Toolbar>
								<Link
									href={'/'}
									style={{ display: 'flex', flex: 1, alignItems: 'center' }}
								>
									<Image
										src={'/images/FS_logo.png'}
										width={28}
										height={28}
										alt={'FS'}
									/>

									<Typography
										variant="h4"
										sx={{ flexGrow: 1, fontWeight: 'bold', marginLeft: '8px' }}
									>
										FairSharing
									</Typography>
								</Link>
								<User />
							</Toolbar>
						</AppBar>
						<div className={styles.main}>
							<Nav />
							{children}
						</div>
						<SimpleGlobalLoading />
						<SimpleSnackbar />
					</RainbowProvider>
				</ThemeRegistry>
			</body>
		</html>
	);
}
