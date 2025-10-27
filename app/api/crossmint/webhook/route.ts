import { NextRequest, NextResponse } from "next/server";
import { crossmintService } from "@/lib/crossmint-service";
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    console.log("POST /api/crossmint/webhook - Processing Crossmint webhook");
    
    const body = await request.json();
    const signature = request.headers.get('x-crossmint-signature');
    const webhookSecret = process.env.CROSSMINT_WEBHOOK_SECRET;

    // Verify webhook signature
    if (webhookSecret && signature) {
      const payload = JSON.stringify(body);
      const expectedSignature = crypto
        .createHmac('sha256', webhookSecret)
        .update(payload)
        .digest('hex');

      if (signature !== expectedSignature) {
        console.error('Invalid webhook signature');
        return NextResponse.json(
          { error: 'Invalid signature' },
          { status: 401 }
        );
      }
    }

    console.log(`Processing webhook event: ${body.type}`);

    // Handle the webhook event
    const result = await crossmintService.handleWebhook(body);

    if (!result.success) {
      console.error('Webhook processing failed:', result.error);
      return NextResponse.json(
        { error: result.error || "Webhook processing failed" },
        { status: 500 }
      );
    }

    console.log(`Webhook processed successfully: ${body.type}`);

    return NextResponse.json({
      success: true,
      message: "Webhook processed successfully"
    });

  } catch (error) {
    console.error("Crossmint webhook error:", error);
    
    return NextResponse.json(
      { 
        error: "Internal server error",
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

