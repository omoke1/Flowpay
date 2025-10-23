import { NextRequest, NextResponse } from "next/server";
import { supabase, isDatabaseConfigured, getDatabaseStatus } from "@/lib/supabase";
import { SimpleUserService } from "@/lib/simple-user-service";

export async function POST(request: NextRequest) {
  try {
    console.log("POST /api/payments - Starting payment processing");
    
    const body = await request.json();
    
    // Basic validation
    const { linkId, payerAddress, amount, token, txHash } = body;

    if (!linkId || !payerAddress || !amount || !token || !txHash) {
      return NextResponse.json(
        { error: "Missing required fields: linkId, payerAddress, amount, token, txHash" },
        { status: 400 }
      );
    }

    // Check if Supabase is configured
    if (!supabase) {
      return NextResponse.json(
        { error: "Database not configured. Please set up Supabase." },
        { status: 500 }
      );
    }

    // Get payment link details
    const supabaseClient = supabase!; // We know supabase is not null due to the check above
    const { data: linkData, error: linkError } = await supabaseClient
      .from("payment_links")
      .select("*, users!payment_links_merchant_id_fkey(wallet_address, email)")
      .eq("id", linkId)
      .single();

    if (linkError || !linkData) {
      return NextResponse.json(
        { error: "Payment link not found" },
        { status: 404 }
      );
    }

    // Simplified transaction verification for development
    console.log("Processing payment:", {
      txHash,
      amount,
      merchantAddress: linkData.users?.wallet_address,
      token
    });

    // Skip complex verification for now - just log the transaction
    console.log("Payment verification skipped for development");

    // Insert payment record
    const { data: payment, error: paymentError } = await supabaseClient
      .from("payments")
      .insert({
        link_id: linkId,
        payer_address: payerAddress,
        amount: amount.toString(),
        token,
        tx_hash: txHash,
        status: "completed",
        paid_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (paymentError) {
      console.error("Failed to record payment in database:", paymentError);
      return NextResponse.json(
        { error: "Failed to record payment" },
        { status: 500 }
      );
    }

    console.log("Payment recorded successfully:", {
      paymentId: payment.id,
      linkId,
      payerAddress,
      amount,
      token,
      txHash
    });

    return NextResponse.json({
      success: true,
      payment,
      redirectUrl: linkData.redirect_url,
    });
  } catch (error) {
    console.error("POST /api/payments - Error processing payment:", error);
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

    console.log("GET /api/payments - merchantId:", merchantId);

    if (!merchantId) {
      return NextResponse.json(
        { error: "Merchant ID required" },
        { status: 400 }
      );
    }

    // Check if Supabase is configured
    if (!isDatabaseConfigured()) {
      const status = getDatabaseStatus();
      console.log("GET /api/payments - Database not configured:", status);
      return NextResponse.json(
        { 
          error: "Database not configured", 
          details: status.error,
          required: "Please configure Supabase environment variables"
        },
        { status: 500 }
      );
    }

    // Use SimpleUserService to get user
    const userData = await SimpleUserService.getUserByWalletAddress(merchantId);
    if (!userData) {
      console.log("GET /api/payments - User not found for merchantId:", merchantId);
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Fetch payments for merchant
    const supabaseClient = supabase!;
    console.log("GET /api/payments - Fetching payments for user ID:", userData.id);
    
    const { data, error } = await supabaseClient
      .from("payments")
      .select(`
        *,
        payment_links!payments_link_id_fkey(product_name, merchant_id)
      `)
      .eq("payment_links.merchant_id", userData.id)
      .eq("status", "completed")
      .order("paid_at", { ascending: false })
      .limit(50);

    if (error) {
      console.error("GET /api/payments - Supabase error:", error);
      return NextResponse.json(
        { error: "Failed to fetch payments", details: error.message },
        { status: 500 }
      );
    }

    console.log("GET /api/payments - Success, found", data ? data.length : 0, "payments");
    return NextResponse.json({ payments: data });
  } catch (error) {
    console.error("GET /api/payments - Error fetching payments:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

