'use client';

import { useEffect } from 'react';
import * as Sentry from '@sentry/nextjs';

export default function WebVitalsMonitor() {
  useEffect(() => {
    // Initialize Core Web Vitals monitoring
    if (typeof window !== 'undefined') {
      import('web-vitals')
        .then((webVitals) => {
          // Send metrics to analytics
          const sendToAnalytics = (metric: any) => {
            console.log('Core Web Vital:', metric);

            // Send to Google Analytics 4
            if (typeof window !== 'undefined' && (window as any).gtag) {
              (window as any).gtag('event', metric.name, {
                event_category: 'Web Vitals',
                event_label: metric.id,
                value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
                non_interaction: true,
                custom_parameter_1: 'core_web_vitals',
              });
            }

            // Send to Vercel Analytics
            if (typeof window !== 'undefined' && (window as any).va) {
              (window as any).va('track', 'Web Vital', {
                name: metric.name,
                value: metric.value,
                id: metric.id,
                delta: metric.delta,
                rating: metric.rating,
              });
            }

            // Send to Sentry
            Sentry.metrics.distribution('web_vitals', metric.value, {
              unit: 'millisecond',
            });

            // Performance monitoring for development
            if (process.env.NODE_ENV === 'development') {
              console.table({
                Metric: metric.name,
                Value: metric.value,
                Rating: metric.rating,
                Delta: metric.delta,
                ID: metric.id,
              });
            }
          };

          // Initialize Core Web Vitals (web-vitals v5.0.2)
          // Core Web Vitals: CLS, INP, LCP
          webVitals.onCLS(sendToAnalytics);
          webVitals.onINP(sendToAnalytics); // INP replaced FID in v5
          webVitals.onLCP(sendToAnalytics);

          // Other Web Vitals: FCP, TTFB
          webVitals.onFCP(sendToAnalytics);
          webVitals.onTTFB(sendToAnalytics);
        })
        .catch((error) => {
          console.error('Failed to load web-vitals:', error);
        });
    }
  }, []);

  // Performance observer for additional metrics
  useEffect(() => {
    if (typeof window !== 'undefined' && 'PerformanceObserver' in window) {
      // Monitor long tasks
      try {
        const longTaskObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.duration > 50) {
              console.warn('Long task detected:', {
                duration: entry.duration,
                startTime: entry.startTime,
                name: entry.name,
              });
            }
          }
        });
        longTaskObserver.observe({ entryTypes: ['longtask'] });

        // Monitor layout shifts
        const layoutShiftObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if ((entry as any).hadRecentInput) continue;
            console.log('Layout shift:', {
              value: (entry as any).value,
              sources: (entry as any).sources,
            });
          }
        });
        layoutShiftObserver.observe({ entryTypes: ['layout-shift'] });

        return () => {
          longTaskObserver.disconnect();
          layoutShiftObserver.disconnect();
        };
      } catch (error) {
        console.error('Performance observer error:', error);
        return undefined; // Explicit return for error case
      }
    }
    return undefined; // Explicit return when observers aren't supported
  }, []);

  return null; // This component doesn't render anything
}
