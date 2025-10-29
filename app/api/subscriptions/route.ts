// Subscriptions API Route
// Handles CRUD operations for subscriptions

import { NextRequest, NextResponse } from "next/server";
import { subscriptionService } from "@/lib/subscription-service";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const merchantId = searchParams.get('merchantId');

    if (!merchantId) {
      return NextResponse.json(
        { error: "Merchant ID is required" },
        { status: 400 }
      );
    }

    const result = await subscriptionService.getSubscriptions(merchantId);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Failed to fetch subscriptions" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      subscriptions: result.subscriptions
    });

  } catch (error) {
    console.error("Error fetching subscriptions:", error);
    return NextResponse.json(
      { 
        error: "Internal server error",
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      merchantId,
      customerId,
      customerEmail,
      planId,
      metadata
    } = body;

    // Validate required fields
    if (!merchantId || !customerId || !planId) {
      return NextResponse.json(
        { error: "Missing required fields: merchantId, customerId, planId" },
        { status: 400 }
      );
    }

    const result = await subscriptionService.createSubscription({
      merchantId,
      customerId,
      customerEmail,
      planId,
      metadata
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Failed to create subscription" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      subscription: result.subscription
    });

  } catch (error) {
    console.error("Error creating subscription:", error);
    return NextResponse.json(
      { 
        error: "Internal server error",
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
