import * as Sentry from '@sentry/nextjs';
import { getEnvVar } from '@/lib/envConfig';

Sentry.init({
  dsn: getEnvVar('NEXT_PUBLIC_SENTRY_DSN'),

  // Adjust this value in production, or use tracesSampler for greater control
  tracesSampleRate: 1,

  // Enable logs to be sent to Sentry
  enableLogs: true,

  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: false,
});
