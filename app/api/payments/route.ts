import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { sendCustomerReceipt, sendMerchantNotification } from "@/lib/resend";
import { WalletService } from "@/lib/wallet-service";
import { verifyTransaction } from "@/lib/flow-transactions";
import { checkRateLimit } from "@/lib/rate-limit";
import { validateRequestBody, paymentSchema } from "@/lib/validation";
import { logError, logInfo, logTransactionVerification, logSecurityEvent } from "@/lib/error-logging";

export async function POST(request: NextRequest) {
  try {
    // Rate limiting check
    const rateLimitResult = await checkRateLimit(request, "payments");
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
    const validation = validateRequestBody(body, paymentSchema);
    if (!validation.success) {
      return NextResponse.json(
        { 
          error: "Invalid input data", 
          details: validation.details 
        },
        { status: 400 }
      );
    }

    const { linkId, payerAddress, amount, token, txHash } = validation.data;

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

    // CRITICAL SECURITY: Verify transaction on-chain
    const verification = await verifyTransaction(
      txHash,
      amount.toString(),
      linkData.users?.wallet_address || "",
      token as 'FLOW' | 'USDC'
    );

    if (!verification.isValid) {
      logTransactionVerification(txHash, false, {
        error: verification.error,
        expectedAmount: amount.toString(),
        expectedRecipient: linkData.users?.wallet_address,
        token
      });
      
      logSecurityEvent('Transaction verification failed', 'high', {
        txHash,
        linkId,
        payerAddress,
        amount,
        token
      });
      
      return NextResponse.json(
        { 
          error: "Transaction verification failed", 
          details: verification.error 
        },
        { status: 400 }
      );
    }

    // Log successful verification
    logTransactionVerification(txHash, true, {
      expectedAmount: amount.toString(),
      actualAmount: verification.actualAmount,
      expectedRecipient: linkData.users?.wallet_address,
      actualRecipient: verification.actualRecipient,
      token
    });

    // Additional security: Verify amount matches payment link
    if (parseFloat(verification.actualAmount || "0") !== parseFloat(linkData.amount)) {
      logSecurityEvent('Amount mismatch detected', 'high', {
        txHash,
        linkId,
        expectedAmount: linkData.amount,
        actualAmount: verification.actualAmount,
        payerAddress
      });
      
      return NextResponse.json(
        { 
          error: "Transaction amount does not match payment link amount",
          expected: linkData.amount,
          actual: verification.actualAmount
        },
        { status: 400 }
      );
    }

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
      })
      .select()
      .single();

    if (paymentError) {
      logError("Failed to record payment in database", paymentError, {
        linkId,
        payerAddress,
        amount,
        token,
        txHash
      });
      return NextResponse.json(
        { error: "Failed to record payment" },
        { status: 500 }
      );
    }

    // Log successful payment
    logInfo("Payment recorded successfully", {
      paymentId: payment.id,
      linkId,
      payerAddress,
      amount,
      token,
      txHash
    });

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
      logError("Failed to send email notifications", emailError as Error, {
        paymentId: payment.id,
        linkId,
        merchantEmail: linkData.users?.email
      });
      // Don't fail the payment if email fails
    }

    return NextResponse.json({
      success: true,
      payment,
      redirectUrl: linkData.redirect_url,
    });
  } catch (error) {
    logError("Unexpected error in payment processing", error as Error, {
      endpoint: '/api/payments',
      method: 'POST'
    });
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Rate limiting check
    const rateLimitResult = await checkRateLimit(request, "general");
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
    const supabaseClient = supabase!; // We know supabase is not null due to the check above
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

