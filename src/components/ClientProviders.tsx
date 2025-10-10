// Server Component wrapper for global client+server capable providers.
import React from 'react';
import { ConsentAwareAnalytics } from '@/components/analytics/ConsentAwareAnalytics';

interface Props {
  children: React.ReactNode;
}

export default function ClientProviders({ children }: Props) {
  return (
    <>
      {children}
      {/* Client components */}
      <ConsentAwareAnalytics />
    </>
  );
}
