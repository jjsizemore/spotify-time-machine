import { useSession, signIn } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { spotifyApi } from '@/lib/spotify';

export const useSpotify = () => {
  const { data: session } = useSession();
  const [isReady, setIsReady] = useState(false);

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
        setIsReady(true);
      }
    } else {
      setIsReady(false);
    }
  }, [session]);

  return { spotifyApi, isReady };
};