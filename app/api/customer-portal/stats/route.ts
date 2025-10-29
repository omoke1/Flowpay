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

    // Get customer stats
    const [
      { data: subscriptions, error: subsError },
      { data: payments, error: paymentsError }
    ] = await Promise.all([
      supabase
        .from('subscriptions')
        .select('status, created_at, current_period_end')
        .eq('customer_id', customer_id),
      supabase
        .from('subscription_payments')
        .select('amount, status, processed_at')
        .eq('subscriptions.customer_id', customer_id)
        .eq('status', 'completed')
    ]);

    if (subsError || paymentsError) {
      console.error("Database error:", subsError || paymentsError);
      return NextResponse.json(
        { error: "Failed to fetch customer stats" },
        { status: 500 }
      );
    }

    // Calculate stats
    const activeSubscriptions = subscriptions?.filter(sub => sub.status === 'active').length || 0;
    const totalSpent = payments?.reduce((sum, payment) => sum + payment.amount, 0) || 0;
    
    // Find next payment
    const activeSubs = subscriptions?.filter(sub => sub.status === 'active') || [];
    const nextPayment = activeSubs.length > 0 ? 
      activeSubs.reduce((min, sub) => 
        new Date(sub.current_period_end) < new Date(min.current_period_end) ? sub : min
      ) : null;

    const nextPaymentAmount = nextPayment ? 
      payments?.find(p => p.processed_at && new Date(p.processed_at).toDateString() === new Date(nextPayment.current_period_end).toDateString())?.amount || 0 
      : 0;

    return NextResponse.json({
      success: true,
      active_subscriptions: activeSubscriptions,
      total_spent: totalSpent,
      next_payment: nextPaymentAmount,
      next_payment_date: nextPayment?.current_period_end || null
    });

  } catch (error) {
    console.error("Error fetching customer stats:", error);
    
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
