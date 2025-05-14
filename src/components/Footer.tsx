'use client';

import { IconType } from 'react-icons';
import { FiGithub, FiHome, FiLinkedin, FiMail } from 'react-icons/fi';

export default function Footer() {
	const iconStyle = {
		color: '#b3b3b3', // spotify-light-gray
		transition: 'color 0.3s',
	};

	const iconHoverStyle = {
		color: '#1db954', // spotify-green
	};

	const socialIcons: { icon: IconType; href: string; label: string }[] = [
		{
			icon: FiHome,
			href: 'https://www.jermainesizemore.com',
			label: 'Personal Website',
		},
		{
			icon: FiGithub,
			href: 'https://github.com/jjsizemore/',
			label: 'GitHub Profile',
		},
		{
			icon: FiLinkedin,
			href: 'https://www.linkedin.com/in/jermainesizemore/',
			label: 'LinkedIn Profile',
		},
		{
			icon: FiMail,
			href: 'mailto:me@jermainesizemore.com',
			label: 'Email Contact',
		},
	];

	return (
		<footer className="bg-spotify-dark-gray py-8 mt-auto border-t border-spotify-medium-gray">
			<div className="container mx-auto px-4">
				<div className="flex flex-col items-center">
					<div className="flex" style={{ gap: '1rem', marginBottom: '1rem' }}>
						{socialIcons.map(({ icon: Icon, href, label }) => (
							<a
								key={label}
								href={href}
								target={href.startsWith('mailto:') ? undefined : '_blank'}
								rel={
									href.startsWith('mailto:') ? undefined : 'noopener noreferrer'
								}
								className="transition-colors"
								aria-label={label}
								style={iconStyle}
								onMouseOver={(e) =>
									Object.assign(e.currentTarget.style, iconHoverStyle)
								}
								onMouseOut={(e) =>
									Object.assign(e.currentTarget.style, iconStyle)
								}
							>
								<Icon size={24} />
							</a>
						))}
					</div>
					<p className="text-spotify-light-gray text-center text-sm mb-4">
						&copy; {new Date().getFullYear()} Jermaine Sizemore. All rights
						reserved.
					</p>
				</div>
			</div>
		</footer>
	);
}
