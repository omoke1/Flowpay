// Transfer Refund API Route
// Handles refunding expired transfers

import { NextRequest, NextResponse } from "next/server";
import { transferService } from "@/lib/transfer-service";

export async function POST(request: NextRequest) {
  try {
    console.log("POST /api/transfers/refund - Refunding expired transfer");

    const body = await request.json();
    const { transferId, senderAddress } = body;

    // Validate required fields
    if (!transferId || !senderAddress) {
      return NextResponse.json(
        { error: "Transfer ID and sender address are required" },
        { status: 400 }
      );
    }

    console.log(`Refunding transfer: ${transferId} for sender: ${senderAddress}`);

    // Refund transfer using TransferService
    const result = await transferService.refundTransfer(transferId, senderAddress);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Failed to refund transfer" },
        { status: 500 }
      );
    }

    console.log(`Transfer refunded successfully: ${transferId}`);

    return NextResponse.json({
      success: true,
      message: "Transfer refunded successfully"
    });

  } catch (error) {
    console.error("Error refunding transfer:", error);
    return NextResponse.json(
      { 
        error: "Internal server error",
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
