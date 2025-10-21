import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    // Check environment variables
    const envCheck = {
      supabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      supabaseAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      walletConnectProjectId: !!process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID,
      appUrl: !!process.env.NEXT_PUBLIC_APP_URL,
      nodeEnv: process.env.NODE_ENV,
    };

    // Check if environment variables are set (but don't expose values)
    const envValues = {
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ? "SET" : "NOT SET",
      supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "SET" : "NOT SET",
      walletConnectProjectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ? "SET" : "NOT SET",
      appUrl: process.env.NEXT_PUBLIC_APP_URL || "NOT SET",
    };

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      environment: {
        checks: envCheck,
        values: envValues,
      },
      message: "Debug information retrieved successfully"
    });

  } catch (error) {
    console.error("Debug API error:", error);
    return NextResponse.json({
      success: false,
      error: "Debug API failed",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}
