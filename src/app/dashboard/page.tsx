'use client';

import React from 'react';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import Link from 'next/link';

export default function Dashboard() {
  const { data: session } = useSession();

  return (
    <div className="min-h-screen bg-spotify-black">
      {/* Top Navigation Bar */}
      <nav className="bg-spotify-dark-gray px-6 py-4 flex items-center justify-between border-b border-spotify-medium-gray">
        <div className="flex items-center gap-4">
          <Image
            src="/spotify-icon.png"
            alt="Spotify Logo"
            width={32}
            height={32}
            className="drop-shadow-lg"
          />
          <h1 className="text-xl font-bold text-spotify-green">Time Machine</h1>
        </div>
        <div className="flex items-center gap-4">
          {session?.user?.image && (
            <Image
              src={session.user.image}
              alt="Profile"
              width={32}
              height={32}
              className="rounded-full"
            />
          )}
          <span className="text-spotify-light-gray">{session?.user?.name}</span>
        </div>
      </nav>

      {/* Main Content */}
      <main className="p-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Time Machine Card */}
          <div className="bg-spotify-dark-gray p-6 rounded-lg hover:bg-spotify-dark-gray/80 transition cursor-pointer">
            <h2 className="text-2xl font-bold text-spotify-green mb-4">Time Machine</h2>
            <p className="text-spotify-light-gray mb-4">
              Travel back in time and explore your listening history from any month.
            </p>
            <button className="bg-spotify-green text-spotify-black font-bold px-4 py-2 rounded-full hover:bg-spotify-green/90 transition">
              Start Journey
            </button>
          </div>

          {/* Playlist Generator Card */}
          <div className="bg-spotify-dark-gray p-6 rounded-lg hover:bg-spotify-dark-gray/80 transition cursor-pointer">
            <h2 className="text-2xl font-bold text-spotify-green mb-4">Playlist Generator</h2>
            <p className="text-spotify-light-gray mb-4">
              Create custom playlists based on your favorite time periods.
            </p>
            <button className="bg-spotify-green text-spotify-black font-bold px-4 py-2 rounded-full hover:bg-spotify-green/90 transition">
              Generate Playlist
            </button>
          </div>

          {/* Stats Card */}
          <div className="bg-spotify-dark-gray p-6 rounded-lg hover:bg-spotify-dark-gray/80 transition cursor-pointer">
            <h2 className="text-2xl font-bold text-spotify-green mb-4">Your Stats</h2>
            <p className="text-spotify-light-gray mb-4">
              View detailed statistics about your listening habits.
            </p>
            <button className="bg-spotify-green text-spotify-black font-bold px-4 py-2 rounded-full hover:bg-spotify-green/90 transition">
              View Stats
            </button>
          </div>
        </div>

        {/* Recent Activity Section */}
        <div className="mt-8">
          <h2 className="text-2xl font-bold text-spotify-light-gray mb-4">Recent Activity</h2>
          <div className="bg-spotify-dark-gray rounded-lg p-6">
            <p className="text-spotify-medium-gray text-center">
              Your recent activity will appear here
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}