import { NextRequest, NextResponse } from "next/server";
import { supabase, isDatabaseConfigured, getDatabaseStatus } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  try {
    console.log("Testing database connection...");
    
    // Check if Supabase is configured
    if (!isDatabaseConfigured()) {
      const status = getDatabaseStatus();
      console.log("Database not configured:", status);
      return NextResponse.json({
        success: false,
        error: "Database not configured",
        details: status
      }, { status: 500 });
    }

    // Test basic connection
    const { data, error } = await supabase
      .from("users")
      .select("count")
      .limit(1);

    if (error) {
      console.error("Database test error:", error);
      return NextResponse.json({
        success: false,
        error: "Database connection failed",
        details: error
      }, { status: 500 });
    }

    console.log("Database connection successful");
    return NextResponse.json({
      success: true,
      message: "Database connection successful",
      data: data
    });

  } catch (error) {
    console.error("Database test error:", error);
    return NextResponse.json({
      success: false,
      error: "Database test failed",
      details: error
    }, { status: 500 });
  }
}
