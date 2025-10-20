import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { sendCustomerReceipt, sendMerchantNotification } from "@/lib/resend";
import { WalletService } from "@/lib/wallet-service";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { linkId, payerAddress, amount, token, txHash } = body;

    // Validate required fields
    if (!linkId || !payerAddress || !amount || !token || !txHash) {
      return NextResponse.json(
        { error: "Missing required fields" },
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
    const { data: linkData, error: linkError } = await supabase
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

    // Insert payment record
    const { data: payment, error: paymentError } = await supabase
      .from("payments")
      .insert({
        link_id: linkId,
        payer_address: payerAddress,
        amount: amount.toString(),
        token,
        tx_hash: txHash,
        status: "completed",
      })
      .select()
      .single();

    if (paymentError) {
      console.error("Supabase error:", paymentError);
      return NextResponse.json(
        { error: "Failed to record payment" },
        { status: 500 }
      );
    }

    // Send email notifications
    try {
      const receiptData = {
        productName: linkData.product_name,
        amount: amount.toString(),
        token,
        txHash,
        recipientAddress: linkData.users?.wallet_address || "",
        merchantEmail: linkData.users?.email,
      };

      await Promise.all([
        sendMerchantNotification(receiptData),
        // Customer email would need their email address
      ]);
    } catch (emailError) {
      console.error("Email error:", emailError);
      // Don't fail the payment if email fails
    }

    return NextResponse.json({
      success: true,
      payment,
      redirectUrl: linkData.redirect_url,
    });
  } catch (error) {
    console.error("Error processing payment:", error);
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

    if (!merchantId) {
      return NextResponse.json(
        { error: "Merchant ID required" },
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

    // Use WalletService to get user
            const userData = await WalletService.getUserByWalletAddress(merchantId);
            if (!userData) {
              return NextResponse.json(
                { error: "User not found" },
                { status: 404 }
              );
            }

    // Fetch payments for merchant
    const { data, error } = await supabase
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
      console.error("Supabase error:", error);
      return NextResponse.json(
        { error: "Failed to fetch payments" },
        { status: 500 }
      );
    }

    return NextResponse.json({ payments: data });
  } catch (error) {
    console.error("Error fetching payments:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

