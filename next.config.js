/** @type {import('next').NextConfig} */
const nextConfig = {
	reactStrictMode: true,
	output: 'standalone',
	swcMinify: true,
	env: {
		APP_ENV: process.env.APP_ENV,
	},
	modularizeImports: {
		'@mui/icons-material': {
			transform: '@mui/icons-material/{{member}}',
		},
	},
	webpack: config => {
		config.resolve.fallback = { fs: false, net: false, tls: false };
		config.externals.push('pino-pretty', 'lokijs', 'encoding');
		return config;
	},
	async rewrites() {
		return process.env.APP_ENV !== 'Production' ? [
			{
				source: '/fs-api/:path*',
				destination: `${process.env.NEXT_PUBLIC_API_HOST_PROXY}/:path*`,
			},
		] : []
	},
}

module.exports = nextConfig
