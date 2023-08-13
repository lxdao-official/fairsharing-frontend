import { Roboto } from 'next/font/google';
import { createTheme } from '@mui/material/styles';

const roboto = Roboto({
	weight: ['300', '400', '500', '700'],
	subsets: ['latin'],
	display: 'swap',
});

const theme = createTheme({
	palette: {
		mode: 'light',
	},
	typography: {
		fontFamily: roboto.style.fontFamily,

		h1: {
			fontSize: 56,
			color: '#0F172A',
		},
		h2: {
			fontSize: 36,
		},
		h3: {
			fontSize: 28,
		},
		h4: {
			fontSize: 20,
			color: '#1E293B',
		},
		h5: {
			fontSize: 16,
		},
		subtitle1: {
			fontSize: 20,
		},
		subtitle2: {
			fontSize: 18,
		},
		body1: {
			fontSize: 16,
		},
		body2: {
			fontSize: 14,
		},
	},
	breakpoints: {
		values: {
			xs: 0,
			sm: 600,
			md: 900,
			lg: 1200,
			xl: 1536,
		},
	},
	components: {
		MuiAlert: {
			styleOverrides: {
				root: ({ ownerState }) => ({
					...(ownerState.severity === 'info' && {
						backgroundColor: '#60a5fa',
					}),
				}),
			},
		},
	},
});

export default theme;
