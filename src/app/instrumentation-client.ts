// Instrumentation client - Analytics handled by AnalyticsProviders component
// This file is kept for Next.js instrumentation compatibility

export async function onRequestError(err: any, _request: any, _context: any) {
  // Client-side error handling can be added here if needed
  // Currently handled by Sentry client configuration
  console.error('Client instrumentation error:', err);
}
