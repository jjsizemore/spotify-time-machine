import withFlowbiteReact from 'flowbite-react/plugin/nextjs';
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
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

export default withFlowbiteReact(nextConfig);
