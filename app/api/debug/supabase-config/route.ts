import { NextRequest, NextResponse } from "next/server";
import { isDatabaseConfigured, getDatabaseStatus } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  try {
    const status = getDatabaseStatus();
    const isConfigured = isDatabaseConfigured();
    
    return NextResponse.json({
      configured: isConfigured,
      status: status,
      environment: {
        NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ? "Set" : "Missing",
        NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "Set" : "Missing",
        SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY ? "Set" : "Missing"
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error("Error checking Supabase configuration:", error);
    return NextResponse.json(
      { 
        error: "Failed to check configuration",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}
