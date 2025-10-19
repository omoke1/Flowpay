import crypto from 'crypto';

// Transak configuration
export const TRANSAK_CONFIG = {
  apiKey: process.env.NEXT_PUBLIC_TRANSAK_API_KEY || '',
  apiSecret: process.env.TRANSAK_API_SECRET || '',
  webhookSecret: process.env.TRANSAK_WEBHOOK_SECRET || '',
  environment: (process.env.NEXT_PUBLIC_TRANSAK_ENV || 'STAGING') as 'STAGING' | 'PRODUCTION',
  baseUrl: process.env.NEXT_PUBLIC_TRANSAK_ENV === 'PRODUCTION' 
    ? 'https://api.transak.com' 
    : 'https://api-stg.transak.com',
};

// Transak order status types
export type TransakOrderStatus = 
  | 'AWAITING_PAYMENT_FROM_USER'
  | 'PAYMENT_DONE_MARKED_BY_USER'
  | 'PROCESSING'
  | 'PENDING_DELIVERY_FROM_TRANSAK'
  | 'ON_HOLD_PENDING_DELIVERY_FROM_TRANSAK'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'FAILED'
  | 'REFUNDED'
  | 'EXPIRED';

export interface TransakOrder {
  id: string;
  status: TransakOrderStatus;
  walletAddress: string;
  cryptocurrency: string;
  cryptoAmount: number;
  fiatCurrency: string;
  fiatAmount: number;
  network: string;
  transactionHash?: string;
  createdAt: string;
  completedAt?: string;
}

export interface TransakWebhookPayload {
  eventName: string;
  webhookData: {
    id: string;
    status: TransakOrderStatus;
    walletAddress: string;
    cryptocurrency: string;
    cryptoAmount: number;
    fiatCurrency: string;
    fiatAmount: number;
    network: string;
    transactionHash?: string;
    createdAt: string;
    completedAt?: string;
    partnerOrderId?: string;
    partnerCustomerId?: string;
  };
}

/**
 * Initialize Transak SDK configuration for frontend
 */
export function getTransakConfig(params: {
  walletAddress: string;
  cryptoAmount?: number;
  fiatAmount?: number;
  cryptoCurrency?: string;
  fiatCurrency?: string;
  redirectURL?: string;
  partnerOrderId?: string;
  partnerCustomerId?: string;
}) {
  return {
    apiKey: TRANSAK_CONFIG.apiKey,
    environment: TRANSAK_CONFIG.environment,
    walletAddress: params.walletAddress,
    cryptoCurrencyCode: params.cryptoCurrency || 'USDC',
    fiatCurrency: params.fiatCurrency || 'USD',
    fiatAmount: params.fiatAmount,
    cryptoAmount: params.cryptoAmount,
    network: 'flow', // Flow blockchain
    redirectURL: params.redirectURL || `${process.env.NEXT_PUBLIC_APP_URL}/checkout/success`,
    themeColor: '97F11D', // FlowPay brand color
    hideMenu: true,
    exchangeScreenTitle: 'FlowPay Checkout',
    partnerOrderId: params.partnerOrderId,
    partnerCustomerId: params.partnerCustomerId,
    disableWalletAddressForm: true, // Pre-fill wallet address
  };
}

/**
 * Verify Transak webhook signature
 */
export function verifyTransakWebhook(
  payload: string,
  signature: string
): boolean {
  try {
    if (!TRANSAK_CONFIG.webhookSecret) {
      console.error('Transak webhook secret not configured');
      return false;
    }

    const hmac = crypto.createHmac('sha256', TRANSAK_CONFIG.webhookSecret);
    const digest = hmac.update(payload).digest('hex');
    
    return digest === signature;
  } catch (error) {
    console.error('Error verifying Transak webhook:', error);
    return false;
  }
}

/**
 * Get order details from Transak API
 */
export async function getTransakOrder(orderId: string): Promise<TransakOrder | null> {
  try {
    const response = await fetch(
      `${TRANSAK_CONFIG.baseUrl}/api/v2/order/${orderId}`,
      {
        headers: {
          'api-key': TRANSAK_CONFIG.apiKey,
        },
      }
    );

    if (!response.ok) {
      console.error('Failed to fetch Transak order:', response.statusText);
      return null;
    }

    const data = await response.json();
    return data.response as TransakOrder;
  } catch (error) {
    console.error('Error fetching Transak order:', error);
    return null;
  }
}

/**
 * Calculate USDC.e amount from USD (1:1 for stablecoins)
 */
export function calculateUSDCAmount(usdAmount: number): number {
  // For USDC, it's typically 1:1 with USD
  // In production, you might want to account for small variations
  return usdAmount;
}

/**
 * Format Transak order status for display
 */
export function formatTransakStatus(status: TransakOrderStatus): {
  label: string;
  color: 'green' | 'yellow' | 'red' | 'gray';
} {
  switch (status) {
    case 'COMPLETED':
      return { label: 'Completed', color: 'green' };
    case 'PROCESSING':
    case 'PENDING_DELIVERY_FROM_TRANSAK':
    case 'ON_HOLD_PENDING_DELIVERY_FROM_TRANSAK':
      return { label: 'Processing', color: 'yellow' };
    case 'AWAITING_PAYMENT_FROM_USER':
    case 'PAYMENT_DONE_MARKED_BY_USER':
      return { label: 'Awaiting Payment', color: 'yellow' };
    case 'FAILED':
      return { label: 'Failed', color: 'red' };
    case 'CANCELLED':
      return { label: 'Cancelled', color: 'gray' };
    case 'REFUNDED':
      return { label: 'Refunded', color: 'gray' };
    case 'EXPIRED':
      return { label: 'Expired', color: 'gray' };
    default:
      return { label: status, color: 'gray' };
  }
}

/**
 * Check if Transak is properly configured
 */
export function isTransakConfigured(): boolean {
  return !!(
    TRANSAK_CONFIG.apiKey &&
    TRANSAK_CONFIG.apiSecret &&
    TRANSAK_CONFIG.webhookSecret
  );
}

/**
 * Get Transak dashboard URL for order
 */
export function getTransakDashboardUrl(orderId: string): string {
  const baseUrl = TRANSAK_CONFIG.environment === 'PRODUCTION'
    ? 'https://global.transak.com'
    : 'https://global-stg.transak.com';
  
  return `${baseUrl}/order/${orderId}`;
}

