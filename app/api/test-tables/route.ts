import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  try {
    if (!supabase) {
      return NextResponse.json(
        { error: "Database not configured" },
        { status: 500 }
      );
    }

    const supabaseClient = supabase!;
    
    // Test if user_settings table exists
    const { data: userSettingsTest, error: userSettingsError } = await supabaseClient
      .from('user_settings')
      .select('id')
      .limit(1);

    // Test if webhook_logs table exists
    const { data: webhookLogsTest, error: webhookLogsError } = await supabaseClient
      .from('webhook_logs')
      .select('id')
      .limit(1);

    // Test if session_tokens table exists
    const { data: sessionTokensTest, error: sessionTokensError } = await supabaseClient
      .from('session_tokens')
      .select('id')
      .limit(1);

    return NextResponse.json({
      tables: {
        user_settings: {
          exists: !userSettingsError,
          error: userSettingsError?.message || null
        },
        webhook_logs: {
          exists: !webhookLogsError,
          error: webhookLogsError?.message || null
        },
        session_tokens: {
          exists: !sessionTokensError,
          error: sessionTokensError?.message || null
        }
      }
    });
  } catch (error) {
    console.error("Error testing tables:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}


