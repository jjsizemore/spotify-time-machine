import { NextRequest, NextResponse } from 'next/server';

export default function proxy(request: NextRequest) {
  // Skip middleware for API routes, static files, and assets
  const pathname = request.nextUrl.pathname;
  if (
    pathname.startsWith('/api/') ||
    pathname.startsWith('/_next/static') ||
    pathname.startsWith('/_next/image') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.startsWith('/favicon.svg') ||
    /\.(svg|png|jpg|jpeg|gif|webp|ico|woff|woff2)$/.test(pathname)
  ) {
    return NextResponse.next();
  }

  // Generate a unique nonce for each request
  const nonce = Buffer.from(crypto.randomUUID()).toString('base64');
  const isDev = process.env.NODE_ENV === 'development';

  // Comprehensive Content Security Policy
  const cspHeader = `
    default-src 'self';
    script-src 'self' 'nonce-${nonce}' 'strict-dynamic' ${isDev ? "'unsafe-eval'" : ''} https://www.googletagmanager.com https://va.vercel-scripts.com https://*.vercel-scripts.com https://vercel.live;
    style-src 'self' ${isDev ? "'unsafe-inline'" : `'nonce-${nonce}'`} https://fonts.googleapis.com;
    img-src 'self' blob: data: https://i.scdn.co https://mosaic.scdn.co https://platform-lookaside.fbsbx.com https://www.google-analytics.com https://www.googletagmanager.com;
    font-src 'self' https://fonts.gstatic.com data:;
    connect-src 'self' https://api.spotify.com https://accounts.spotify.com https://www.google-analytics.com https://analytics.google.com https://vitals.vercel-analytics.com https://*.vercel-analytics.com https://vercel.live https://*.sentry.io;
    frame-src 'self' https://vercel.live https://www.googletagmanager.com;
    object-src 'none';
    base-uri 'self';
    form-action 'self';
    frame-ancestors 'none';
    worker-src 'self' blob:;
    manifest-src 'self';
    media-src 'self' https://i.scdn.co;
    upgrade-insecure-requests;
  `;

  // Clean up the CSP string
  const contentSecurityPolicyHeaderValue = cspHeader.replaceAll(/\s{2,}/g, ' ').trim();

  // Clone request headers and add nonce
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-nonce', nonce);
  requestHeaders.set('Content-Security-Policy', contentSecurityPolicyHeaderValue);

  // Create response with CSP headers
  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  // Set CSP on response
  response.headers.set('Content-Security-Policy', contentSecurityPolicyHeaderValue);

  return response;
}
