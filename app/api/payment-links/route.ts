import { NextRequest, NextResponse } from "next/server";
import { supabase, isDatabaseConfigured, getDatabaseStatus } from "@/lib/supabase";
import { SimpleUserService } from "@/lib/simple-user-service";

export async function POST(request: NextRequest) {
  try {
    console.log("POST /api/payment-links - Starting payment link creation - v2");
    
    const body = await request.json();
    
    // Basic validation without external dependencies
    const { 
      merchantId, 
      productName, 
      description, 
      amount, 
      token, 
      redirectUrl,
      acceptCrypto,
      acceptFiat
    } = body;

    // Basic validation
    if (!merchantId || !productName || !amount || !token) {
      return NextResponse.json(
        { error: "Missing required fields: merchantId, productName, amount, token" },
        { status: 400 }
      );
    }

    // Validate at least one payment method is enabled
    if (!acceptCrypto && !acceptFiat) {
      return NextResponse.json(
        { error: "At least one payment method must be enabled" },
        { status: 400 }
      );
    }

    // Check if Supabase is configured
    if (!isDatabaseConfigured()) {
      const status = getDatabaseStatus();
      console.error("Database configuration error:", status);
      return NextResponse.json(
        { 
          error: "Database not configured", 
          details: status.error,
          required: "Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in Vercel environment variables",
          environment: {
            NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ? "Set" : "Missing",
            NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "Set" : "Missing"
          }
        },
        { status: 500 }
      );
    }

    // Use SimpleUserService to get or create user by wallet address
    const userData = await SimpleUserService.getOrCreateUser(merchantId);
    if (!userData) {
      return NextResponse.json(
        { error: "Failed to get or create user" },
        { status: 500 }
      );
    }

    // Insert payment link into Supabase
    const supabaseClient = supabase!; // We know supabase is not null due to the check above
    const { data, error } = await supabaseClient
      .from("payment_links")
      .insert({
        merchant_id: userData.id,
        product_name: productName,
        description: description || null,
        amount: amount.toString(),
        token,
        redirect_url: redirectUrl || null,
        status: "active",
        accept_crypto: acceptCrypto,
        accept_fiat: acceptFiat,
      })
      .select()
      .single();

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json(
        { error: "Failed to create payment link" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      paymentLink: data,
      checkoutUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'https://useflopay.xyz'}/pay/${data.id}`,
    });
  } catch (error) {
    console.error("Error creating payment link:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const merchantId = searchParams.get('merchantId');

    if (!merchantId) {
      return NextResponse.json(
        { error: "Merchant ID is required" },
        { status: 400 }
      );
    }

    // Check if Supabase is configured
    if (!isDatabaseConfigured()) {
      const status = getDatabaseStatus();
      console.error("Database configuration error:", status);
      return NextResponse.json(
        { 
          error: "Database not configured", 
          details: status.error,
          required: "Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in Vercel environment variables"
        },
        { status: 500 }
      );
    }

    // Get the user record by wallet address
    // Both managed and external wallets now have real Flow addresses
    const supabaseClient = supabase!; // We know supabase is not null due to the check above
    const { data: user, error: userError } = await supabaseClient
      .from("users")
      .select("id")
      .eq("wallet_address", merchantId)
      .single();

    if (userError || !user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Delete all payment links for this merchant
    const { data, error } = await supabaseClient
      .from("payment_links")
      .delete()
      .eq("merchant_id", user.id)
      .select();

    if (error) {
      console.error("Supabase error deleting payment links:", error);
      return NextResponse.json(
        { error: `Failed to delete payment links: ${error.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      message: `Deleted ${data?.length || 0} payment links successfully`,
      deletedCount: data?.length || 0
    });
  } catch (error) {
    console.error("Error deleting payment links:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const merchantId = searchParams.get("merchantId");

    console.log("GET /api/payment-links - merchantId:", merchantId);

    if (!merchantId) {
      console.log("GET /api/payment-links - Missing merchantId");
      return NextResponse.json(
        { error: "Merchant ID required" },
        { status: 400 }
      );
    }

    // Check if Supabase is configured
    if (!isDatabaseConfigured()) {
      const status = getDatabaseStatus();
      console.log("GET /api/payment-links - Database not configured, returning empty data:", status);
      // Return empty data instead of error for development
      return NextResponse.json({ 
        paymentLinks: [],
        message: "Database not configured - using mock data for development"
      });
    }

    console.log("GET /api/payment-links - Looking up user for merchantId:", merchantId);
    console.log("GET /api/payment-links - MerchantId type:", typeof merchantId);
    console.log("GET /api/payment-links - MerchantId length:", merchantId?.length);
    
    // Use SimpleUserService to get or create user by wallet address
    let userData;
    try {
      userData = await SimpleUserService.getOrCreateUser(merchantId);
      console.log("GET /api/payment-links - User data:", userData ? "Found/Created" : "Not found");
      if (userData) {
        console.log("GET /api/payment-links - User ID:", userData.id);
        console.log("GET /api/payment-links - User wallet address:", userData.wallet_address);
      }
    } catch (userError) {
      console.error("GET /api/payment-links - Error looking up/creating user:", userError);
      return NextResponse.json(
        { error: "Failed to lookup/create user", details: userError instanceof Error ? userError.message : "Unknown error" },
        { status: 500 }
      );
    }
    
    if (!userData) {
      console.log("GET /api/payment-links - Failed to create user for merchantId:", merchantId);
      return NextResponse.json(
        { error: "Failed to create user" },
        { status: 500 }
      );
    }

    console.log("GET /api/payment-links - Fetching payment links for user ID:", userData.id);

    // Fetch payment links for merchant
    const supabaseClient = supabase!; // We know supabase is not null due to the check above
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
      console.error("GET /api/payment-links - Query error:", queryError);
      return NextResponse.json(
        { error: "Database query failed", details: queryError instanceof Error ? queryError.message : "Unknown error" },
        { status: 500 }
      );
    }

    if (error) {
      console.error("GET /api/payment-links - Supabase error:", error);
      return NextResponse.json(
        { error: "Failed to fetch payment links", details: error.message },
        { status: 500 }
      );
    }

    console.log("GET /api/payment-links - Success, found", data?.length || 0, "payment links");
    return NextResponse.json({ paymentLinks: data });
  } catch (error) {
    console.error("GET /api/payment-links - Error fetching payment links:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

