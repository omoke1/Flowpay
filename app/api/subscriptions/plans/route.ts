// Subscription Plans API Route
// Handles CRUD operations for subscription plans

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

    const result = await subscriptionService.getPlans(merchantId);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Failed to fetch subscription plans" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      plans: result.plans
    });

  } catch (error) {
    console.error("Error fetching subscription plans:", error);
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
      name,
      description,
      amount,
      currency,
      intervalType,
      intervalCount,
      trialPeriodDays,
      setupFee,
      metadata
    } = body;

    // Validate required fields
    if (!merchantId || !name || !amount || !currency || !intervalType) {
      return NextResponse.json(
        { error: "Missing required fields: merchantId, name, amount, currency, intervalType" },
        { status: 400 }
      );
    }

    // Validate interval type
    if (!['day', 'week', 'month', 'year'].includes(intervalType)) {
      return NextResponse.json(
        { error: "Invalid interval type. Must be one of: day, week, month, year" },
        { status: 400 }
      );
    }

    // Validate amount
    if (amount <= 0) {
      return NextResponse.json(
        { error: "Amount must be greater than 0" },
        { status: 400 }
      );
    }

    const result = await subscriptionService.createPlan({
      merchantId,
      name,
      description,
      amount: parseFloat(amount),
      currency,
      intervalType,
      intervalCount: parseInt(intervalCount) || 1,
      trialPeriodDays: parseInt(trialPeriodDays) || 0,
      setupFee: parseFloat(setupFee) || 0,
      metadata
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Failed to create subscription plan" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      plan: result.plan
    });

  } catch (error) {
    console.error("Error creating subscription plan:", error);
    return NextResponse.json(
      { 
        error: "Internal server error",
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
