import { supabase } from './supabase';

export interface CrossmintOrder {
  id: string;
  payment_link_id: string;
  crossmint_order_id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  fiat_amount: number;
  crypto_amount: number;
  currency: string;
  recipient_email?: string;
  recipient_wallet?: string;
  transaction_hash?: string;
  created_at: string;
  updated_at: string;
}

export interface PaymentMethod {
  id: string;
  payment_link_id: string;
  method_type: 'crypto' | 'fiat' | 'apple_pay' | 'google_pay';
  enabled: boolean;
  config?: any;
  created_at: string;
}

export interface FiatConversion {
  id: string;
  from_currency: string;
  to_currency: string;
  rate: number;
  timestamp: string;
}

export class CrossmintService {
  private static instance: CrossmintService;
  private apiKey: string;
  private clientId: string;
  private projectId: string;

  constructor() {
    this.apiKey = process.env.NEXT_CROSSMINT_API_KEY || '';
    this.clientId = process.env.NEXT_PUBLIC_CROSSMINT_CLIENT_ID || '';
    this.projectId = process.env.NEXT_PUBLIC_CROSSMINT_PROJECT_ID || '';
  }

  static getInstance(): CrossmintService {
    if (!CrossmintService.instance) {
      CrossmintService.instance = new CrossmintService();
    }
    return CrossmintService.instance;
  }

  /**
   * Create a Crossmint checkout session for a FlowPay payment link
   */
  async createCheckout(paymentLinkId: string, amount: number, currency: string = 'USD'): Promise<{
    success: boolean;
    checkoutUrl?: string;
    orderId?: string;
    error?: string;
  }> {
    try {
      // Check if supabase is configured
      if (!supabase) {
        return { success: false, error: 'Database not configured' };
      }

      // Get payment link details
      const { data: paymentLink, error: linkError } = await supabase
        .from('payment_links')
        .select('*')
        .eq('id', paymentLinkId)
        .single();

      if (linkError || !paymentLink) {
        return { success: false, error: 'Payment link not found' };
      }

      // Create Crossmint order
      console.log('Creating order data for payment link:', paymentLink);
      const cryptoAmount = this.convertFiatToCrypto(amount, currency, paymentLink.token);
      console.log('Converted amount:', amount, currency, 'to', cryptoAmount, paymentLink.token);
      
      const orderData = {
        payment_link_id: paymentLinkId,
        crossmint_order_id: `flowpay_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        status: 'pending',
        fiat_amount: amount,
        crypto_amount: cryptoAmount,
        currency,
        created_at: new Date().toISOString()
      };
      
      console.log('Order data to insert:', orderData);

      const { data: order, error: orderError } = await supabase
        .from('crossmint_orders')
        .insert(orderData)
        .select()
        .single();

      if (orderError) {
        console.error('Database error creating order:', orderError);
        return { success: false, error: `Failed to create order: ${orderError.message}` };
      }

      // Generate checkout URL
      console.log('Generating checkout URL for order:', order.crossmint_order_id);
      const checkoutUrl = this.generateCheckoutUrl(order.crossmint_order_id, amount, currency);
      console.log('Generated checkout URL:', checkoutUrl);

      return {
        success: true,
        checkoutUrl,
        orderId: order.crossmint_order_id
      };

    } catch (error) {
      console.error('Crossmint checkout creation error:', error);
      return { success: false, error: 'Internal server error' };
    }
  }

  /**
   * Handle Crossmint webhook events
   */
  async handleWebhook(event: any): Promise<{ success: boolean; error?: string }> {
    try {
      // Store webhook event
      if (supabase) {
        const { error: webhookError } = await supabase
          .from('crossmint_webhook_events')
          .insert({
            event_type: event.type,
            crossmint_order_id: event.data?.orderId,
            payload: event,
            processed: false
          });

        if (webhookError) {
          console.error('Failed to store webhook event:', webhookError);
        }
      }

      // Process different event types
      switch (event.type) {
        case 'order.succeeded':
          await this.handleOrderSucceeded(event.data);
          break;
        case 'order.failed':
          await this.handleOrderFailed(event.data);
          break;
        case 'order.delivered':
          await this.handleOrderDelivered(event.data);
          break;
        default:
          console.log('Unhandled webhook event:', event.type);
      }

      return { success: true };

    } catch (error) {
      console.error('Webhook handling error:', error);
      return { success: false, error: 'Webhook processing failed' };
    }
  }

  /**
   * Get Crossmint orders for a payment link
   */
  async getOrders(paymentLinkId: string): Promise<CrossmintOrder[]> {
    try {
      if (!supabase) {
        return [];
      }

      const { data: orders, error } = await supabase
        .from('crossmint_orders')
        .select('*')
        .eq('payment_link_id', paymentLinkId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Failed to fetch orders:', error);
        return [];
      }

      return orders || [];

    } catch (error) {
      console.error('Get orders error:', error);
      return [];
    }
  }

  /**
   * Get payment methods for a payment link
   */
  async getPaymentMethods(paymentLinkId: string): Promise<PaymentMethod[]> {
    try {
      if (!supabase) {
        return [];
      }

      const { data: methods, error } = await supabase
        .from('payment_methods')
        .select('*')
        .eq('payment_link_id', paymentLinkId)
        .eq('enabled', true);

      if (error) {
        console.error('Failed to fetch payment methods:', error);
        return [];
      }

      return methods || [];

    } catch (error) {
      console.error('Get payment methods error:', error);
      return [];
    }
  }

  /**
   * Enable/disable payment methods for a payment link
   */
  async updatePaymentMethods(paymentLinkId: string, methods: {
    crypto: boolean;
    fiat: boolean;
    apple_pay: boolean;
    google_pay: boolean;
  }): Promise<{ success: boolean; error?: string }> {
    try {
      if (!supabase) {
        return { success: false, error: 'Database not configured' };
      }

      // Delete existing methods
      await supabase
        .from('payment_methods')
        .delete()
        .eq('payment_link_id', paymentLinkId);

      // Insert new methods
      const methodEntries = Object.entries(methods).map(([type, enabled]) => ({
        payment_link_id: paymentLinkId,
        method_type: type,
        enabled,
        created_at: new Date().toISOString()
      }));

      const { error } = await supabase
        .from('payment_methods')
        .insert(methodEntries);

      if (error) {
        return { success: false, error: 'Failed to update payment methods' };
      }

      return { success: true };

    } catch (error) {
      console.error('Update payment methods error:', error);
      return { success: false, error: 'Internal server error' };
    }
  }

  /**
   * Get fiat conversion rate
   */
  async getConversionRate(fromCurrency: string, toCurrency: string): Promise<number> {
    try {
      if (!supabase) {
        return 1.0;
      }

      // Check for recent conversion rate
      const { data: conversion, error } = await supabase
        .from('fiat_conversions')
        .select('rate')
        .eq('from_currency', fromCurrency)
        .eq('to_currency', toCurrency)
        .gte('timestamp', new Date(Date.now() - 3600000).toISOString()) // 1 hour ago
        .order('timestamp', { ascending: false })
        .limit(1)
        .single();

      if (conversion && !error) {
        return conversion.rate;
      }

      // Fetch new rate from external API (implement your preferred exchange rate API)
      const rate = await this.fetchExchangeRate(fromCurrency, toCurrency);
      
      // Store the rate
      await supabase
        .from('fiat_conversions')
        .insert({
          from_currency: fromCurrency,
          to_currency: toCurrency,
          rate,
          timestamp: new Date().toISOString()
        });

      return rate;

    } catch (error) {
      console.error('Conversion rate error:', error);
      return 1; // Default rate
    }
  }

  private async handleOrderSucceeded(data: any): Promise<void> {
    try {
      const { error } = await supabase
        ?.from('crossmint_orders')
        .update({
          status: 'completed',
          transaction_hash: data.transactionHash,
          updated_at: new Date().toISOString()
        })
        .eq('crossmint_order_id', data.orderId);

      if (error) {
        console.error('Failed to update order status:', error);
      }

      // Create payment record
      const { data: order } = await supabase
        ?.from('crossmint_orders')
        .select('*')
        .eq('crossmint_order_id', data.orderId)
        .single();

      if (order) {
        await supabase
          ?.from('payments')
          .insert({
            link_id: order.payment_link_id,
            payer_address: order.recipient_wallet || 'crossmint_user',
            amount: order.crypto_amount.toString(),
            token: 'USDC', // Crossmint typically converts to USDC
            tx_hash: order.transaction_hash,
            status: 'completed',
            paid_at: new Date().toISOString()
          });
      }

    } catch (error) {
      console.error('Handle order succeeded error:', error);
    }
  }

  private async handleOrderFailed(data: any): Promise<void> {
    try {
      const { error } = await supabase
        ?.from('crossmint_orders')
        .update({
          status: 'failed',
          updated_at: new Date().toISOString()
        })
        .eq('crossmint_order_id', data.orderId);

      if (error) {
        console.error('Failed to update order status:', error);
      }

    } catch (error) {
      console.error('Handle order failed error:', error);
    }
  }

  private async handleOrderDelivered(data: any): Promise<void> {
    try {
      const { error } = await supabase
        ?.from('crossmint_orders')
        .update({
          status: 'completed',
          updated_at: new Date().toISOString()
        })
        .eq('crossmint_order_id', data.orderId);

      if (error) {
        console.error('Failed to update order status:', error);
      }

    } catch (error) {
      console.error('Handle order delivered error:', error);
    }
  }

  private generateCheckoutUrl(orderId: string, amount: number, currency: string): string {
    // Use the official Crossmint checkout with proper parameters
    const baseUrl = 'https://checkout.crossmint.com';
    const params = new URLSearchParams({
      clientId: this.clientId,
      projectId: this.projectId,
      amount: amount.toString(),
      currency: currency,
      successUrl: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/success?orderId=${orderId}`,
      cancelUrl: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/cancel?orderId=${orderId}`,
      // Use the order ID as reference
      reference: orderId,
      // Payment method configuration
      paymentMethod: 'fiat',
      // Blockchain configuration
      blockchain: 'flow'
    });

    return `${baseUrl}?${params.toString()}`;
  }

  private convertFiatToCrypto(fiatAmount: number, currency: string, token: string): number {
    // This is a simplified conversion - you should implement proper exchange rate logic
    // For now, assuming 1 USD = 1 USDC (you'll need real exchange rates)
    return fiatAmount;
  }

  private async fetchExchangeRate(fromCurrency: string, toCurrency: string): Promise<number> {
    // Implement your preferred exchange rate API (CoinGecko, CoinMarketCap, etc.)
    // For now, return a default rate
    return 1;
  }
}

export const crossmintService = CrossmintService.getInstance();
