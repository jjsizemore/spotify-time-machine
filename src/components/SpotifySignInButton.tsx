import React from 'react';
import { signIn } from 'next-auth/react';

interface SpotifySignInButtonProps {
  className?: string;
  callbackUrl?: string;
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
}

export default function SpotifySignInButton({
  className = '',
  callbackUrl = '/dashboard',
  size = 'md',
  fullWidth = false
}: SpotifySignInButtonProps) {
  // Size configurations
  const sizeConfig = {
    sm: {
      button: 'py-2 px-4 text-sm',
      icon: 20,
      spacing: 'pl-8'
    },
    md: {
      button: 'py-3 px-6 text-base',
      icon: 24,
      spacing: 'pl-10'
    },
    lg: {
      button: 'py-4 px-8 text-lg',
      icon: 28,
      spacing: 'pl-12'
    }
  };

  const { button, spacing } = sizeConfig[size];
  const widthClass = fullWidth ? 'w-full' : '';

  return (
    <button
      onClick={() => signIn('spotify', { callbackUrl })}
      className={`relative ${widthClass} flex justify-center ${button} font-medium rounded-full text-spotify-black bg-spotify-green hover:bg-spotify-green/90 transition focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 ${className}`}
    >
      <span className={`absolute left-0 inset-y-0 flex items-center ${spacing}`}>
      </span>
      Sign in with Spotify
    </button>
  );
}