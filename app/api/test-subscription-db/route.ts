import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
  try {
    console.log("Testing subscription database connection...");
    
    if (!supabase) {
      return NextResponse.json({ error: "Supabase not configured" }, { status: 500 });
    }

    // Test if subscription_plans table exists
    const { data, error } = await supabase
      .from('subscription_plans')
      .select('count')
      .limit(1);

    if (error) {
      console.error("Database error:", error);
      return NextResponse.json({ 
        error: "Database error", 
        details: error.message,
        code: error.code 
      }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      message: "Database connection successful",
      tableExists: true 
    });

  } catch (error) {
    console.error("Test error:", error);
    return NextResponse.json({ 
      error: "Test failed", 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}
