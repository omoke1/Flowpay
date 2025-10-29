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

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authHeader = request.headers.get('authorization');
    const { customer_id } = verifyCustomerToken(authHeader);
    const { id: subscriptionId } = await params;

    if (!supabase) {
      return NextResponse.json(
        { error: "Database not configured" },
        { status: 500 }
      );
    }

    // Verify the subscription belongs to the customer
    const { data: subscription, error: fetchError } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('id', subscriptionId)
      .eq('customer_id', customer_id)
      .single();

    if (fetchError || !subscription) {
      return NextResponse.json(
        { error: "Subscription not found" },
        { status: 404 }
      );
    }

    if (subscription.status === 'cancelled') {
      return NextResponse.json(
        { error: "Subscription is already cancelled" },
        { status: 400 }
      );
    }

    // Cancel the subscription (set to cancel at period end)
    const { error: updateError } = await supabase
      .from('subscriptions')
      .update({
        cancel_at_period_end: true,
        updated_at: new Date().toISOString()
      })
      .eq('id', subscriptionId);

    if (updateError) {
      console.error("Database error:", updateError);
      return NextResponse.json(
        { error: "Failed to cancel subscription" },
        { status: 500 }
      );
    }

    // Log the cancellation event
    await supabase
      .from('subscription_events')
      .insert({
        subscription_id: subscriptionId,
        event_type: 'cancelled',
        event_data: {
          cancelled_by: 'customer',
          cancelled_at: new Date().toISOString()
        }
      });

    return NextResponse.json({
      success: true,
      message: "Subscription cancelled successfully"
    });

  } catch (error) {
    console.error("Error cancelling subscription:", error);
    
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
