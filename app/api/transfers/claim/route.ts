// Transfer Claim API Route
// Handles claiming transfers by recipients

import { NextRequest, NextResponse } from "next/server";
import { transferService } from "@/lib/transfer-service";

export async function POST(request: NextRequest) {
  try {
    console.log("POST /api/transfers/claim - Claiming transfer");

    const body = await request.json();
    const { 
      claimToken, 
      recipientAddress, 
      payoutMethod = 'crypto',
      recipientEmail 
    } = body;

    // Validate required fields
    if (!claimToken) {
      return NextResponse.json(
        { error: "Claim token is required" },
        { status: 400 }
      );
    }

    if (!['crypto', 'fiat'].includes(payoutMethod)) {
      return NextResponse.json(
        { error: "Payout method must be 'crypto' or 'fiat'" },
        { status: 400 }
      );
    }

    if (payoutMethod === 'crypto' && !recipientAddress) {
      return NextResponse.json(
        { error: "Recipient address is required for crypto payout" },
        { status: 400 }
      );
    }

    if (payoutMethod === 'fiat' && !recipientEmail) {
      return NextResponse.json(
        { error: "Recipient email is required for fiat payout" },
        { status: 400 }
      );
    }

    console.log(`Claiming transfer with token: ${claimToken}, method: ${payoutMethod}`);

    // Claim transfer using TransferService
    const result = await transferService.claimTransfer({
      claimToken,
      recipientAddress,
      payoutMethod,
      recipientEmail
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Failed to claim transfer" },
        { status: 500 }
      );
    }

    console.log(`Transfer claimed successfully: ${result.transfer?.id}`);

    return NextResponse.json({
      success: true,
      transfer: result.transfer,
      message: "Transfer claimed successfully"
    });

  } catch (error) {
    console.error("Error claiming transfer:", error);
    return NextResponse.json(
      { 
        error: "Internal server error",
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
