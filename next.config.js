/** @type {import('next').NextConfig} */
const nextConfig = {
	reactStrictMode: true,
	images: {
		remotePatterns: [
			{
				protocol: 'https',
				hostname: 'i.scdn.co',
				port: '',
				pathname: '/image/**',
			},
			{
				protocol: 'https',
				hostname: 'mosaic.scdn.co',
				port: '',
				pathname: '/image/**',
			},
			{
				protocol: 'https',
				hostname: 'platform-lookaside.fbsbx.com',
				port: '',
				pathname: '/image/**',
			},
		],
	},
};

module.exports = nextConfig;
