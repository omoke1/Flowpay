import { z } from "zod";
import DOMPurify from "dompurify";
import { JSDOM } from "jsdom";

// Create a DOMPurify instance for server-side sanitization
const window = new JSDOM('').window;
const purify = DOMPurify(window as any);

/**
 * Sanitize HTML content to prevent XSS attacks
 */
export function sanitizeHtml(input: string): string {
  if (typeof input !== 'string') return '';
  return purify.sanitize(input, { 
    ALLOWED_TAGS: [], // No HTML tags allowed
    ALLOWED_ATTR: []  // No attributes allowed
  });
}

/**
 * Sanitize text input (remove HTML and limit length)
 */
export function sanitizeText(input: string, maxLength: number = 1000): string {
  if (typeof input !== 'string') return '';
  const sanitized = sanitizeHtml(input);
  return sanitized.slice(0, maxLength).trim();
}

/**
 * Validate and sanitize URL
 */
export function sanitizeUrl(input: string): string | null {
  if (typeof input !== 'string') return null;
  
  try {
    const url = new URL(input);
    // Only allow http and https protocols
    if (!['http:', 'https:'].includes(url.protocol)) {
      return null;
    }
    return url.toString();
  } catch {
    return null;
  }
}

/**
 * Validate Flow address format
 */
export function validateFlowAddress(address: string): boolean {
  if (typeof address !== 'string') return false;
  // Flow addresses can be 16 or 40 characters after 0x
  return /^0x[a-fA-F0-9]{16}$/.test(address) || /^0x[a-fA-F0-9]{40}$/.test(address);
}

/**
 * Validate transaction hash format
 */
export function validateTransactionHash(hash: string): boolean {
  if (typeof hash !== 'string') return false;
  return /^[a-fA-F0-9]{64}$/.test(hash);
}

/**
 * Validate amount (positive number with max 8 decimal places)
 */
export function validateAmount(amount: string | number): boolean {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(num) || num <= 0) return false;
  
  // Check decimal places
  const str = num.toString();
  const decimalIndex = str.indexOf('.');
  if (decimalIndex !== -1) {
    const decimalPlaces = str.length - decimalIndex - 1;
    if (decimalPlaces > 8) return false;
  }
  
  return true;
}

// Zod schemas for API validation
export const paymentLinkSchema = z.object({
  merchantId: z.string().refine(validateFlowAddress, "Invalid Flow address"),
  productName: z.string()
    .min(1, "Product name is required")
    .max(100, "Product name too long")
    .transform((val) => sanitizeText(val, 100)),
  description: z.string()
    .max(500, "Description too long")
    .optional()
    .transform((val) => val ? sanitizeText(val, 500) : undefined),
  amount: z.string()
    .refine(validateAmount, "Invalid amount"),
  token: z.enum(['FLOW', 'USDC']),
  redirectUrl: z.string()
    .optional()
    .refine((val) => !val || !!sanitizeUrl(val), "Invalid redirect URL")
    .transform((val) => val ? sanitizeUrl(val) : undefined),
  acceptCrypto: z.boolean().default(true),
  acceptFiat: z.boolean().default(true),
});

export const paymentSchema = z.object({
  linkId: z.string().uuid("Invalid payment link ID"),
  payerAddress: z.string().refine(validateFlowAddress, "Invalid payer address"),
  amount: z.string().refine(validateAmount, "Invalid amount"),
  token: z.enum(['FLOW', 'USDC']),
  txHash: z.string().refine(validateTransactionHash, "Invalid transaction hash"),
});

export const settingsSchema = z.object({
  email: z.string().email("Invalid email address").optional(),
  displayName: z.string()
    .max(50, "Display name too long")
    .optional()
    .transform((val) => val ? sanitizeText(val, 50) : undefined),
  webhookUrl: z.string()
    .url("Invalid webhook URL")
    .optional()
    .refine((val) => !val || !!sanitizeUrl(val), "Invalid webhook URL")
    .transform((val) => val ? sanitizeUrl(val) : undefined),
  apiKeyName: z.string()
    .max(50, "API key name too long")
    .optional()
    .transform((val) => val ? sanitizeText(val, 50) : undefined),
});

export const transakOrderSchema = z.object({
  walletAddress: z.string().refine(validateFlowAddress, "Invalid wallet address"),
  cryptoAmount: z.number().positive("Invalid crypto amount"),
  fiatAmount: z.number().positive("Invalid fiat amount"),
  cryptoCurrency: z.string().default("USDC"),
  fiatCurrency: z.string().default("USD"),
  redirectURL: z.string()
    .optional()
    .refine(val => !val || sanitizeUrl(val), "Invalid redirect URL")
    .transform(val => val ? sanitizeUrl(val) : undefined),
});

/**
 * Validate request body against schema
 */
export function validateRequestBody<T>(
  body: any,
  schema: z.ZodSchema<T>
): { success: true; data: T } | { success: false; error: string; details?: any } {
  try {
    const result = schema.safeParse(body);
    
    if (result.success) {
      return { success: true, data: result.data };
    } else {
      return {
        success: false,
        error: "Validation failed",
        details: (result as any).error?.issues ?? undefined
      };
    }
  } catch (error) {
    return {
      success: false,
      error: "Invalid request body"
    };
  }
}

/**
 * Sanitize all string values in an object recursively
 */
export function sanitizeObject(obj: any): any {
  if (typeof obj === 'string') {
    return sanitizeText(obj);
  }
  
  if (Array.isArray(obj)) {
    return obj.map(sanitizeObject);
  }
  
  if (obj && typeof obj === 'object') {
    const sanitized: any = {};
    for (const [key, value] of Object.entries(obj)) {
      sanitized[key] = sanitizeObject(value);
    }
    return sanitized;
  }
  
  return obj;
}

/**
 * Validate and sanitize search parameters
 */
export function validateSearchParams(params: URLSearchParams, allowedParams: string[]): Record<string, string> {
  const result: Record<string, string> = {};
  
  for (const param of allowedParams) {
    const value = params.get(param);
    if (value) {
      result[param] = sanitizeText(value, 100);
    }
  }
  
  return result;
}

/**
 * Rate limiting validation
 */
export function validateRateLimitHeaders(headers: Headers): {
  limit?: number;
  remaining?: number;
  reset?: Date;
} {
  const limit = headers.get('x-ratelimit-limit');
  const remaining = headers.get('x-ratelimit-remaining');
  const reset = headers.get('x-ratelimit-reset');
  
  return {
    limit: limit ? parseInt(limit, 10) : undefined,
    remaining: remaining ? parseInt(remaining, 10) : undefined,
    reset: reset ? new Date(parseInt(reset, 10) * 1000) : undefined,
  };
}
