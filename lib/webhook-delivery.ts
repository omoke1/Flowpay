// Real webhook delivery system with retry logic and signature verification
import crypto from 'crypto';

interface WebhookEvent {
  id: string;
  type: string;
  data: any;
  timestamp: string;
  merchantId: string;
}

interface WebhookDeliveryResult {
  success: boolean;
  statusCode: number;
  responseBody: string;
  error?: string;
}

class WebhookDeliveryService {
  private static instance: WebhookDeliveryService;

  static getInstance(): WebhookDeliveryService {
    if (!WebhookDeliveryService.instance) {
      WebhookDeliveryService.instance = new WebhookDeliveryService();
    }
    return WebhookDeliveryService.instance;
  }

  // Generate webhook signature
  private generateSignature(payload: string, secret: string): string {
    return crypto
      .createHmac('sha256', secret)
      .update(payload)
      .digest('hex');
  }

  // Deliver webhook with retry logic
  async deliverWebhook(
    webhookUrl: string,
    event: WebhookEvent,
    secret: string,
    maxRetries: number = parseInt(process.env.WEBHOOK_MAX_RETRIES || '3')
  ): Promise<WebhookDeliveryResult> {
    const payload = JSON.stringify(event);
    const signature = this.generateSignature(payload, secret);
    
    const headers = {
      'Content-Type': 'application/json',
      'X-Webhook-Signature': `sha256=${signature}`,
      'X-Webhook-Event': event.type,
      'X-Webhook-ID': event.id,
      'User-Agent': 'FlowPay-Webhook/1.0',
    };

    let lastError: Error | null = null;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`Webhook delivery attempt ${attempt}/${maxRetries} to ${webhookUrl}`);
        
        const response = await fetch(webhookUrl, {
          method: 'POST',
          headers,
          body: payload,
          signal: AbortSignal.timeout(parseInt(process.env.WEBHOOK_TIMEOUT || '30000')), // Configurable timeout
        });

        const responseBody = await response.text();
        
        if (response.ok) {
          console.log(`Webhook delivered successfully to ${webhookUrl}`);
          return {
            success: true,
            statusCode: response.status,
            responseBody,
          };
        } else {
          console.warn(`Webhook delivery failed with status ${response.status}: ${responseBody}`);
          lastError = new Error(`HTTP ${response.status}: ${responseBody}`);
        }
      } catch (error) {
        console.error(`Webhook delivery attempt ${attempt} failed:`, error);
        lastError = error as Error;
      }

      // Wait before retry (exponential backoff)
      if (attempt < maxRetries) {
        const baseDelay = parseInt(process.env.WEBHOOK_RETRY_DELAY || '1000');
        const delay = Math.pow(2, attempt - 1) * baseDelay; // 1s, 2s, 4s
        console.log(`Waiting ${delay}ms before retry...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    return {
      success: false,
      statusCode: 0,
      responseBody: '',
      error: lastError?.message || 'Max retries reached',
    };
  }

  // Deliver webhook for payment events
  async deliverPaymentWebhook(
    webhookUrl: string,
    secret: string,
    paymentData: {
      id: string;
      linkId: string;
      payerAddress: string;
      amount: string;
      token: string;
      txHash: string;
      status: string;
      paidAt: string;
    }
  ): Promise<WebhookDeliveryResult> {
    const event: WebhookEvent = {
      id: `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: 'payment.completed',
      data: {
        payment: paymentData,
        merchant: {
          // Add merchant info if needed
        },
      },
      timestamp: new Date().toISOString(),
      merchantId: paymentData.linkId, // This should be the merchant's wallet address
    };

    return this.deliverWebhook(webhookUrl, event, secret);
  }

  // Deliver webhook for payment link events
  async deliverPaymentLinkWebhook(
    webhookUrl: string,
    secret: string,
    linkData: {
      id: string;
      productName: string;
      amount: string;
      token: string;
      status: string;
      merchantId: string;
    },
    eventType: 'payment_link.created' | 'payment_link.updated' | 'payment_link.deleted'
  ): Promise<WebhookDeliveryResult> {
    const event: WebhookEvent = {
      id: `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: eventType,
      data: {
        payment_link: linkData,
      },
      timestamp: new Date().toISOString(),
      merchantId: linkData.merchantId,
    };

    return this.deliverWebhook(webhookUrl, event, secret);
  }

  // Verify webhook signature (for incoming webhooks)
  verifyWebhookSignature(
    payload: string,
    signature: string,
    secret: string
  ): boolean {
    const expectedSignature = this.generateSignature(payload, secret);
    const providedSignature = signature.replace('sha256=', '');
    
    return crypto.timingSafeEqual(
      Buffer.from(expectedSignature, 'hex'),
      Buffer.from(providedSignature, 'hex')
    );
  }

  // Process webhook delivery queue (for retry logic)
  async processWebhookQueue(): Promise<void> {
    try {
      // This would be called by a background job to retry failed webhooks
      // Implementation depends on your queue system (Redis, database, etc.)
      console.log('Processing webhook delivery queue...');
    } catch (error) {
      console.error('Error processing webhook queue:', error);
    }
  }
}

export const webhookDeliveryService = WebhookDeliveryService.getInstance();
