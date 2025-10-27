import { NextRequest, NextResponse } from "next/server";
import { crossmintService } from "@/lib/crossmint-service";

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

    console.log(`Getting payment methods for payment link: ${paymentLinkId}`);

    const methods = await crossmintService.getPaymentMethods(paymentLinkId);

    return NextResponse.json({
      success: true,
      methods,
      count: methods.length
    });

  } catch (error) {
    console.error("Get payment methods error:", error);
    
    return NextResponse.json(
      { 
        error: "Internal server error",
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    console.log("PUT /api/crossmint/payment-methods - Updating payment methods");
    
    const body = await request.json();
    const { paymentLinkId, methods } = body;

    // Validate input
    if (!paymentLinkId || !methods) {
      return NextResponse.json(
        { error: "Payment link ID and methods are required" },
        { status: 400 }
      );
    }

    // Validate methods object
    const validMethods = ['crypto', 'fiat', 'apple_pay', 'google_pay'];
    const methodKeys = Object.keys(methods);
    const invalidMethods = methodKeys.filter(key => !validMethods.includes(key));
    
    if (invalidMethods.length > 0) {
      return NextResponse.json(
        { error: `Invalid payment methods: ${invalidMethods.join(', ')}` },
        { status: 400 }
      );
    }

    console.log(`Updating payment methods for payment link: ${paymentLinkId}`, methods);

    const result = await crossmintService.updatePaymentMethods(paymentLinkId, methods);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Failed to update payment methods" },
        { status: 500 }
      );
    }

    console.log(`Payment methods updated successfully for payment link: ${paymentLinkId}`);

    return NextResponse.json({
      success: true,
      message: "Payment methods updated successfully"
    });

  } catch (error) {
    console.error("Update payment methods error:", error);
    
    return NextResponse.json(
      { 
        error: "Internal server error",
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

