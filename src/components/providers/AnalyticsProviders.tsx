'use client';

import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import Script from 'next/script';

export function AnalyticsProviders() {
  return (
    <>
      {/* Google Analytics 4 for Core Web Vitals */}
      <Script
        src="https://www.googletagmanager.com/gtag/js?id=G-CD6VHDL1HS"
        strategy="afterInteractive"
        onLoad={() => {
          if (process.env.NODE_ENV === 'development') {
            console.log('📊 Google Analytics script loaded');
          }
        }}
      />
      <Script
        id="google-analytics"
        strategy="afterInteractive"
        onLoad={() => {
          if (process.env.NODE_ENV === 'development') {
            console.log('📊 Google Analytics initialized');
          }
        }}
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
					${process.env.NODE_ENV === 'development' ? 'console.log("📊 Google Analytics config executed");' : ''}
				`,
        }}
      />

      {/* Vercel Analytics */}
      <Analytics
        beforeSend={(event) => {
          if (process.env.NODE_ENV === 'development') {
            console.log('📊 Vercel Analytics event:', event.type);
          }
          return event;
        }}
      />

      {/* Vercel Speed Insights */}
      <SpeedInsights />
    </>
  );
}
