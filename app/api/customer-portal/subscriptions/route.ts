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

    // Get customer subscriptions with plan details
    const { data: subscriptions, error } = await supabase
      .from('subscriptions')
      .select(`
        *,
        subscription_plans!inner(
          name,
          description,
          amount,
          currency,
          interval_type,
          interval_count
        )
      `)
      .eq('customer_id', customer_id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Database error:", error);
      return NextResponse.json(
        { error: "Failed to fetch subscriptions" },
        { status: 500 }
      );
    }

    // Transform the data to include plan details
    const transformedSubscriptions = subscriptions?.map(sub => ({
      id: sub.id,
      plan_name: sub.subscription_plans.name,
      description: sub.subscription_plans.description,
      status: sub.status,
      current_period_start: sub.current_period_start,
      current_period_end: sub.current_period_end,
      amount: sub.subscription_plans.amount,
      currency: sub.subscription_plans.currency,
      interval_type: sub.subscription_plans.interval_type,
      interval_count: sub.subscription_plans.interval_count,
      next_billing_date: sub.current_period_end,
      cancel_at_period_end: sub.cancel_at_period_end,
      trial_end: sub.trial_end,
      created_at: sub.created_at,
      updated_at: sub.updated_at
    })) || [];

    return NextResponse.json({
      success: true,
      subscriptions: transformedSubscriptions
    });

  } catch (error) {
    console.error("Error fetching subscriptions:", error);
    
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
