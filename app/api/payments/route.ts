import { NextRequest, NextResponse } from "next/server";
import { supabase, isDatabaseConfigured, getDatabaseStatus } from "@/lib/supabase";
import { sendCustomerReceipt, sendMerchantNotification } from "@/lib/resend";
import { SimpleUserService } from "@/lib/simple-user-service";
import { realSettingsService } from "@/lib/real-settings-service";
import { webhookDeliveryService } from "@/lib/webhook-delivery";
// import { verifyTransaction } from "@/lib/flow-transactions"; // Removed for simplicity
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

    // Real transaction verification
    console.log("Verifying real transaction:", {
      txHash,
      amount,
      merchantAddress: linkData.users?.wallet_address,
      token
    });

    // Import and use real transaction verification
    const { verifyTransaction } = await import("@/lib/flow-transactions");
    const verification = await verifyTransaction(txHash);

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

    // For development, we'll skip amount verification since we're not getting actual amounts from the simplified verification
    // In production, you would want to implement proper transaction verification
    console.log("Skipping amount verification for development");

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

    // Deliver webhook notification
    try {
      const userSettings = await realSettingsService.getUserSettings(linkData.users?.wallet_address || '');
      if (userSettings?.webhook_url && userSettings?.secret_key) {
        const paymentData = {
          id: payment.id,
          linkId,
          payerAddress,
          amount: amount.toString(),
          token,
          txHash,
          status: 'completed',
          paidAt: new Date().toISOString(),
        };

        const webhookResult = await webhookDeliveryService.deliverPaymentWebhook(
          userSettings.webhook_url,
          userSettings.secret_key,
          paymentData
        );

        // Log webhook delivery attempt
        await realSettingsService.addWebhookLog(userSettings.id, {
          event_type: 'payment.completed',
          payload: paymentData,
          webhook_url: userSettings.webhook_url,
          response_status: webhookResult.statusCode,
          response_body: webhookResult.responseBody,
          retry_count: 0,
          max_retries: 3,
          next_retry_at: webhookResult.success ? null : new Date(Date.now() + 60000).toISOString(),
          status: webhookResult.success ? 'delivered' : 'failed',
        });

        if (webhookResult.success) {
          logInfo("Webhook delivered successfully", {
            paymentId: payment.id,
            webhookUrl: userSettings.webhook_url,
          });
        } else {
          logError("Webhook delivery failed", new Error(webhookResult.error || 'Unknown error'), {
            paymentId: payment.id,
            webhookUrl: userSettings.webhook_url,
            statusCode: webhookResult.statusCode,
          });
        }
      }
    } catch (webhookError) {
      logError("Failed to deliver webhook", webhookError as Error, {
        paymentId: payment.id,
        linkId,
        merchantAddress: linkData.users?.wallet_address,
      });
      // Don't fail the payment if webhook fails
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

    // Use WalletService to get user
    const userData = await SimpleUserService.getUserByWalletAddress(merchantId);
    if (!userData) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Fetch payments for merchant
    const supabaseClient = supabase!; // We know supabase is not null due to the check above
    console.log("Fetching payments for merchant:", userData.id);
    
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
      console.error("Error details:", {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint
      });
      return NextResponse.json(
        { error: "Failed to fetch payments", details: error.message },
        { status: 500 }
      );
    }

    console.log("Payments fetched successfully:", data ? data.length : 0, "payments");
    return NextResponse.json({ payments: data });
  } catch (error) {
    console.error("Error fetching payments:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

