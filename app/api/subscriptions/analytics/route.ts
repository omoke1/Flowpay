// Subscription Analytics API Route
// Handles subscription analytics and reporting

import { NextRequest, NextResponse } from "next/server";
import { subscriptionService } from "@/lib/subscription-service";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const merchantId = searchParams.get('merchantId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    if (!merchantId) {
      return NextResponse.json(
        { error: "Merchant ID is required" },
        { status: 400 }
      );
    }

    // Default to last 30 days if no dates provided
    const defaultStartDate = new Date();
    defaultStartDate.setDate(defaultStartDate.getDate() - 30);
    const defaultEndDate = new Date();

    const result = await subscriptionService.getAnalytics(
      merchantId,
      startDate || defaultStartDate.toISOString().split('T')[0],
      endDate || defaultEndDate.toISOString().split('T')[0]
    );

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Failed to fetch subscription analytics" },
        { status: 500 }
      );
    }

    // Calculate summary metrics
    const analytics = result.analytics || [];
    const totalMRR = analytics.reduce((sum, day) => sum + (day.mrr || 0), 0);
    const avgMRR = analytics.length > 0 ? totalMRR / analytics.length : 0;
    const totalARR = analytics.reduce((sum, day) => sum + (day.arr || 0), 0);
    const avgARR = analytics.length > 0 ? totalARR / analytics.length : 0;
    const totalRevenue = analytics.reduce((sum, day) => sum + (day.recurring_revenue || 0), 0);
    const totalActiveSubscriptions = analytics.length > 0 ? analytics[analytics.length - 1].active_subscriptions : 0;
    const totalNewSubscriptions = analytics.reduce((sum, day) => sum + (day.new_subscriptions || 0), 0);
    const totalCancelledSubscriptions = analytics.reduce((sum, day) => sum + (day.cancelled_subscriptions || 0), 0);
    const churnRate = totalActiveSubscriptions > 0 ? (totalCancelledSubscriptions / totalActiveSubscriptions) * 100 : 0;

    return NextResponse.json({
      success: true,
      analytics: result.analytics,
      summary: {
        totalMRR: Math.round(avgMRR * 100) / 100,
        totalARR: Math.round(avgARR * 100) / 100,
        totalRevenue: Math.round(totalRevenue * 100) / 100,
        activeSubscriptions: totalActiveSubscriptions,
        newSubscriptions: totalNewSubscriptions,
        cancelledSubscriptions: totalCancelledSubscriptions,
        churnRate: Math.round(churnRate * 100) / 100
      }
    });

  } catch (error) {
    console.error("Error fetching subscription analytics:", error);
    return NextResponse.json(
      { 
        error: "Internal server error",
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
