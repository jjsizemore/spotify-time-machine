/**
 * Application Initialization Module
 *
 * This module handles critical setup tasks on application startup, including:
 * - Environment variable validation
 * - Configuration consistency checks
 * - Initialization of core services
 *
 * This runs before the application begins processing requests, ensuring all
 * required configuration is present and valid.
 *
 * @see src/lib/configUtils.ts - Configuration validation logic
 * @see src/lib/env.ts - Environment schema definition
 */

import { validateConfig } from './configUtils';

/**
 * Initialize the application with validated configuration
 *
 * This function is called during the Next.js startup sequence to validate
 * that all required environment variables are configured before the server
 * starts accepting requests.
 *
 * If validation fails, the process will exit with a non-zero exit code and
 * display a detailed error message to help diagnose the issue.
 *
 * @throws {Error} If configuration validation fails (process exits)
 */
validateConfig();

export default {};
