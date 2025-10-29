// Server Component wrapper for global client+server capable providers.
import React from 'react';
import { AnalyticsProviders } from '@/components/providers/AnalyticsProviders';

interface Props {
  children: React.ReactNode;
  nonce?: string;
}

export default function ClientProviders({ children, nonce }: Readonly<Props>) {
  return (
    <>
      {children}
      {/* Analytics providers */}
      <AnalyticsProviders nonce={nonce} />
    </>
  );
}
