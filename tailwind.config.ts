import flowbite from 'flowbite/plugin';
import type { Config } from 'tailwindcss';

export default {
	content: [
		'./src/**/*.{js,ts,jsx,tsx}',
		'./src/app/**/*.{js,ts,jsx,tsx}',
		'./src/pages/**/*.{js,ts,jsx,tsx}',
		'./src/components/**/*.{js,ts,jsx,tsx}',
		'./node_modules/flowbite/**/*.js',
	],
	theme: {
		extend: {
			colors: {
				'spotify-green': '#1db954',
				'spotify-black': '#191414',
				'spotify-dark-gray': '#121212',
				'spotify-medium-gray': '#535353',
				'spotify-light-gray': '#b3b3b3',
			},
			fontFamily: {
				sans: [
					'system-ui',
					'Segoe UI',
					'Roboto',
					'Helvetica Neue',
					'Arial',
					'sans-serif',
				],
			},
		},
	},
	plugins: [flowbite],
} satisfies Config;
