# Domain Migration Guide: stm.jermainesizemore.com → tm.jermainesizemore.com

## Overview

This document outlines the strategy for migrating users from the old domain (`stm.jermainesizemore.com`) to the new domain (`tm.jermainesizemore.com`) while handling cached PWA installations.

## Changes Made

### 1. Service Worker Updates (`public/sw.js`)

- **Cache Version Bumped**: `v1` → `v2` to force cache invalidation
- **Domain Migration Detection**: Added logic to detect old domain and notify users
- **Message Posting**: Service worker sends migration messages to clients on old domain

### 2. Client-Side Migration Handler (`src/components/providers/DomainMigrationHandler.tsx`)

- **Auto-redirect**: Users on old domain are automatically redirected after 3 seconds
- **PWA Detection**: Detects if app is running as installed PWA
- **Toast Notification**: Shows friendly migration message to users
- **LocalStorage Tracking**: Remembers which domain the PWA was installed from

### 3. Configuration Updates

- **Environment Variables**: Updated `.env` with new domain
- **Manifest**: Updated `related_applications` URL
- **SEO Files**: Updated all fallback URLs in `sitemap.ts`, `robots.ts`, `seo.ts`
- **Next.js Config**: Added custom header to indicate migration

### 4. Root Layout Integration

- Added `<DomainMigrationHandler />` component to notify and redirect users

## Migration Strategies

### Strategy 1: DNS/Server-Level Redirect (RECOMMENDED)

**Most Effective for All Users**

Configure your hosting provider to redirect all traffic from old → new domain:

```nginx
# Example for Nginx
server {
    server_name stm.jermainesizemore.com;
    return 301 https://tm.jermainesizemore.com$request_uri;
}
```

```apache
# Example for Apache
RewriteEngine On
RewriteCond %{HTTP_HOST} ^stm\.jermainesizemore\.com$ [NC]
RewriteRule ^(.*)$ https://tm.jermainesizemore.com/$1 [R=301,L]
```

For **Vercel/Netlify**:

- Add both domains to your project
- Set `tm.jermainesizemore.com` as primary
- Configure old domain to redirect (usually in dashboard settings)

### Strategy 2: Client-Side Detection (IMPLEMENTED)

**Automatic via DomainMigrationHandler**

The app now automatically:

1. Detects when user is on old domain
2. Shows toast notification
3. Redirects to new domain after 3 seconds
4. Preserves the current path and query parameters

### Strategy 3: Service Worker Notification (IMPLEMENTED)

**For Installed PWAs**

When a PWA installed from old domain loads:

1. Service worker detects old domain
2. Sends message to client
3. Client shows migration notice
4. User is guided to reinstall from new domain

### Strategy 4: Update Metadata

**Already Implemented**

All URLs in the app now use:

- `process.env.NEXT_PUBLIC_BASE_URL` (primary)
- `https://tm.jermainesizemore.com` (fallback)

## Deployment Checklist

### Before Deployment

- [ ] Update Spotify OAuth redirect URI in Spotify Developer Dashboard
  - Old: `https://stm.jermainesizemore.com/api/auth/callback/spotify`
  - New: `https://tm.jermainesizemore.com/api/auth/callback/spotify`
  - **KEEP BOTH** during migration period
- [ ] Set environment variables in production:
  ```
  NEXTAUTH_URL=https://tm.jermainesizemore.com
  NEXT_PUBLIC_BASE_URL=https://tm.jermainesizemore.com
  ```
- [ ] Configure DNS for new domain
- [ ] Set up SSL certificate for new domain

### During Deployment

1. Deploy app to new domain first
2. Test thoroughly on new domain
3. Keep old domain active with redirect for 30-90 days
4. Monitor analytics for traffic patterns

### After Deployment

- [ ] Update all external links to new domain
- [ ] Update social media profiles
- [ ] Update any documentation/READMEs
- [ ] Submit new domain to Google Search Console
- [ ] Update sitemap in Google Search Console
- [ ] Monitor for broken links or 404s

## User Communication

### For Web Users

- Automatic redirect (3-second delay with notice)
- No action required

### For PWA Users

Users with installed PWA from old domain need to:

1. **Uninstall old PWA** from their device
2. **Visit new domain**: `https://tm.jermainesizemore.com`
3. **Reinstall PWA** from new domain

### Communication Channels

Consider announcing the migration via:

- In-app banner/toast (✅ implemented)
- Email to registered users
- Social media announcement
- Blog post about the change

## Testing

### Test Scenarios

1. **New users on new domain** ✓
   - Should work normally
2. **Existing users visiting old domain**
   - Should see redirect notice
   - Should be redirected to new domain
3. **PWA installed from old domain**
   - Should see migration notice
   - Should be prompted to reinstall
4. **PWA installed from new domain**
   - Should work normally
   - No migration notices

### Test Commands

```bash
# Build and test locally
pnpm build
pnpm start

# Test with different hostnames (modify /etc/hosts if needed)
# Add to /etc/hosts:
# 127.0.0.1 tm.jermainesizemore.local
# 127.0.0.1 stm.jermainesizemore.local
```

## Timeline Recommendation

### Week 1-2: Soft Launch

- Deploy to new domain
- Keep both domains active
- Monitor for issues

### Week 3-8: Migration Period

- Both domains active with redirect
- Active user communication
- Monitor analytics

### Week 9+: Full Migration

- Old domain redirects permanently
- Can eventually sunset old domain
- Keep redirect active for at least 6-12 months for SEO

## Rollback Plan

If issues arise:

1. Revert environment variables to old domain
2. Deploy previous version
3. Keep new domain as alias/redirect
4. Investigate issues before re-attempting

## Monitoring

Track these metrics:

- 301 redirect count (old → new domain)
- 404 errors on new domain
- User session continuity
- OAuth callback success rate
- PWA installation rate on new domain

## Support

If users encounter issues:

1. Clear browser cache and cookies
2. Uninstall and reinstall PWA
3. Check OAuth connection status
4. Re-authenticate with Spotify if needed

## Additional Notes

### SEO Implications

- 301 redirects preserve ~90-99% of SEO value
- Google typically processes domain changes within 2-4 weeks
- Keep old domain redirecting for at least 6 months

### OAuth Considerations

- NextAuth session cookies are domain-specific
- Users will need to re-authenticate on new domain
- This is expected behavior and handled automatically

### PWA Manifest

- Each domain has its own PWA installation
- Users must reinstall from new domain
- No automatic migration for installed PWAs (browser limitation)

---

## Quick Reference

**Old Domain**: `stm.jermainesizemore.com`  
**New Domain**: `tm.jermainesizemore.com`  
**Migration Status**: Ready for deployment  
**User Impact**: Minimal (automatic redirect)  
**Downtime**: None expected
