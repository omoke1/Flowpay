import { NextRequest, NextResponse } from "next/server";
import { supabase, isDatabaseConfigured } from "@/lib/supabase";
import { SimpleUserService } from "@/lib/simple-user-service";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const merchantId = searchParams.get("merchantId");

    console.log("GET /api/payment-links-simple - merchantId:", merchantId);

    if (!merchantId) {
      return NextResponse.json(
        { error: "Merchant ID required" },
        { status: 400 }
      );
    }

    // Check if Supabase is configured
    if (!isDatabaseConfigured()) {
      return NextResponse.json(
        { 
          error: "Database not configured", 
          details: "Supabase environment variables not set"
        },
        { status: 500 }
      );
    }

    console.log("GET /api/payment-links-simple - Looking up user for merchantId:", merchantId);
    
    // Use SimpleUserService to get user by wallet address
    let userData;
    try {
      userData = await SimpleUserService.getUserByWalletAddress(merchantId);
      console.log("GET /api/payment-links-simple - User data:", userData ? "Found" : "Not found");
    } catch (userError) {
      console.error("GET /api/payment-links-simple - Error looking up user:", userError);
      return NextResponse.json(
        { error: "Failed to lookup user", details: userError instanceof Error ? userError.message : "Unknown error" },
        { status: 500 }
      );
    }
    
    if (!userData) {
      console.log("GET /api/payment-links-simple - User not found for merchantId:", merchantId);
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    console.log("GET /api/payment-links-simple - Fetching payment links for user ID:", userData.id);

    // Fetch payment links for merchant
    const supabaseClient = supabase!;
    let data, error;
    try {
      const result = await supabaseClient
        .from("payment_links")
        .select("*")
        .eq("merchant_id", userData.id)
        .order("created_at", { ascending: false });
      
      data = result.data;
      error = result.error;
    } catch (queryError) {
      console.error("GET /api/payment-links-simple - Query error:", queryError);
      return NextResponse.json(
        { error: "Database query failed", details: queryError instanceof Error ? queryError.message : "Unknown error" },
        { status: 500 }
      );
    }

    if (error) {
      console.error("GET /api/payment-links-simple - Supabase error:", error);
      return NextResponse.json(
        { error: "Failed to fetch payment links", details: error.message },
        { status: 500 }
      );
    }

    console.log("GET /api/payment-links-simple - Success, found", data?.length || 0, "payment links");
    return NextResponse.json({ paymentLinks: data });
  } catch (error) {
    console.error("GET /api/payment-links-simple - Error fetching payment links:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
