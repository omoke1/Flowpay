import { NextResponse } from "next/server";

export async function GET() {
  try {
    console.log("Testing Supabase connection...");
    
    // Test 1: Import supabase
    const { supabase } = await import('@/lib/supabase');
    console.log("Supabase imported:", !!supabase);
    
    if (!supabase) {
      return NextResponse.json({ error: "Supabase client is null" }, { status: 500 });
    }

    // Test 2: Try a simple query to a table that should exist
    const { data, error } = await supabase
      .from('users')
      .select('count')
      .limit(1);

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json({ 
        error: "Supabase query failed", 
        details: error.message,
        code: error.code 
      }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      message: "Supabase connection working",
      data: data 
    });

  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json({ 
      error: "Connection test failed", 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}
