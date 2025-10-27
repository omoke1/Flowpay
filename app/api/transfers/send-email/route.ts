// Send Email API Route
// Handles sending claim emails for transfers

import { NextRequest, NextResponse } from "next/server";
import { transferService } from "@/lib/transfer-service";

export async function POST(request: NextRequest) {
  try {
    console.log("POST /api/transfers/send-email - Sending claim email");

    const body = await request.json();
    const { transferId, recipientEmail } = body;

    // Validate required fields
    if (!transferId || !recipientEmail) {
      return NextResponse.json(
        { error: "Transfer ID and recipient email are required" },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(recipientEmail)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    console.log(`Sending claim email for transfer: ${transferId} to ${recipientEmail}`);

    // Get transfer details first
    const transferResult = await transferService.getTransferDetails(transferId);
    
    if (!transferResult.success || !transferResult.transfer) {
      return NextResponse.json(
        { error: "Transfer not found" },
        { status: 404 }
      );
    }

    const transfer = transferResult.transfer;

    // Check if transfer is still pending
    if (transfer.status !== 'pending') {
      return NextResponse.json(
        { error: `Transfer has already been ${transfer.status}` },
        { status: 400 }
      );
    }

    // Check if transfer has expired
    const expiresAt = new Date(transfer.expires_at).getTime();
    const now = Date.now();
    
    if (now >= expiresAt) {
      return NextResponse.json(
        { error: "Transfer has expired" },
        { status: 400 }
      );
    }

    // Send email using EmailService
    const { EmailService } = await import("@/lib/email-service");
    const emailService = new EmailService();

    const emailResult = await emailService.sendClaimEmail({
      recipientEmail,
      senderAddress: transfer.sender_address,
      amount: transfer.amount,
      token: transfer.token,
      note: transfer.note,
      claimLink: transfer.claim_link,
      expiresAt: new Date(transfer.expires_at)
    });

    if (!emailResult.success) {
      return NextResponse.json(
        { error: emailResult.error || "Failed to send email" },
        { status: 500 }
      );
    }

    console.log(`Claim email sent successfully to: ${recipientEmail}`);

    return NextResponse.json({
      success: true,
      message: "Claim email sent successfully"
    });

  } catch (error) {
    console.error("Error sending claim email:", error);
    return NextResponse.json(
      { 
        error: "Internal server error",
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
