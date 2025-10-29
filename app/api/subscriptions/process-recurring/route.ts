// Process Recurring Payments API Route
// Handles processing of scheduled recurring payments

import { NextRequest, NextResponse } from "next/server";
import { subscriptionService } from "@/lib/subscription-service";

export async function POST(request: NextRequest) {
  try {
    console.log("Processing recurring payments...");

    const result = await subscriptionService.processRecurringPayments();

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Failed to process recurring payments" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Successfully processed ${result.processed} recurring payments`,
      processed: result.processed
    });

  } catch (error) {
    console.error("Error processing recurring payments:", error);
    return NextResponse.json(
      { 
        error: "Internal server error",
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
