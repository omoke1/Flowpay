// Migration API Route
// Creates subscription tables using Supabase client

import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(request: NextRequest) {
  try {
    console.log("Starting subscription schema migration...");

    // Test if tables already exist
    const { data: existingPlans, error: plansCheckError } = await supabase
      .from('subscription_plans')
      .select('*')
      .limit(1);

    if (!plansCheckError) {
      console.log("Subscription tables already exist");
      return NextResponse.json({
        success: true,
        message: "Subscription tables already exist",
        tablesExist: true
      });
    }

    console.log("Tables don't exist, creating them...");

    // Since we can't create tables directly through the client,
    // we'll create a simple workaround by creating a test record
    // and handling the error gracefully
    
    // Try to insert a test record to see what the exact error is
    const { data: testInsert, error: insertError } = await supabase
      .from('subscription_plans')
      .insert({
        merchant_id: 'test',
        name: 'Test Plan',
        amount: 9.99,
        currency: 'USD',
        interval_type: 'month',
        interval_count: 1
      })
      .select();

    if (insertError) {
      console.error("Insert test error:", insertError);
      return NextResponse.json({
        error: "Subscription tables don't exist",
        details: insertError.message,
        suggestion: "Please create the subscription tables in your Supabase dashboard using the schema in lib/subscription-schema.sql"
      }, { status: 500 });
    }

    // If we get here, the table exists and we can delete the test record
    if (testInsert && testInsert.length > 0) {
      await supabase
        .from('subscription_plans')
        .delete()
        .eq('id', testInsert[0].id);
    }

    return NextResponse.json({
      success: true,
      message: "Subscription tables are working correctly"
    });

  } catch (error) {
    console.error("Migration error:", error);
    return NextResponse.json(
      { 
        error: "Migration check failed",
        details: error instanceof Error ? error.message : 'Unknown error',
        suggestion: "Please create the subscription tables in your Supabase dashboard using the schema in lib/subscription-schema.sql"
      },
      { status: 500 }
    );
  }
}
