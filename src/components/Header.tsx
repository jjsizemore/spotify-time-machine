'use client';

import React from 'react';
import Navigation from './Navigation';
import { useSession } from 'next-auth/react';

export default function Header() {
  const { data: session } = useSession();

  return (
    <header className="sticky top-0 z-50 w-full">
      <Navigation user={session?.user} />
    </header>
  );
}