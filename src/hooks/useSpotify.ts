import { useSession, signIn } from 'next-auth/react';
import { useEffect } from 'react';
import { spotifyApi } from '@/lib/spotify';

export const useSpotify = () => {
  const { data: session } = useSession();

  useEffect(() => {
    if (session) {
      // If refresh token attempt failed, direct user to login
      if (session.error === 'RefreshAccessTokenError') {
        signIn('spotify');
        return;
      }

      // Set the access token on the spotifyApi instance
      if (session.accessToken) {
        spotifyApi.setAccessToken(session.accessToken);
      }
    }
  }, [session]);

  return spotifyApi;
};