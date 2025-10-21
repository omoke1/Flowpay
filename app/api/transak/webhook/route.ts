import { NextRequest, NextResponse } from 'next/server';
import { verifyTransakWebhook, TransakWebhookPayload } from '@/lib/transak';
import { supabase } from '@/lib/supabase';
import { sendCustomerReceipt, sendMerchantNotification } from '@/lib/resend';

export async function POST(request: NextRequest) {
  try {
    // Get the raw body for signature verification
    const body = await request.text();
    const signature = request.headers.get('x-transak-signature') || '';

    // Verify webhook signature with enhanced security
    if (!verifyTransakWebhook(body, signature, request)) {
      console.error('Invalid Transak webhook signature or payload');
      return NextResponse.json(
        { error: 'Invalid webhook signature or payload' },
        { status: 401 }
      );
    }

    // Parse the webhook payload
    const payload: TransakWebhookPayload = JSON.parse(body);
    const { eventName, webhookData } = payload;

    console.log('Transak webhook received:', eventName, webhookData.id);

    // Handle ORDER_COMPLETED event
    if (eventName === 'ORDER_COMPLETED') {
      await handleOrderCompleted(webhookData);
    }

    // Handle other events if needed
    if (eventName === 'ORDER_FAILED') {
      await handleOrderFailed(webhookData);
    }

    return NextResponse.json({ success: true, received: true });
  } catch (error) {
    console.error('Error processing Transak webhook:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function handleOrderCompleted(orderData: TransakWebhookPayload['webhookData']) {
  try {
    if (!supabase) {
      console.error('Supabase not configured');
      return;
    }

    // Find the payment record by Transak order ID
    const supabaseClient = supabase!; // We know supabase is not null due to the check above
    const { data: existingPayment, error: fetchError } = await supabaseClient
      .from('payments')
      .select(`
        *,
        payment_links!payments_link_id_fkey(
          product_name,
          merchant_id,
          users!payment_links_merchant_id_fkey(wallet_address, email)
        )
      `)
      .eq('transak_order_id', orderData.id)
      .single();

    if (fetchError || !existingPayment) {
      console.error('Payment not found for Transak order:', orderData.id);
      return;
    }

    // Update payment status to completed
    const { error: updateError } = await supabaseClient
      .from('payments')
      .update({
        status: 'completed',
        settlement_status: 'completed', // Transak settles directly
        tx_hash: orderData.transactionHash || null,
        paid_at: orderData.completedAt || new Date().toISOString(),
      })
      .eq('id', existingPayment.id);

    if (updateError) {
      console.error('Error updating payment:', updateError);
      return;
    }

    // Send email notifications
    try {
      const paymentLink = existingPayment.payment_links;
      const merchant = paymentLink?.users;

      const receiptData = {
        productName: paymentLink?.product_name || 'Payment',
        amount: existingPayment.fiat_amount || existingPayment.amount,
        token: 'USDC.e',
        txHash: orderData.transactionHash || orderData.id,
        recipientAddress: merchant?.wallet_address || '',
        merchantEmail: merchant?.email,
        paymentMethod: 'Card (Transak)',
        fiatAmount: existingPayment.fiat_amount,
        fiatCurrency: existingPayment.fiat_currency || 'USD',
      };

      // Send notifications
      await Promise.all([
        sendMerchantNotification(receiptData),
        // Customer email would need their email address
        // sendCustomerReceipt(receiptData, customerEmail)
      ]);
    } catch (emailError) {
      console.error('Error sending email notifications:', emailError);
      // Don't fail the webhook if email fails
    }

    console.log('Order completed successfully:', orderData.id);
  } catch (error) {
    console.error('Error handling order completed:', error);
  }
}

async function handleOrderFailed(orderData: TransakWebhookPayload['webhookData']) {
  try {
    if (!supabase) {
      console.error('Supabase not configured');
      return;
    }

    // Update payment status to failed
    const { error } = await supabaseClient
      .from('payments')
      .update({
        status: 'failed',
        settlement_status: 'failed',
      })
      .eq('transak_order_id', orderData.id);

    if (error) {
      console.error('Error updating failed payment:', error);
    }

    console.log('Order failed:', orderData.id);
  } catch (error) {
    console.error('Error handling order failed:', error);
  }
}

