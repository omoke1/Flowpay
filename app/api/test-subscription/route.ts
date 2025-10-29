// Test subscription API route
// Simple test to see what's causing the 500 error

import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  try {
    console.log("Testing subscription service...");
    
    // Test basic Supabase connection
    const { data: testData, error: testError } = await supabase
      .from('users')
      .select('count')
      .limit(1);
    
    if (testError) {
      console.error("Supabase connection error:", testError);
      return NextResponse.json({
        error: "Supabase connection failed",
        details: testError.message
      }, { status: 500 });
    }

    // Test if subscription_plans table exists
    const { data: plansData, error: plansError } = await supabase
      .from('subscription_plans')
      .select('*')
      .limit(1);

    if (plansError) {
      console.error("Subscription plans table error:", plansError);
      return NextResponse.json({
        error: "Subscription plans table doesn't exist or has issues",
        details: plansError.message,
        suggestion: "Run the subscription schema migration"
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: "Subscription service is working",
      plansCount: plansData?.length || 0
    });

  } catch (error) {
    console.error("Test error:", error);
    return NextResponse.json(
      { 
        error: "Test failed",
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
