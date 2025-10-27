import { NextRequest, NextResponse } from "next/server";
import { crossmintService } from "@/lib/crossmint-service";

export async function POST(request: NextRequest) {
  try {
    console.log("POST /api/crossmint/checkout - Creating Crossmint checkout");
    
    let body;
    try {
      body = await request.json();
    } catch (parseError) {
      console.error("JSON parse error:", parseError);
      return NextResponse.json(
        { error: "Invalid JSON in request body" },
        { status: 400 }
      );
    }
    
    const { paymentLinkId, amount, currency = 'USD' } = body;

    // Validate input
    if (!paymentLinkId || !amount) {
      return NextResponse.json(
        { error: "Payment link ID and amount are required" },
        { status: 400 }
      );
    }

    if (amount <= 0) {
      return NextResponse.json(
        { error: "Amount must be greater than 0" },
        { status: 400 }
      );
    }

    console.log(`Creating Crossmint checkout for payment link: ${paymentLinkId}, amount: ${amount} ${currency}`);

    // Create Crossmint checkout
    console.log('Calling crossmintService.createCheckout...');
    const result = await crossmintService.createCheckout(paymentLinkId, amount, currency);
    console.log('Crossmint service result:', result);

    if (!result.success) {
      console.error('Crossmint checkout failed:', result.error);
      return NextResponse.json(
        { error: result.error || "Failed to create checkout" },
        { status: 500 }
      );
    }

    console.log(`Crossmint checkout created successfully: ${result.orderId}`);

    return NextResponse.json({
      success: true,
      checkoutUrl: result.checkoutUrl,
      orderId: result.orderId,
      message: "Checkout created successfully"
    });

  } catch (error) {
    console.error("Crossmint checkout creation error:", error);
    
    return NextResponse.json(
      { 
        error: "Internal server error",
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const paymentLinkId = searchParams.get('paymentLinkId');

    if (!paymentLinkId) {
      return NextResponse.json(
        { error: "Payment link ID is required" },
        { status: 400 }
      );
    }

    console.log(`Getting Crossmint orders for payment link: ${paymentLinkId}`);

    const orders = await crossmintService.getOrders(paymentLinkId);

    return NextResponse.json({
      success: true,
      orders,
      count: orders.length
    });

  } catch (error) {
    console.error("Get Crossmint orders error:", error);
    
    return NextResponse.json(
      { 
        error: "Internal server error",
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
