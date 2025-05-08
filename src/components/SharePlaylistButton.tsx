'use client';

import React, { useState } from 'react';

interface SharePlaylistButtonProps {
  playlistUrl: string;
  playlistName: string;
}

export default function SharePlaylistButton({ playlistUrl, playlistName }: SharePlaylistButtonProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(prev => !prev);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(playlistUrl).then(() => {
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    });
    setIsMenuOpen(false);
  };

  const shareOnTwitter = () => {
    const text = `Check out my Spotify playlist: ${playlistName}`;
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(playlistUrl)}`;
    window.open(url, '_blank');
    setIsMenuOpen(false);
  };

  const shareOnFacebook = () => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(playlistUrl)}`;
    window.open(url, '_blank');
    setIsMenuOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={toggleMenu}
        className="flex items-center gap-2 bg-spotify-medium-gray hover:bg-spotify-medium-gray/70 text-spotify-white px-4 py-2 rounded-full transition"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
          />
        </svg>
        Share
      </button>

      {isMenuOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-spotify-dark-gray rounded-md shadow-lg z-10">
          <ul className="py-1">
            <li>
              <button
                onClick={copyToClipboard}
                className="flex items-center gap-2 w-full text-left px-4 py-2 text-spotify-white hover:bg-spotify-medium-gray/30"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"
                  />
                </svg>
                Copy link
              </button>
            </li>
            <li>
              <button
                onClick={shareOnTwitter}
                className="flex items-center gap-2 w-full text-left px-4 py-2 text-spotify-white hover:bg-spotify-medium-gray/30"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                </svg>
                Share on Twitter
              </button>
            </li>
            <li>
              <button
                onClick={shareOnFacebook}
                className="flex items-center gap-2 w-full text-left px-4 py-2 text-spotify-white hover:bg-spotify-medium-gray/30"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"/>
                </svg>
                Share on Facebook
              </button>
            </li>
          </ul>
        </div>
      )}

      {copySuccess && (
        <div className="absolute top-10 right-0 mt-2 bg-spotify-green text-spotify-black px-3 py-1 rounded-md text-sm">
          Link copied!
        </div>
      )}
    </div>
  );
}