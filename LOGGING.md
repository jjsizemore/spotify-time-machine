# Logging and Observability

This document describes the logging and observability infrastructure for Jermaine's Spotify Time Machine.

## Overview

The application uses **Winston** for structured logging with multiple transports and integration with Sentry for error tracking and monitoring.

## Logger Configuration

The centralized logger is located at `src/lib/logger.ts` and provides:

- **Structured logging** with context metadata
- **Multiple log levels**: error, warn, info, http, debug
- **Environment-based configuration**: debug level in development, info in production
- **Multiple transports**: Console, rotating file logs (production)
- **Sentry integration**: Automatic error reporting to Sentry
- **Emoji indicators**: Visual aids for development logging

## Log Levels

- **error**: Critical errors that need immediate attention
- **warn**: Warning conditions that should be reviewed
- **info**: General informational messages
- **http**: HTTP request/response logging
- **debug**: Detailed debugging information (development only)

## Usage

### Basic Logging

```typescript
import { log } from '@/lib/logger';

// Simple logging
log.info('User logged in successfully');
log.warn('Rate limit approaching threshold');
log.error('Failed to process request', error);

// With context
log.info('User action completed', {
  userId: user.id,
  action: 'create_playlist',
  duration: 1234,
});
```

### Specialized Logging Methods

```typescript
// Authentication events
log.auth('User authenticated successfully', { userId: '123' });

// API calls
log.api('Spotify API request completed', {
  endpoint: '/me/tracks',
  status: 200,
  duration: 456,
});

// Spotify-specific events
log.spotify('Track data fetched', {
  trackCount: 50,
  timeRange: 'last_month',
});

// Performance metrics
log.performance('Page load completed', {
  page: '/dashboard',
  loadTime: 2345,
});

// Security events
log.security('Suspicious activity detected', {
  ip: '192.168.1.1',
  reason: 'multiple_failed_attempts',
});
```

### Error Logging with Sentry Integration

```typescript
try {
  // Some operation
} catch (error) {
  // Automatically logs to both Winston and Sentry
  log.error('Operation failed', error, {
    userId: user.id,
    operation: 'create_playlist',
  });
}
```

## File Logging

### Configuration

File logging is enabled in production or when `ENABLE_FILE_LOGGING=true` is set.

Log files are stored in the `logs/` directory with automatic rotation:

- **error-YYYY-MM-DD.log**: Error logs (14 days retention, 20MB max size)
- **combined-YYYY-MM-DD.log**: All logs (7 days retention, 20MB max size)
- **http-YYYY-MM-DD.log**: HTTP request logs (7 days retention, 20MB max size)

### Log Format

Production logs are in JSON format for easy parsing and analysis:

```json
{
  "level": "info",
  "message": "User logged in successfully",
  "timestamp": "2025-10-23T21:00:00.000Z",
  "userId": "123",
  "category": "auth"
}
```

Development logs use a human-readable format with emojis:

```
ℹ️ [2025-10-23 21:00:00] info: User logged in successfully
  {
    "userId": "123",
    "category": "auth"
  }
```

## Environment Variables

```bash
# Enable file logging (default: true in production, false in development)
ENABLE_FILE_LOGGING=true

# Sentry DSN for error tracking
NEXT_PUBLIC_SENTRY_DSN=your_sentry_dsn
```

## Log Categories

The logger supports categorization through context metadata:

- `auth`: Authentication and authorization events
- `api`: API requests and responses
- `spotify`: Spotify-specific operations
- `performance`: Performance metrics
- `security`: Security-related events

## Integration with Existing Systems

### Sentry

All errors logged through the logger are automatically sent to Sentry with:
- Full error stack traces
- Contextual metadata
- User information (when available)
- Request details

### Middleware Logging

The middleware (`src/middleware.ts`) logs:
- HTTP requests (in development/debug mode)
- Rate limiting events
- Authentication checks
- OAuth flow events

### Component Logging

Key components log:
- Error boundary catches
- API client operations
- Cache operations
- User actions

## Best Practices

1. **Use appropriate log levels**: Don't log everything as `error`
2. **Include context**: Always provide relevant metadata
3. **Avoid logging sensitive data**: No passwords, tokens, or PII
4. **Use structured data**: Pass objects for metadata instead of string interpolation
5. **Log user actions**: Important for debugging and analytics
6. **Log API interactions**: Track external service calls
7. **Log performance metrics**: Monitor application performance

## Monitoring and Alerts

### Sentry

Errors are automatically sent to Sentry for:
- Real-time error notifications
- Error grouping and deduplication
- Performance monitoring
- Release tracking

### Log Analysis

Production logs can be analyzed using:
- Log aggregation tools (e.g., Datadog, LogDNA, CloudWatch)
- JSON parsing tools (e.g., jq)
- Custom scripts for pattern detection

## Security Considerations

- Log files are excluded from version control (`.gitignore`)
- Sensitive data is not logged (tokens, passwords, secrets)
- Log rotation prevents disk space issues
- Access to production logs should be restricted

## Troubleshooting

### Logs not appearing

1. Check environment variable `ENABLE_FILE_LOGGING`
2. Verify `logs/` directory exists and is writable
3. Check log level configuration

### Performance impact

- File logging is async and non-blocking
- Log rotation prevents disk space issues
- Console logging can be disabled in production

### Sentry not receiving errors

1. Verify `NEXT_PUBLIC_SENTRY_DSN` is set
2. Check Sentry initialization in `sentry.*.config.ts` files
3. Verify error is being logged with `log.error()`

## Migration from console.log

The codebase has been migrated from `console.log/error/warn` to the Winston logger for:
- Better structure and consistency
- Centralized configuration
- Production-ready logging
- Integration with monitoring tools

Old pattern:
```typescript
console.error('Error occurred:', error);
```

New pattern:
```typescript
log.error('Error occurred', error, { context: 'additional data' });
```
