/**
 * Secure logging utility that sanitizes sensitive data before logging
 * and provides proper error categorization for monitoring
 */

interface LogLevel {
  ERROR: 'error'
  WARN: 'warn'
  INFO: 'info'
  DEBUG: 'debug'
}

interface ErrorContext {
  component?: string
  action?: string
  userId?: string
  timestamp?: string
  userAgent?: string
  url?: string
  [key: string]: unknown
}

interface SanitizedError {
  message: string
  name?: string
  code?: string | number
  context?: ErrorContext
  timestamp: string
  level: string
}

const LOG_LEVELS: LogLevel = {
  ERROR: 'error',
  WARN: 'warn', 
  INFO: 'info',
  DEBUG: 'debug'
}

// Sensitive data patterns to redact
const SENSITIVE_PATTERNS = [
  /password/i,
  /token/i,
  /key/i,
  /secret/i,
  /auth/i,
  /session/i,
  /cookie/i,
  /bearer/i,
  /api.key/i,
  /access.token/i,
  /refresh.token/i,
]

// Email regex for partial redaction
const EMAIL_REGEX = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g

/**
 * Sanitizes an object by removing or redacting sensitive information
 */
function sanitizeObject(obj: unknown): unknown {
  if (obj === null || obj === undefined) return obj
  
  if (typeof obj === 'string') {
    return sanitizeString(obj)
  }
  
  if (typeof obj === 'object') {
    if (Array.isArray(obj)) {
      return obj.map(sanitizeObject)
    }
    
    const sanitized: Record<string, unknown> = {}
    
    for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
      // Check if key contains sensitive information
      const isSensitiveKey = SENSITIVE_PATTERNS.some(pattern => pattern.test(key))
      
      if (isSensitiveKey) {
        sanitized[key] = '[REDACTED]'
      } else {
        sanitized[key] = sanitizeObject(value)
      }
    }
    
    return sanitized
  }
  
  return obj
}

/**
 * Sanitizes string content by redacting sensitive information
 */
function sanitizeString(str: string): string {
  // Redact email addresses (show first 2 chars + domain)
  let sanitized = str.replace(EMAIL_REGEX, (email) => {
    const [localPart, domain] = email.split('@')
    const redactedLocal = localPart.length > 2 
      ? localPart.substring(0, 2) + '***'
      : '***'
    return `${redactedLocal}@${domain}`
  })
  
  // Redact common sensitive patterns
  sanitized = sanitized.replace(/Bearer\s+[A-Za-z0-9\-._~+/]+=*/g, 'Bearer [REDACTED]')
  sanitized = sanitized.replace(/token["\s]*[:=]["\s]*[A-Za-z0-9\-._~+/]+/gi, 'token: [REDACTED]')
  sanitized = sanitized.replace(/password["\s]*[:=]["\s]*[^\s"]+/gi, 'password: [REDACTED]')
  
  return sanitized
}

/**
 * Creates a sanitized error object safe for logging
 */
function sanitizeError(error: unknown, context?: ErrorContext): SanitizedError {
  const timestamp = new Date().toISOString()
  
  // Handle Error objects
  if (error instanceof Error) {
    return {
      message: sanitizeString(error.message),
      name: error.name,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      code: (error as any).code,
      context: context ? sanitizeObject(context) as ErrorContext : undefined,
      timestamp,
      level: LOG_LEVELS.ERROR
    }
  }
  
  // Handle string errors
  if (typeof error === 'string') {
    return {
      message: sanitizeString(error),
      context: context ? sanitizeObject(context) as ErrorContext : undefined,
      timestamp,
      level: LOG_LEVELS.ERROR
    }
  }
  
  // Handle unknown error types
  return {
    message: sanitizeString(String(error)),
    context: context ? sanitizeObject(context) as ErrorContext : undefined,
    timestamp,
    level: LOG_LEVELS.ERROR
  }
}

/**
 * Secure logger class that sanitizes sensitive data and handles different environments
 */
class SecureLogger {
  private isDevelopment = process.env.NODE_ENV === 'development'
  private isProduction = process.env.NODE_ENV === 'production'
  
  /**
   * Logs an error with automatic sanitization
   */
  error(error: unknown, context?: ErrorContext): void {
    const sanitizedError = sanitizeError(error, context)
    
    if (this.isDevelopment) {
      // In development, log full details to console
      console.error('🔒 Secure Logger:', sanitizedError)
      if (error instanceof Error && error.stack) {
        console.error('Stack trace:', error.stack)
      }
    }
    
    if (this.isProduction) {
      // In production, send to external monitoring service
      this.sendToMonitoring(sanitizedError)
    }
  }
  
  /**
   * Logs a warning with sanitization
   */
  warn(message: string, context?: ErrorContext): void {
    const sanitizedContext = context ? sanitizeObject(context) as ErrorContext : undefined
    const logEntry = {
      message: sanitizeString(message),
      context: sanitizedContext,
      timestamp: new Date().toISOString(),
      level: LOG_LEVELS.WARN
    }
    
    if (this.isDevelopment) {
      console.warn('🔒 Secure Logger:', logEntry)
    }
    
    if (this.isProduction) {
      this.sendToMonitoring(logEntry)
    }
  }
  
  /**
   * Logs info with sanitization
   */
  info(message: string, context?: ErrorContext): void {
    const sanitizedContext = context ? sanitizeObject(context) as ErrorContext : undefined
    const logEntry = {
      message: sanitizeString(message),
      context: sanitizedContext,
      timestamp: new Date().toISOString(),
      level: LOG_LEVELS.INFO
    }
    
    if (this.isDevelopment) {
      console.info('🔒 Secure Logger:', logEntry)
    }
  }
  
  /**
   * Sends log data to external monitoring service in production
   */
  private sendToMonitoring(logEntry: SanitizedError | Record<string, unknown>): void {
    try {
      // TODO: Integrate with external monitoring service
      // Examples: Sentry, LogRocket, DataDog, New Relic
      
      // For now, log to console in production (replace with actual service)
      console.error('[PRODUCTION LOG]:', JSON.stringify(logEntry, null, 2))
      
      // Example Sentry integration:
      // Sentry.captureException(logEntry)
      
      // Example custom API endpoint:
      // fetch('/api/logs', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(logEntry)
      // }).catch(() => {
      //   // Silently fail to prevent logging loops
      // })
      
    } catch (monitoringError) {
      // Prevent logging loops by silently failing
      // Only log to console as last resort
      console.error('Monitoring service failed:', String(monitoringError))
    }
  }
}

// Export singleton instance
export const secureLogger = new SecureLogger()

/**
 * Sanitizes error objects for safe logging
 * Removes sensitive information and ensures the error is serializable
 */
export function logAuthError(error: unknown, context: string) {
  // Sanitize error information before logging
  const sanitizedError = sanitizeErrorForLogging(error);
  
  console.error(`[AUTH_ERROR] ${context}:`, sanitizedError);
  
  // In production, you might want to send this to your logging service
  if (process.env.NODE_ENV === 'production') {
    // Send to your logging service here
    // Example: sendToLoggingService({ error: sanitizedError, context });
  }
}

/**
 * Sanitizes error objects for safe logging
 * Removes sensitive information and ensures the error is serializable
 */
function sanitizeErrorForLogging(error: unknown): Record<string, unknown> {
  if (!error) return { message: 'Unknown error' };
  
  // Handle Error objects
  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
      // Don't include stack traces in production for security
      ...(process.env.NODE_ENV !== 'production' && { stack: error.stack })
    };
  }
  
  // Handle Supabase errors (which might have additional properties)
  if (typeof error === 'object' && error !== null) {
    const errorObj = error as Record<string, unknown>;
    return {
      message: errorObj.message || 'Unknown error',
      code: errorObj.code,
      status: errorObj.status,
      // Add other safe properties as needed
    };
  }
  
  // Handle string errors
  if (typeof error === 'string') {
    return { message: error };
  }
  
  // Fallback for any other type
  return { message: 'Unknown error type', type: typeof error };
}

export const logApiError = (error: unknown, endpoint: string, method: string) => {
  secureLogger.error(error, {
    component: 'api',
    action: `${method} ${endpoint}`,
    url: typeof window !== 'undefined' ? window.location.href : undefined
  })
}

export const logComponentError = (error: unknown, componentName: string, action?: string) => {
  secureLogger.error(error, {
    component: componentName,
    action,
    url: typeof window !== 'undefined' ? window.location.href : undefined
  })
} 