/**
 * Error logging utility for production monitoring
 */

export interface ErrorLog {
  timestamp: string;
  level: 'error' | 'warn' | 'info';
  message: string;
  error?: string;
  stack?: string;
  context?: Record<string, any>;
  userId?: string;
  requestId?: string;
  endpoint?: string;
  userAgent?: string;
  ip?: string;
}

/**
 * Log error with context
 */
export function logError(
  message: string,
  error?: Error,
  context?: Record<string, any>
): void {
  const errorLog: ErrorLog = {
    timestamp: new Date().toISOString(),
    level: 'error',
    message,
    error: error?.message,
    stack: error?.stack,
    context,
  };

  // In production, you would send this to your logging service
  // For now, we'll use console.error with structured logging
  console.error('ERROR:', JSON.stringify(errorLog, null, 2));
  
  // TODO: Integrate with Sentry, LogRocket, or similar service
  // Example: Sentry.captureException(error, { extra: context });
}

/**
 * Log warning with context
 */
export function logWarning(
  message: string,
  context?: Record<string, any>
): void {
  const warningLog: ErrorLog = {
    timestamp: new Date().toISOString(),
    level: 'warn',
    message,
    context,
  };

  console.warn('WARNING:', JSON.stringify(warningLog, null, 2));
}

/**
 * Log info with context
 */
export function logInfo(
  message: string,
  context?: Record<string, any>
): void {
  const infoLog: ErrorLog = {
    timestamp: new Date().toISOString(),
    level: 'info',
    message,
    context,
  };

  console.info('INFO:', JSON.stringify(infoLog, null, 2));
}

/**
 * Create error response with logging
 */
export function createErrorResponse(
  message: string,
  status: number,
  error?: Error,
  context?: Record<string, any>
): Response {
  // Log the error
  logError(message, error, context);
  
  // Return sanitized error response (don't expose internal details)
  return new Response(
    JSON.stringify({
      error: message,
      timestamp: new Date().toISOString(),
    }),
    {
      status,
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );
}

/**
 * Log API request for monitoring
 */
export function logApiRequest(
  method: string,
  endpoint: string,
  status: number,
  duration: number,
  context?: Record<string, any>
): void {
  const requestLog: ErrorLog = {
    timestamp: new Date().toISOString(),
    level: 'info',
    message: `API Request: ${method} ${endpoint}`,
    context: {
      method,
      endpoint,
      status,
      duration,
      ...context,
    },
  };

  console.info('API_REQUEST:', JSON.stringify(requestLog, null, 2));
}

/**
 * Log security event
 */
export function logSecurityEvent(
  event: string,
  severity: 'low' | 'medium' | 'high' | 'critical',
  context?: Record<string, any>
): void {
  const securityLog: ErrorLog = {
    timestamp: new Date().toISOString(),
    level: severity === 'critical' || severity === 'high' ? 'error' : 'warn',
    message: `Security Event: ${event}`,
    context: {
      event,
      severity,
      ...context,
    },
  };

  if (severity === 'critical' || severity === 'high') {
    console.error('SECURITY_EVENT:', JSON.stringify(securityLog, null, 2));
  } else {
    console.warn('SECURITY_EVENT:', JSON.stringify(securityLog, null, 2));
  }
}

/**
 * Log transaction verification events
 */
export function logTransactionVerification(
  txHash: string,
  success: boolean,
  details?: Record<string, any>
): void {
  const logLevel = success ? 'info' : 'error';
  const message = success 
    ? `Transaction verified successfully: ${txHash}`
    : `Transaction verification failed: ${txHash}`;

  const verificationLog: ErrorLog = {
    timestamp: new Date().toISOString(),
    level: logLevel,
    message,
    context: {
      txHash,
      success,
      ...details,
    },
  };

  if (success) {
    console.info('TX_VERIFICATION:', JSON.stringify(verificationLog, null, 2));
  } else {
    console.error('TX_VERIFICATION:', JSON.stringify(verificationLog, null, 2));
  }
}

/**
 * Log rate limiting events
 */
export function logRateLimit(
  ip: string,
  endpoint: string,
  limit: number,
  remaining: number
): void {
  const rateLimitLog: ErrorLog = {
    timestamp: new Date().toISOString(),
    level: 'warn',
    message: `Rate limit hit for IP: ${ip}`,
    context: {
      ip,
      endpoint,
      limit,
      remaining,
    },
  };

  console.warn('RATE_LIMIT:', JSON.stringify(rateLimitLog, null, 2));
}

/**
 * Log webhook events
 */
export function logWebhook(
  source: string,
  event: string,
  success: boolean,
  details?: Record<string, any>
): void {
  const webhookLog: ErrorLog = {
    timestamp: new Date().toISOString(),
    level: success ? 'info' : 'error',
    message: `Webhook ${source}: ${event}`,
    context: {
      source,
      event,
      success,
      ...details,
    },
  };

  if (success) {
    console.info('WEBHOOK:', JSON.stringify(webhookLog, null, 2));
  } else {
    console.error('WEBHOOK:', JSON.stringify(webhookLog, null, 2));
  }
}
