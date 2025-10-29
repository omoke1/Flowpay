// Cron Job API Route
// Processes recurring subscriptions and scheduled payments

import { NextRequest, NextResponse } from "next/server";
import { subscriptionService } from "@/lib/subscription-service";

export async function GET(request: NextRequest) {
  try {
    // Verify this is a legitimate cron request
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;
    
    if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    console.log("Processing recurring subscriptions...");
    
    const result = await subscriptionService.processRecurringPayments();

    if (!result.success) {
      console.error("Error processing recurring payments:", result.error);
      return NextResponse.json(
        { 
          error: "Failed to process recurring payments",
          details: result.error 
        },
        { status: 500 }
      );
    }

    console.log(`Successfully processed ${result.processed} recurring payments`);

    return NextResponse.json({
      success: true,
      message: `Processed ${result.processed} recurring payments`,
      processed: result.processed,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error("Cron job error:", error);
    return NextResponse.json(
      { 
        error: "Internal server error",
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Also support POST for webhook-style calls
export async function POST(request: NextRequest) {
  return GET(request);
}
