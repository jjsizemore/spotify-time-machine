import withFlowbiteReact from 'flowbite-react/plugin/nextjs';
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
	allowedDevOrigins: ['127.0.0.1'],
	reactStrictMode: true,

	// Enhanced Image Optimization for 2025
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
		formats: ['image/avif', 'image/webp'],
		deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
		imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
		minimumCacheTTL: 31536000, // 1 year
		dangerouslyAllowSVG: true,
		contentDispositionType: 'attachment',
		contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
	},

	// Performance and SEO Optimizations
	experimental: {
		optimizePackageImports: [
			'@tanstack/react-query',
			'date-fns',
			'react-icons',
		],
	},

	// Compiler Optimizations
	compiler: {
		removeConsole: process.env.NODE_ENV === 'production',
	},

	// PWA and Caching
	async headers() {
		return [
			{
				source: '/(.*)',
				headers: [
					// Security Headers
					{
						key: 'X-DNS-Prefetch-Control',
						value: 'on',
					},
					{
						key: 'X-XSS-Protection',
						value: '1; mode=block',
					},
					{
						key: 'X-Frame-Options',
						value: 'SAMEORIGIN',
					},
					{
						key: 'X-Content-Type-Options',
						value: 'nosniff',
					},
					{
						key: 'Referrer-Policy',
						value: 'strict-origin-when-cross-origin',
					},
					// Performance Headers
					{
						key: 'X-Clacks-Overhead',
						value: 'GNU Terry Pratchett',
					},
				],
			},
			{
				source: '/favicon.svg',
				headers: [
					{
						key: 'Cache-Control',
						value: 'public, max-age=31536000, immutable',
					},
				],
			},
			{
				source: '/previews/(.*)',
				headers: [
					{
						key: 'Cache-Control',
						value: 'public, max-age=31536000, immutable',
					},
				],
			},
			{
				source: '/(.*).webmanifest',
				headers: [
					{
						key: 'Content-Type',
						value: 'application/manifest+json',
					},
					{
						key: 'Cache-Control',
						value: 'public, max-age=31536000',
					},
				],
			},
		];
	},

	// Advanced redirects for SEO
	async redirects() {
		return [
			{
				source: '/home',
				destination: '/',
				permanent: true,
			},
			{
				source: '/app',
				destination: '/dashboard',
				permanent: true,
			},
			// Legacy manifest.json redirect for backwards compatibility
			{
				source: '/manifest.json',
				destination: '/manifest.webmanifest',
				permanent: true,
			},
		];
	},

	async rewrites() {
		return [
			{
				source: '/api/c15t/:path*',
				destination: `${process.env.NEXT_PUBLIC_C15T_URL}/:path*`,
			},
			{
				source: '/ingest/static/:path*',
				destination: 'https://us-assets.i.posthog.com/static/:path*',
			},
			{
				source: '/ingest/:path*',
				destination: 'https://us.i.posthog.com/:path*',
			},
			{
				source: '/ingest/decide',
				destination: 'https://us.i.posthog.com/decide',
			},
		];
	},

	// Required to support PostHog trailing slash API requests
	skipTrailingSlashRedirect: true,

	// Output configuration for deployment
	output: 'standalone',

	// Disable powered by header
	poweredByHeader: false,

	// Compression
	compress: true,

	// Generate ETags for better caching
	generateEtags: true,

	// Trailing slash redirect
	trailingSlash: false,

	// Skip middleware for specific paths
	skipMiddlewareUrlNormalize: false,
};

export default withFlowbiteReact(nextConfig);
