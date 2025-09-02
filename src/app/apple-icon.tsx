import { ImageResponse } from 'next/og';
import {
	SPOTIFY_BLACK,
	SPOTIFY_DARK_GRAY,
	SPOTIFY_GREEN,
} from '../lib/branding';

// Apple icon metadata
export const size = {
	width: 180,
	height: 180,
};
export const contentType = 'image/png';

// Apple icon generation
export default function AppleIcon() {
	return new ImageResponse(
		<div
			style={{
				width: '100%',
				height: '100%',
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'center',
				background: SPOTIFY_BLACK,
			}}
		>
			{/* Main circle with stroke */}
			<div
				style={{
					width: 140,
					height: 140,
					borderRadius: '50%',
					background: SPOTIFY_DARK_GRAY,
					border: `3px solid ${SPOTIFY_GREEN}`,
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
					position: 'relative',
				}}
			>
				{/* Inner circle */}
				<div
					style={{
						width: 120,
						height: 120,
						borderRadius: '50%',
						background: SPOTIFY_DARK_GRAY,
						border: `2px solid ${SPOTIFY_GREEN}`,
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
						position: 'relative',
					}}
				>
					{/* Clock hand - vertical */}
					<div
						style={{
							position: 'absolute',
							width: 4,
							height: 40,
							background: SPOTIFY_GREEN,
							borderRadius: 2,
							top: 20,
							left: '50%',
							transform: 'translateX(-50%) rotate(-15deg)',
							transformOrigin: 'bottom center',
						}}
					/>
					{/* Clock hand - horizontal */}
					<div
						style={{
							position: 'absolute',
							width: 30,
							height: 3,
							background: SPOTIFY_GREEN,
							borderRadius: 2,
							right: 25,
						}}
					/>
					{/* Center dot */}
					<div
						style={{
							width: 8,
							height: 8,
							borderRadius: '50%',
							background: SPOTIFY_GREEN,
						}}
					/>
				</div>
			</div>
		</div>,
		{
			...size,
		}
	);
}
