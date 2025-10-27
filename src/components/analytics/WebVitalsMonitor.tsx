'use client';

import { useReportWebVitals } from 'next/web-vitals';
import { useEffect } from 'react';
import * as Sentry from '@sentry/nextjs';

// Enhanced Web Vitals monitoring with Next.js v16 patterns
export default function WebVitalsMonitor() {
  // Use Next.js v16 useReportWebVitals hook
  useReportWebVitals((metric) => {
    console.log('Core Web Vital:', metric);

    // Send to Google Analytics 4
    if (globalThis.window !== undefined && (globalThis as any).gtag) {
      (globalThis as any).gtag('event', metric.name, {
        event_category: 'Web Vitals',
        event_label: metric.id,
        value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
        non_interaction: true,
        custom_parameter_1: 'core_web_vitals',
      });
    }

    // Send to Vercel Analytics
    if (globalThis.window !== undefined && (globalThis as any).va) {
      (globalThis as any).va('track', 'Web Vital', {
        name: metric.name,
        value: metric.value,
        id: metric.id,
        delta: metric.delta,
        rating: metric.rating,
      });
    }

    // Send to PostHog
    if (globalThis.window !== undefined && (globalThis as any).posthog) {
      (globalThis as any).posthog.capture('web_vital', {
        metric_name: metric.name,
        value: metric.value,
        id: metric.id,
        delta: metric.delta,
        rating: metric.rating,
      });
    }

    // Send to Sentry with enhanced metrics
    Sentry.metrics.distribution('web_vitals', metric.value, {
      unit: 'millisecond',
    });

    // Performance monitoring for development
    if (typeof process !== 'undefined' && process.env.NODE_ENV === 'development') {
      console.table({
        Metric: metric.name,
        Value: metric.value,
        Rating: metric.rating,
        Delta: metric.delta,
        ID: metric.id,
        Navigation: metric.navigationType,
      });
    }
  });

  // Enhanced Performance Observer for additional metrics
  useEffect(() => {
    if (globalThis.window === undefined || !('PerformanceObserver' in globalThis.window)) {
      return undefined;
    }

    try {
      // Monitor long tasks (blocking the main thread)
      const longTaskObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.duration > 50) {
            console.warn('Long task detected:', {
              duration: entry.duration,
              startTime: entry.startTime,
              name: entry.name,
            });

            // Send long task metrics to Sentry
            Sentry.metrics.distribution('long_task_duration', entry.duration, {
              unit: 'millisecond',
            });
          }
        }
      });

      // Monitor layout shifts for debugging
      const layoutShiftObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          const layoutShiftEntry = entry as any;

          // Skip layout shifts caused by user input
          if (layoutShiftEntry.hadRecentInput) continue;

          if (typeof process !== 'undefined' && process.env.NODE_ENV === 'development') {
            console.log('Layout shift detected:', {
              value: layoutShiftEntry.value,
              sources: layoutShiftEntry.sources?.length || 0,
              startTime: entry.startTime,
            });
          }

          // Track significant layout shifts
          if (layoutShiftEntry.value > 0.1) {
            Sentry.metrics.distribution('layout_shift_value', layoutShiftEntry.value, {
              unit: 'none',
            });
          }
        }
      });

      // Monitor navigation performance
      const navigationObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          const navEntry = entry as PerformanceNavigationTiming;

          const metrics = {
            dns_lookup: navEntry.domainLookupEnd - navEntry.domainLookupStart,
            tcp_connection: navEntry.connectEnd - navEntry.connectStart,
            ssl_handshake: navEntry.secureConnectionStart
              ? navEntry.connectEnd - navEntry.secureConnectionStart
              : 0,
            server_response: navEntry.responseStart - navEntry.requestStart,
            dom_processing: navEntry.domContentLoadedEventStart - navEntry.responseStart,
            resource_loading: navEntry.loadEventStart - navEntry.domContentLoadedEventStart,
          };

          if (typeof process !== 'undefined' && process.env.NODE_ENV === 'development') {
            console.table(metrics);
          }

          // Send navigation metrics to Sentry
          for (const [name, value] of Object.entries(metrics)) {
            if (value > 0) {
              Sentry.metrics.distribution(`navigation_${name}`, value, {
                unit: 'millisecond',
              });
            }
          }
        }
      });

      // Start observing
      longTaskObserver.observe({ entryTypes: ['longtask'] });
      layoutShiftObserver.observe({ entryTypes: ['layout-shift'] });
      navigationObserver.observe({ entryTypes: ['navigation'] });

      return () => {
        longTaskObserver.disconnect();
        layoutShiftObserver.disconnect();
        navigationObserver.disconnect();
      };
    } catch (error) {
      console.error('Performance observer setup error:', error);
      Sentry.captureException(error);
      return undefined;
    }
  }, []);

  return null; // This component doesn't render anything
}
