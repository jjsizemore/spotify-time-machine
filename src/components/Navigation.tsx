import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface NavigationProps {
  user?: {
    name?: string | null;
    image?: string | null;
  } | null | undefined;
}

export default function Navigation({ user }: NavigationProps) {
  const pathname = usePathname();

  return (
    <nav className="bg-spotify-dark-gray px-6 py-4 flex flex-col md:flex-row md:items-center justify-between border-b border-spotify-medium-gray">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard">
            <Image
              src="/spotify-icon.png"
              alt="Spotify Logo"
              width={32}
              height={32}
              className="drop-shadow-lg"
            />
          </Link>
          <h1 className="text-xl font-bold text-spotify-green">Time Machine</h1>
        </div>

        <div className="md:hidden flex items-center gap-4">
          {user?.image && (
            <Image
              src={user.image}
              alt="Profile"
              width={32}
              height={32}
              className="rounded-full"
            />
          )}
        </div>
      </div>

      <div className="flex flex-col md:flex-row items-start md:items-center gap-4 mt-4 md:mt-0">
        <div className="flex items-center gap-6 w-full md:w-auto">
          <Link
            href="/dashboard"
            className={`text-sm font-medium ${
              pathname === '/dashboard'
                ? 'text-spotify-green'
                : 'text-spotify-light-gray hover:text-spotify-white'
            }`}
          >
            Dashboard
          </Link>
          <Link
            href="/history"
            className={`text-sm font-medium ${
              pathname === '/history'
                ? 'text-spotify-green'
                : 'text-spotify-light-gray hover:text-spotify-white'
            }`}
          >
            History
          </Link>
          <Link
            href="/playlist-generator"
            className={`text-sm font-medium ${
              pathname === '/playlist-generator'
                ? 'text-spotify-green'
                : 'text-spotify-light-gray hover:text-spotify-white'
            }`}
          >
            Playlist Generator
          </Link>
        </div>

        <div className="hidden md:flex items-center gap-4">
          {user?.image && (
            <Image
              src={user.image}
              alt="Profile"
              width={32}
              height={32}
              className="rounded-full"
            />
          )}
          <span className="text-spotify-light-gray">{user?.name}</span>
        </div>
      </div>
    </nav>
  );
}