import '../styles/globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import React from 'react';
import NextTopLoader from 'nextjs-toploader';
import { AppBar, Toolbar, Typography } from '@mui/material';
import { Analytics } from '@vercel/analytics/react';
import Image from 'next/image';
import Link from 'next/link';
import { Img3Provider } from '@lxdao/img3';

import ThemeRegistry from '@/components/themeRegistry/themeRegistry';
import { RainbowProvider } from '@/components/rainbow/provider';
import SimpleGlobalLoading from '@/components/loading';
import SimpleSnackbar from '@/components/simpleSnackbar/snackbar';
import User from '@/components/header/user';
import NavLogo from '@/components/navLogo';
import NavLayout from '@/components/navLayout';
import { ZIndexMap } from '@/constant/style';
import { defaultGateways } from '@/constant/img3';

import styles from '../styles/layout.module.css';

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
						<Img3Provider defaultGateways={defaultGateways}>
							<AppBar
								position="fixed"
								sx={{
									backgroundColor: 'white',
									height: '64px',
									borderBottom: '0.5px solid #CBD5E1',
									boxShadow: 'none',
									zIndex: ZIndexMap.AppBar,
								}}
								enableColorOnDark={true}
							>
								<Toolbar>
									<Link
										href={'/'}
										style={{ display: 'flex', flex: 1, alignItems: 'center' }}
									>
										<NavLogo />
										<Typography
											variant="h4"
											sx={{
												flexGrow: 1,
												fontWeight: '500',
												marginLeft: '8px',
											}}
										>
											FairSharing
										</Typography>
									</Link>
									<User />
								</Toolbar>
							</AppBar>
							<div className={styles.main}>
								<NavLayout>{children}</NavLayout>
							</div>
							<SimpleGlobalLoading />
							<SimpleSnackbar />
						</Img3Provider>
					</RainbowProvider>
				</ThemeRegistry>
				<Analytics />
			</body>
		</html>
	);
}
