// Instrumentation client - Analytics handled by AnalyticsProviders component
// This file is kept for Next.js instrumentation compatibility

export async function onRequestError(
  err: unknown,
  _request: Request,
  _context: { router?: { pathname?: string } }
) {
  // Client-side error handling can be added here if needed
  // Currently handled by Sentry client configuration
  console.error('Client instrumentation error:', err);
}
