// Cancel Subscription API Route
// Handles subscription cancellation

import { NextRequest, NextResponse } from "next/server";
import { subscriptionService } from "@/lib/subscription-service";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const subscriptionId = params.id;
    const body = await request.json();
    const { cancelAtPeriodEnd = true } = body;

    if (!subscriptionId) {
      return NextResponse.json(
        { error: "Subscription ID is required" },
        { status: 400 }
      );
    }

    const result = await subscriptionService.cancelSubscription(
      subscriptionId,
      cancelAtPeriodEnd
    );

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Failed to cancel subscription" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: cancelAtPeriodEnd 
        ? "Subscription will be cancelled at the end of the current period"
        : "Subscription has been cancelled immediately"
    });

  } catch (error) {
    console.error("Error cancelling subscription:", error);
    return NextResponse.json(
      { 
        error: "Internal server error",
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
