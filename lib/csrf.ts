import { NextRequest } from "next/server";
import crypto from "crypto";

/**
 * Generate a CSRF token
 */
export function generateCSRFToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Verify CSRF token
 */
export function verifyCSRFToken(token: string, sessionToken: string): boolean {
  if (!token || !sessionToken) return false;
  return crypto.timingSafeEqual(
    Buffer.from(token, 'hex'),
    Buffer.from(sessionToken, 'hex')
  );
}

/**
 * Get CSRF token from request headers
 */
export function getCSRFTokenFromRequest(request: NextRequest): string | null {
  return request.headers.get('x-csrf-token') || 
         request.headers.get('csrf-token') || 
         null;
}

/**
 * Check if request is from same origin
 */
export function isSameOrigin(request: NextRequest): boolean {
  const origin = request.headers.get('origin');
  const host = request.headers.get('host');
  
  if (!origin || !host) return false;
  
  try {
    const originUrl = new URL(origin);
    return originUrl.host === host;
  } catch {
    return false;
  }
}

/**
 * Validate CSRF protection for API requests
 */
export function validateCSRF(request: NextRequest): {
  isValid: boolean;
  error?: string;
} {
  // Skip CSRF for GET requests
  if (request.method === 'GET') {
    return { isValid: true };
  }
  
  // Check if request is from same origin
  if (!isSameOrigin(request)) {
    return {
      isValid: false,
      error: 'Cross-origin request not allowed'
    };
  }
  
  // For now, we'll rely on same-origin policy
  // In production, you might want to implement proper CSRF tokens
  return { isValid: true };
}

/**
 * Add CSRF protection to API route
 */
export function withCSRFProtection(
  request: NextRequest,
  handler: () => Promise<Response>
): Promise<Response> {
  const csrfValidation = validateCSRF(request);
  
  if (!csrfValidation.isValid) {
    return new Response(
      JSON.stringify({
        error: 'CSRF validation failed',
        details: csrfValidation.error
      }),
      {
        status: 403,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
  
  return handler();
}
