import { NextResponse } from "next/server";

export async function GET() {
  try {
    const { supabase } = await import('@/lib/supabase');
    
    if (!supabase) {
      return NextResponse.json({ error: "Supabase client is null" }, { status: 500 });
    }

    // Test if subscription_plans table exists
    const { data, error } = await supabase
      .from('subscription_plans')
      .select('*')
      .limit(1);

    if (error) {
      return NextResponse.json({ 
        error: "subscription_plans table not found or error", 
        details: error.message,
        code: error.code,
        hint: error.hint
      }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      message: "subscription_plans table exists",
      data: data 
    });

  } catch (error) {
    return NextResponse.json({ 
      error: "Test failed", 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}
