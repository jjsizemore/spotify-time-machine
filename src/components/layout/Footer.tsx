'use client';

import { useState } from 'react';
import { FiGithub, FiHome, FiLinkedin, FiMail } from 'react-icons/fi';
import { getIconStyle } from '@/lib/styleUtils';

type IconComponent = typeof FiHome;

type SocialIcon = {
  icon: IconComponent;
  href: string;
  label: string;
};

export default function Footer() {
  const socialIcons: SocialIcon[] = [
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

  const [hovered, setHovered] = useState<string | null>(null);

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
                rel={href.startsWith('mailto:') ? undefined : 'noopener noreferrer'}
                className="transition-colors"
                aria-label={label}
                style={getIconStyle(hovered === label)}
                onMouseEnter={() => setHovered(label)}
                onMouseLeave={() => setHovered(null)}
                onFocus={() => setHovered(label)}
                onBlur={() => setHovered(null)}
              >
                <Icon size={24} />
              </a>
            ))}
          </div>
          <p className="text-spotify-light-gray text-center text-sm mb-4">
            &copy; {new Date().getFullYear()} Jermaine Sizemore. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
