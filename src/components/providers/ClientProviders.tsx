// Server Component wrapper for global client+server capable providers.
import React from 'react';
import { AnalyticsProviders } from '@/components/providers/AnalyticsProviders';

interface Props {
  children: React.ReactNode;
}

export default function ClientProviders({ children }: Props) {
  return (
    <>
      {children}
      {/* Analytics providers */}
      <AnalyticsProviders />
    </>
  );
}
