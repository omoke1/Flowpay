import { NextResponse } from "next/server";

export async function GET() {
  try {
    console.log("=== DEBUG: Subscription API Test ===");
    
    // Test 1: Check if we can import supabase
    let supabase;
    try {
      const { supabase: supabaseClient } = await import('@/lib/supabase');
      supabase = supabaseClient;
      console.log("✅ Supabase imported successfully");
    } catch (error) {
      console.error("❌ Failed to import supabase:", error);
      return NextResponse.json({ 
        error: "Failed to import supabase", 
        details: error instanceof Error ? error.message : 'Unknown error' 
      }, { status: 500 });
    }

    // Test 2: Check if supabase client exists
    if (!supabase) {
      console.error("❌ Supabase client is null");
      return NextResponse.json({ error: "Supabase client is null" }, { status: 500 });
    }
    console.log("✅ Supabase client exists");

    // Test 3: Try to query subscription_plans table
    try {
      const { data, error } = await supabase
        .from('subscription_plans')
        .select('*')
        .limit(1);

      if (error) {
        console.error("❌ Database query error:", error);
        return NextResponse.json({ 
          error: "Database query failed", 
          details: error.message,
          code: error.code,
          hint: error.hint
        }, { status: 500 });
      }

      console.log("✅ Database query successful, data:", data);
      return NextResponse.json({ 
        success: true, 
        message: "All tests passed",
        data: data,
        tableExists: true
      });

    } catch (queryError) {
      console.error("❌ Query execution error:", queryError);
      return NextResponse.json({ 
        error: "Query execution failed", 
        details: queryError instanceof Error ? queryError.message : 'Unknown error' 
      }, { status: 500 });
    }

  } catch (error) {
    console.error("❌ General error:", error);
    return NextResponse.json({ 
      error: "General error", 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}
