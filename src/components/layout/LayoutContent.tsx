'use client';

import { useSession } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import React from 'react';
import Footer from './Footer';
import Header from './Header';

export function LayoutContent({ children }: { children: React.ReactNode }) {
  const { status } = useSession();
  const pathname = usePathname();

  // Don't show navigation on landing page or signin page
  const isAuthPage = pathname === '/' || pathname === '/auth/signin';
  const isAuthenticated = status === 'authenticated';

  // Only show Header and Footer if user is authenticated
  const showNavigation = isAuthenticated && !isAuthPage;

  return (
    <div className="flex flex-col min-h-screen">
      {showNavigation && <Header />}
      <main className="flex-grow">{children}</main>
      <Footer />
    </div>
  );
}
