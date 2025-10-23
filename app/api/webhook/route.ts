// Main webhook endpoint for external integrations
import { NextRequest, NextResponse } from "next/server";
import { webhookDeliveryService } from "@/lib/webhook-delivery";
import { realSettingsService } from "@/lib/real-settings-service";
import { logError, logInfo } from "@/lib/error-logging";

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('x-webhook-signature') || '';
    const eventType = request.headers.get('x-webhook-event') || '';
    const webhookId = request.headers.get('x-webhook-id') || '';

    // Parse the webhook payload
    const payload = JSON.parse(body);

    // Verify webhook signature (this would be your secret key)
    const webhookSecret = process.env.WEBHOOK_SECRET || 'your-webhook-secret';
    
    if (!webhookDeliveryService.verifyWebhookSignature(body, signature, webhookSecret)) {
      logError("Invalid webhook signature", new Error("Signature verification failed"), {
        webhookId,
        eventType,
        signature: signature.substring(0, 10) + '...',
      });
      
      return NextResponse.json(
        { error: "Invalid webhook signature" },
        { status: 401 }
      );
    }

    logInfo("Webhook received", {
      webhookId,
      eventType,
      payload: JSON.stringify(payload).substring(0, 200) + '...',
    });

    // Handle different webhook events
    switch (eventType) {
      case 'payment.completed':
        await handlePaymentCompleted(payload);
        break;
      case 'payment_link.created':
        await handlePaymentLinkCreated(payload);
        break;
      case 'payment_link.updated':
        await handlePaymentLinkUpdated(payload);
        break;
      case 'payment_link.deleted':
        await handlePaymentLinkDeleted(payload);
        break;
      default:
        logError("Unknown webhook event type", new Error(`Unknown event: ${eventType}`), {
          webhookId,
          eventType,
        });
        return NextResponse.json(
          { error: "Unknown event type" },
          { status: 400 }
        );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    logError("Webhook processing failed", error as Error, {
      endpoint: '/api/webhook',
      method: 'POST',
    });
    
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Handle payment completed webhook
async function handlePaymentCompleted(payload: any) {
  try {
    const { payment, merchant } = payload.data;
    
    // Here you would implement your business logic for payment completion
    // For example: update inventory, send notifications, etc.
    
    logInfo("Payment completed webhook processed", {
      paymentId: payment.id,
      merchantId: merchant?.id,
      amount: payment.amount,
    });
  } catch (error) {
    logError("Failed to process payment completed webhook", error as Error, {
      payload: JSON.stringify(payload).substring(0, 200),
    });
  }
}

// Handle payment link created webhook
async function handlePaymentLinkCreated(payload: any) {
  try {
    const { payment_link } = payload.data;
    
    logInfo("Payment link created webhook processed", {
      linkId: payment_link.id,
      productName: payment_link.product_name,
    });
  } catch (error) {
    logError("Failed to process payment link created webhook", error as Error, {
      payload: JSON.stringify(payload).substring(0, 200),
    });
  }
}

// Handle payment link updated webhook
async function handlePaymentLinkUpdated(payload: any) {
  try {
    const { payment_link } = payload.data;
    
    logInfo("Payment link updated webhook processed", {
      linkId: payment_link.id,
      productName: payment_link.product_name,
    });
  } catch (error) {
    logError("Failed to process payment link updated webhook", error as Error, {
      payload: JSON.stringify(payload).substring(0, 200),
    });
  }
}

// Handle payment link deleted webhook
async function handlePaymentLinkDeleted(payload: any) {
  try {
    const { payment_link } = payload.data;
    
    logInfo("Payment link deleted webhook processed", {
      linkId: payment_link.id,
      productName: payment_link.product_name,
    });
  } catch (error) {
    logError("Failed to process payment link deleted webhook", error as Error, {
      payload: JSON.stringify(payload).substring(0, 200),
    });
  }
}


