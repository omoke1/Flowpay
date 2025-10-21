import { NextRequest, NextResponse } from "next/server";
import { supabase, isDatabaseConfigured, getDatabaseStatus } from "@/lib/supabase";
import { WalletService } from "@/lib/wallet-service";
import { checkRateLimit } from "@/lib/rate-limit";
import { validateRequestBody, paymentLinkSchema } from "@/lib/validation";

export async function POST(request: NextRequest) {
  try {
    // Rate limiting check
    const rateLimitResult = await checkRateLimit(request, "paymentLinks");
    if (!rateLimitResult.success) {
      return NextResponse.json(
        {
          error: "Rate limit exceeded",
          limit: rateLimitResult.limit,
          remaining: rateLimitResult.remaining,
          reset: rateLimitResult.reset,
        },
        { 
          status: 429,
          headers: {
            "X-RateLimit-Limit": rateLimitResult.limit.toString(),
            "X-RateLimit-Remaining": rateLimitResult.remaining.toString(),
            "X-RateLimit-Reset": rateLimitResult.reset.toISOString(),
          }
        }
      );
    }

    const body = await request.json();
    
    // Validate and sanitize input
    const validation = validateRequestBody(body, paymentLinkSchema);
    if (!validation.success) {
      return NextResponse.json(
        { 
          error: "Invalid input data", 
          details: validation.details 
        },
        { status: 400 }
      );
    }

    const { 
      merchantId, 
      productName, 
      description, 
      amount, 
      token, 
      redirectUrl,
      acceptCrypto,
      acceptFiat
    } = validation.data;

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
          required: "Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in Vercel environment variables"
        },
        { status: 500 }
      );
    }

    // Use WalletService to get or create user by wallet address
    // Both managed and external wallets now have real Flow addresses
    const userData = await WalletService.getOrCreateUser(merchantId);
    if (!userData) {
      return NextResponse.json(
        { error: "Failed to get or create user" },
        { status: 500 }
      );
    }

    // Insert payment link into Supabase
    const { data, error } = await supabase
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
      checkoutUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/pay/${data.id}`,
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
    const { data: user, error: userError } = await supabase
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
    const { data, error } = await supabase
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
      console.log("GET /api/payment-links - Database not configured:", status);
      return NextResponse.json(
        { 
          error: "Database not configured", 
          details: status.error,
          required: "Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in Vercel environment variables"
        },
        { status: 500 }
      );
    }

    console.log("GET /api/payment-links - Looking up user for merchantId:", merchantId);
    
    // Use WalletService to get user by wallet address
    // Both managed and external wallets now have real Flow addresses
    const userData = await WalletService.getUserByWalletAddress(merchantId);
    console.log("GET /api/payment-links - User data:", userData ? "Found" : "Not found");
    
    if (!userData) {
      console.log("GET /api/payment-links - User not found for merchantId:", merchantId);
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    console.log("GET /api/payment-links - Fetching payment links for user ID:", userData.id);

    // Fetch payment links for merchant
    const { data, error } = await supabase
      .from("payment_links")
      .select("*")
      .eq("merchant_id", userData.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("GET /api/payment-links - Supabase error:", error);
      return NextResponse.json(
        { error: "Failed to fetch payment links" },
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

