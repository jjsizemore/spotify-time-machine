const withFlowbiteReact = require('flowbite-react/plugin/nextjs');

/** @type {import('next').NextConfig} */
const nextConfig = {
	allowedDevOrigins: ['127.0.0.1'],
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

module.exports = withFlowbiteReact(nextConfig);
