'use client';

import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import Script from 'next/script';
import { useEffect } from 'react';
import { initializeAnalytics } from '@/lib/analytics';

declare global {
  interface Window {
    posthog?: any;
  }
}

export function AnalyticsProviders() {
  useEffect(() => {
    // Initialize analytics with robust error handling
    let mounted = true;

    const setupAnalytics = async () => {
      if (!mounted) return;

      await initializeAnalytics();
    };

    // Delay initialization to prevent blocking render
    const timeoutId = setTimeout(setupAnalytics, 100);

    return () => {
      mounted = false;
      clearTimeout(timeoutId);
    };
  }, []);

  return (
    <>
      {/* Google Analytics 4 - Only in Production */}
      {typeof process !== 'undefined' && process.env.NODE_ENV === 'production' && (
        <>
          <Script
            src="https://www.googletagmanager.com/gtag/js?id=G-CD6VHDL1HS"
            strategy="afterInteractive"
          />
          <Script
            id="google-analytics"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', 'G-CD6VHDL1HS', {
                  page_title: document.title,
                  page_location: window.location.href,
                  custom_map: {
                    'custom_parameter_1': 'core_web_vitals'
                  }
                });
              `,
            }}
          />
        </>
      )}{' '}
      {/* Vercel Analytics - Only in Production */}
      {typeof process !== 'undefined' && process.env.NODE_ENV === 'production' ? (
        <>
          <Analytics />
          <SpeedInsights />
        </>
      ) : (
        <div style={{ display: 'none' }}>{/* Analytics disabled in development */}</div>
      )}
    </>
  );
}
