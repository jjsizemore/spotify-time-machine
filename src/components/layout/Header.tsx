'use client';

import { useSession } from 'next-auth/react';
import React from 'react';
import Navigation from './Navigation';

export default function Header() {
  const { data: session } = useSession();

  return (
    <header className="sticky top-0 z-100 w-full">
      <Navigation user={session?.user} />
    </header>
  );
}
