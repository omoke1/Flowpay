import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { SimpleUserService } from '@/lib/simple-user-service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { paymentLinkId, merchantWalletAddress } = body;

    if (!paymentLinkId || !merchantWalletAddress) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (!supabase) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 500 }
      );
    }

    // Fetch payment link details
    const supabaseClient = supabase!; // We know supabase is not null due to the check above
    const { data: paymentLink, error: linkError } = await supabaseClient
      .from('payment_links')
      .select('*')
      .eq('id', paymentLinkId)
      .single();

    if (linkError || !paymentLink) {
      return NextResponse.json(
        { error: 'Payment link not found' },
        { status: 404 }
      );
    }

    // Generate unique order reference
    const orderReference = `flowpay_${Date.now()}_${Math.random().toString(36).substring(7)}`;

    // Create pending payment record
    const { data: payment, error: paymentError } = await supabaseClient
      .from('payments')
      .insert({
        link_id: paymentLinkId,
        payer_address: 'pending', // Will be updated from webhook
        amount: paymentLink.amount,
        token: 'USDC',
        tx_hash: orderReference, // Temporary, will be updated from webhook
        status: 'pending',
        payment_method: 'fiat',
        fiat_amount: paymentLink.amount,
        fiat_currency: 'USD',
        settlement_status: 'pending',
        transak_order_id: orderReference, // Will be updated with actual Transak order ID
      })
      .select()
      .single();

    if (paymentError) {
      console.error('Error creating payment record:', paymentError);
      return NextResponse.json(
        { error: 'Failed to create payment record' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      orderReference,
      paymentId: payment.id,
      paymentLink: {
        productName: paymentLink.product_name,
        description: paymentLink.description,
        amount: paymentLink.amount,
        token: paymentLink.token,
      },
    });
  } catch (error) {
    console.error('Error creating Transak order:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

