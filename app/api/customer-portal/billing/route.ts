import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import jwt from 'jsonwebtoken';

function verifyCustomerToken(authHeader: string | null) {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('No valid authorization header');
  }

  const token = authHeader.substring(7);
  const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as any;
  
  if (decoded.type !== 'customer') {
    throw new Error('Invalid token type');
  }

  return decoded;
}

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const { customer_id } = verifyCustomerToken(authHeader);

    if (!supabase) {
      return NextResponse.json(
        { error: "Database not configured" },
        { status: 500 }
      );
    }

    // Get customer's subscription payments
    const { data: payments, error } = await supabase
      .from('subscription_payments')
      .select(`
        *,
        subscriptions!inner(
          customer_id,
          subscription_plans!inner(name)
        )
      `)
      .eq('subscriptions.customer_id', customer_id)
      .order('processed_at', { ascending: false });

    if (error) {
      console.error("Database error:", error);
      return NextResponse.json(
        { error: "Failed to fetch billing records" },
        { status: 500 }
      );
    }

    // Transform the data
    const billingRecords = payments?.map(payment => ({
      id: payment.id,
      subscription_id: payment.subscription_id,
      plan_name: payment.subscriptions.subscription_plans.name,
      amount: payment.amount,
      currency: payment.currency,
      status: payment.status,
      payment_method: payment.payment_method,
      processed_at: payment.processed_at || payment.created_at,
      invoice_url: payment.invoice_url,
      receipt_url: payment.receipt_url
    })) || [];

    return NextResponse.json({
      success: true,
      billing_records: billingRecords
    });

  } catch (error) {
    console.error("Error fetching billing records:", error);
    
    if (error instanceof Error && error.message.includes('token')) {
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
