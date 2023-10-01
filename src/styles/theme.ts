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
		// primary: {
		// 	light: '#757ce8',
		// 	main: '#3f50b5',
		// 	dark: '#002884',
		// 	contrastText: '#fff',
		// },
		// secondary: {
		// 	light: '#ff7961',
		// 	main: '#f44336',
		// 	dark: '#ba000d',
		// 	contrastText: '#000',
		// }
	},
	typography: {
		fontFamily: roboto.style.fontFamily,

		h1: {
			fontSize: 56,
			color: '#0F172A',
			fontWeight: 'bold',
		},
		h2: {
			fontSize: 36,
			fontWeight: 'bold',
		},
		h3: {
			fontSize: 28,
			fontWeight: 'bold',
		},
		h4: {
			fontSize: 20,
			color: '#1E293B',
			fontWeight: 'bold',
		},
		h5: {
			fontSize: 16,
			fontWeight: 'bold',
		},
		subtitle1: {
			fontSize: 20,
			fontWeight: 'bold',
		},
		subtitle2: {
			fontSize: 18,
			fontWeight: 'bold',
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
		MuiButton: {
			// styleOverrides: {
			// 	root: {
			// 		minWith: '128px',
			// 		backgroundColor: '#1DE9B6',
			// 		color: '#0F172A',
			// 		fontWeight: 'bold',
			// 		boxShadow: 'none',
			// 		'&:hover': {
			// 			background: 'rgba(29, 233, 182, .8)',
			// 			boxShadow: 'none',
			// 		},
			// 	},
			// },
			variants: [
				{
					props: { variant: 'contained' },
					style: {
						minWidth: '128px',
						backgroundColor: '#1DE9B6',
						color: '#0F172A',
						fontWeight: 'bold',
						boxShadow: 'none',
						'&:hover': {
							background: 'rgba(29, 233, 182, .8)',
							boxShadow: 'none',
						},
					},
				},
				{
					props: { variant: 'outlined' },
					style: {
						minWidth: '128px',
						color: '#0F172A',
						fontWeight: 'bold',
						boxShadow: 'none',
						borderColor: 'rgba(15, 23, 42, 0.2)',
					},
				},
			],
		},
		MuiAlert: {
			styleOverrides: {
				root: ({ ownerState }) => ({
					...(ownerState.severity === 'info' && {
						backgroundColor: '#60a5fa',
					}),
				}),
			},
		},
		MuiStepIcon: {
			styleOverrides: {
				root: {
					border: '1px solid #CBD5E1',
					borderRadius: '100%',
					color: '#fff',
					'&.Mui-active': {
						color: '#0F172A',
					},
					'&.Mui-completed': {
						color: '#0F172A',
					},
				},
				text: {
					fill: '#CBD5E1',
					fontSize: '16px',
					fontWeight: 'bold',
				},
			},
		},
		MuiTabs: {
			styleOverrides: {
				indicator: {
					backgroundColor: '#0F172A',
				},
			},
		},
	},
});

export default theme;
