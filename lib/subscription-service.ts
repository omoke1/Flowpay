// Subscription Service
// Handles subscription plans, recurring payments, and scheduling

import { supabase } from './supabase';

export interface SubscriptionPlan {
  id: string;
  merchant_id: string;
  name: string;
  description?: string;
  amount: number;
  currency: string;
  interval_type: 'day' | 'week' | 'month' | 'year';
  interval_count: number;
  trial_period_days?: number;
  setup_fee?: number;
  metadata?: Record<string, any>;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Subscription {
  id: string;
  merchant_id: string;
  customer_id: string;
  customer_email?: string;
  plan_id: string;
  status: 'active' | 'cancelled' | 'past_due' | 'unpaid' | 'paused';
  current_period_start: string;
  current_period_end: string;
  trial_start?: string;
  trial_end?: string;
  cancel_at_period_end: boolean;
  cancelled_at?: string;
  ended_at?: string;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface SubscriptionPayment {
  id: string;
  subscription_id: string;
  payment_link_id?: string;
  amount: number;
  currency: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled' | 'refunded';
  payment_method: 'crypto' | 'fiat' | 'apple_pay' | 'google_pay';
  token: string;
  scheduled_date: string;
  processed_at?: string;
  failure_reason?: string;
  retry_count: number;
  max_retries: number;
  tx_hash?: string;
  crossmint_order_id?: string;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface PaymentSchedule {
  id: string;
  subscription_id: string;
  scheduled_date: string;
  amount: number;
  currency: string;
  status: 'scheduled' | 'processing' | 'completed' | 'failed' | 'cancelled' | 'skipped';
  retry_count: number;
  max_retries: number;
  next_retry_at?: string;
  failure_reason?: string;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface SubscriptionAnalytics {
  id: string;
  merchant_id: string;
  date: string;
  active_subscriptions: number;
  new_subscriptions: number;
  cancelled_subscriptions: number;
  recurring_revenue: number;
  churn_rate: number;
  mrr: number;
  arr: number;
  created_at: string;
}

export class SubscriptionService {
  private static instance: SubscriptionService;

  public static getInstance(): SubscriptionService {
    if (!SubscriptionService.instance) {
      SubscriptionService.instance = new SubscriptionService();
    }
    return SubscriptionService.instance;
  }

  /**
   * Create a new subscription plan
   */
  async createPlan(data: {
    merchantId: string;
    name: string;
    description?: string;
    amount: number;
    currency: string;
    intervalType: 'day' | 'week' | 'month' | 'year';
    intervalCount?: number;
    trialPeriodDays?: number;
    setupFee?: number;
    metadata?: Record<string, any>;
  }): Promise<{ success: boolean; plan?: SubscriptionPlan; error?: string }> {
    try {
      if (!supabase) {
        throw new Error('Database not configured');
      }

      const { data: planData, error } = await supabase
        .from('subscription_plans')
        .insert({
          merchant_id: data.merchantId,
          name: data.name,
          description: data.description,
          amount: data.amount,
          currency: data.currency,
          interval_type: data.intervalType,
          interval_count: data.intervalCount || 1,
          trial_period_days: data.trialPeriodDays || 0,
          setup_fee: data.setupFee || 0,
          metadata: data.metadata || {}
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating subscription plan:', error);
        throw new Error(`Failed to create subscription plan: ${error.message}`);
      }

      return {
        success: true,
        plan: planData as SubscriptionPlan
      };

    } catch (error) {
      console.error('Error creating subscription plan:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Get subscription plans for a merchant
   */
  async getPlans(merchantId: string): Promise<{ success: boolean; plans?: SubscriptionPlan[]; error?: string }> {
    try {
      if (!supabase) {
        throw new Error('Database not configured');
      }

      const { data: plans, error } = await supabase
        .from('subscription_plans')
        .select('*')
        .eq('merchant_id', merchantId)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching subscription plans:', error);
        throw new Error(`Failed to fetch subscription plans: ${error.message}`);
      }

      return {
        success: true,
        plans: plans as SubscriptionPlan[]
      };

    } catch (error) {
      console.error('Error fetching subscription plans:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Create a new subscription
   */
  async createSubscription(data: {
    merchantId: string;
    customerId: string;
    customerEmail?: string;
    planId: string;
    metadata?: Record<string, any>;
  }): Promise<{ success: boolean; subscription?: Subscription; error?: string }> {
    try {
      if (!supabase) {
        throw new Error('Database not configured');
      }

      // Get plan details
      const { data: plan, error: planError } = await supabase
        .from('subscription_plans')
        .select('*')
        .eq('id', data.planId)
        .single();

      if (planError || !plan) {
        throw new Error('Subscription plan not found');
      }

      const now = new Date();
      const trialStart = plan.trial_period_days > 0 ? now : null;
      const trialEnd = plan.trial_period_days > 0 ? 
        new Date(now.getTime() + (plan.trial_period_days * 24 * 60 * 60 * 1000)) : null;
      
      const currentPeriodStart = trialEnd || now;
      const currentPeriodEnd = this.calculateNextBillingDate(
        currentPeriodStart,
        plan.interval_type,
        plan.interval_count
      );

      const { data: subscriptionData, error } = await supabase
        .from('subscriptions')
        .insert({
          merchant_id: data.merchantId,
          customer_id: data.customerId,
          customer_email: data.customerEmail,
          plan_id: data.planId,
          current_period_start: currentPeriodStart.toISOString(),
          current_period_end: currentPeriodEnd.toISOString(),
          trial_start: trialStart?.toISOString(),
          trial_end: trialEnd?.toISOString(),
          metadata: data.metadata || {}
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating subscription:', error);
        throw new Error(`Failed to create subscription: ${error.message}`);
      }

      // Create initial payment schedule
      await this.createPaymentSchedule(subscriptionData.id, plan, currentPeriodEnd);

      // Log subscription event
      await this.logSubscriptionEvent(subscriptionData.id, 'subscription_created', {
        plan_id: data.planId,
        customer_id: data.customerId,
        trial_period_days: plan.trial_period_days
      });

      return {
        success: true,
        subscription: subscriptionData as Subscription
      };

    } catch (error) {
      console.error('Error creating subscription:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Get subscriptions for a merchant
   */
  async getSubscriptions(merchantId: string): Promise<{ success: boolean; subscriptions?: Subscription[]; error?: string }> {
    try {
      if (!supabase) {
        throw new Error('Database not configured');
      }

      const { data: subscriptions, error } = await supabase
        .from('subscriptions')
        .select(`
          *,
          subscription_plans (
            name,
            amount,
            currency,
            interval_type,
            interval_count
          )
        `)
        .eq('merchant_id', merchantId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching subscriptions:', error);
        throw new Error(`Failed to fetch subscriptions: ${error.message}`);
      }

      return {
        success: true,
        subscriptions: subscriptions as Subscription[]
      };

    } catch (error) {
      console.error('Error fetching subscriptions:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Cancel a subscription
   */
  async cancelSubscription(
    subscriptionId: string,
    cancelAtPeriodEnd: boolean = true
  ): Promise<{ success: boolean; error?: string }> {
    try {
      if (!supabase) {
        throw new Error('Database not configured');
      }

      const updateData: any = {
        cancel_at_period_end: cancelAtPeriodEnd,
        updated_at: new Date().toISOString()
      };

      if (!cancelAtPeriodEnd) {
        updateData.status = 'cancelled';
        updateData.cancelled_at = new Date().toISOString();
        updateData.ended_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('subscriptions')
        .update(updateData)
        .eq('id', subscriptionId);

      if (error) {
        console.error('Error cancelling subscription:', error);
        throw new Error(`Failed to cancel subscription: ${error.message}`);
      }

      // Log subscription event
      await this.logSubscriptionEvent(subscriptionId, 'subscription_cancelled', {
        cancel_at_period_end: cancelAtPeriodEnd
      });

      return { success: true };

    } catch (error) {
      console.error('Error cancelling subscription:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Process recurring payments
   */
  async processRecurringPayments(): Promise<{ success: boolean; processed: number; error?: string }> {
    try {
      if (!supabase) {
        throw new Error('Database not configured');
      }

      const now = new Date();
      const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000);

      // Get scheduled payments that are due
      const { data: scheduledPayments, error: scheduleError } = await supabase
        .from('payment_schedules')
        .select(`
          *,
          subscriptions (
            *,
            subscription_plans (*)
          )
        `)
        .eq('status', 'scheduled')
        .lte('scheduled_date', oneHourFromNow.toISOString())
        .order('scheduled_date', { ascending: true });

      if (scheduleError) {
        console.error('Error fetching scheduled payments:', scheduleError);
        throw new Error(`Failed to fetch scheduled payments: ${scheduleError.message}`);
      }

      let processed = 0;

      for (const schedule of scheduledPayments || []) {
        try {
          await this.processScheduledPayment(schedule);
          processed++;
        } catch (error) {
          console.error(`Error processing scheduled payment ${schedule.id}:`, error);
          // Continue processing other payments
        }
      }

      return { success: true, processed };

    } catch (error) {
      console.error('Error processing recurring payments:', error);
      return {
        success: false,
        processed: 0,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Get subscription analytics
   */
  async getAnalytics(
    merchantId: string,
    startDate: string,
    endDate: string
  ): Promise<{ success: boolean; analytics?: SubscriptionAnalytics[]; error?: string }> {
    try {
      if (!supabase) {
        throw new Error('Database not configured');
      }

      const { data: analytics, error } = await supabase
        .from('subscription_analytics')
        .select('*')
        .eq('merchant_id', merchantId)
        .gte('date', startDate)
        .lte('date', endDate)
        .order('date', { ascending: true });

      if (error) {
        console.error('Error fetching subscription analytics:', error);
        throw new Error(`Failed to fetch subscription analytics: ${error.message}`);
      }

      return {
        success: true,
        analytics: analytics as SubscriptionAnalytics[]
      };

    } catch (error) {
      console.error('Error fetching subscription analytics:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Calculate next billing date
   */
  private calculateNextBillingDate(
    currentDate: Date,
    intervalType: string,
    intervalCount: number
  ): Date {
    const nextDate = new Date(currentDate);

    switch (intervalType) {
      case 'day':
        nextDate.setDate(nextDate.getDate() + intervalCount);
        break;
      case 'week':
        nextDate.setDate(nextDate.getDate() + (intervalCount * 7));
        break;
      case 'month':
        nextDate.setMonth(nextDate.getMonth() + intervalCount);
        break;
      case 'year':
        nextDate.setFullYear(nextDate.getFullYear() + intervalCount);
        break;
    }

    return nextDate;
  }

  /**
   * Create payment schedule for subscription
   */
  private async createPaymentSchedule(
    subscriptionId: string,
    plan: any,
    scheduledDate: Date
  ): Promise<void> {
    if (!supabase) return;

    await supabase
      .from('payment_schedules')
      .insert({
        subscription_id: subscriptionId,
        scheduled_date: scheduledDate.toISOString(),
        amount: plan.amount,
        currency: plan.currency,
        status: 'scheduled'
      });
  }

  /**
   * Process a scheduled payment
   */
  private async processScheduledPayment(schedule: any): Promise<void> {
    if (!supabase) return;

    const subscription = schedule.subscriptions;
    const plan = subscription.subscription_plans;

    // Update schedule status to processing
    await supabase
      .from('payment_schedules')
      .update({ status: 'processing' })
      .eq('id', schedule.id);

    try {
      // Create payment link for the subscription payment
      const { data: paymentLink, error: linkError } = await supabase
        .from('payment_links')
        .insert({
          merchant_id: subscription.merchant_id,
          product_name: `${plan.name} - Recurring Payment`,
          description: `Recurring payment for subscription ${subscription.id}`,
          amount: plan.amount.toString(),
          token: plan.currency === 'USD' ? 'USDC' : 'FLOW',
          accept_crypto: true,
          accept_fiat: true,
          status: 'active'
        })
        .select()
        .single();

      if (linkError || !paymentLink) {
        throw new Error('Failed to create payment link for subscription');
      }

      // Create subscription payment record
      const { error: paymentError } = await supabase
        .from('subscription_payments')
        .insert({
          subscription_id: subscription.id,
          payment_link_id: paymentLink.id,
          amount: plan.amount,
          currency: plan.currency,
          status: 'pending',
          payment_method: 'crypto', // Default to crypto, can be updated based on customer choice
          token: plan.currency === 'USD' ? 'USDC' : 'FLOW',
          scheduled_date: schedule.scheduled_date
        });

      if (paymentError) {
        throw new Error('Failed to create subscription payment record');
      }

      // Update schedule status to completed
      await supabase
        .from('payment_schedules')
        .update({ 
          status: 'completed',
          processed_at: new Date().toISOString()
        })
        .eq('id', schedule.id);

      // Log payment event
      await this.logSubscriptionEvent(subscription.id, 'payment_scheduled', {
        amount: plan.amount,
        currency: plan.currency,
        payment_link_id: paymentLink.id
      });

    } catch (error) {
      // Update schedule status to failed
      await supabase
        .from('payment_schedules')
        .update({ 
          status: 'failed',
          failure_reason: error instanceof Error ? error.message : 'Unknown error',
          retry_count: schedule.retry_count + 1,
          next_retry_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // Retry in 24 hours
        })
        .eq('id', schedule.id);

      throw error;
    }
  }

  /**
   * Log subscription event
   */
  private async logSubscriptionEvent(
    subscriptionId: string,
    eventType: string,
    eventData: Record<string, any>
  ): Promise<void> {
    if (!supabase) return;

    await supabase
      .from('subscription_events')
      .insert({
        subscription_id: subscriptionId,
        event_type: eventType,
        event_data: eventData
      });
  }
}

export const subscriptionService = SubscriptionService.getInstance();
