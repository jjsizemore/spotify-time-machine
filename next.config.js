/** @type {import('next').NextConfig} */
const nextConfig = {
	reactStrictMode: true,
	images: {
		domains: ['i.scdn.co', 'mosaic.scdn.co', 'platform-lookaside.fbsbx.com'],
	},
};

module.exports = nextConfig;
