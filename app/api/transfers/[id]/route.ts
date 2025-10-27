// Transfer Details API Route
// Handles getting transfer details by claim token (public endpoint)

import { NextRequest, NextResponse } from "next/server";
import { transferService } from "@/lib/transfer-service";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    console.log(`GET /api/transfers/${id} - Getting transfer details`);

    // Validate claim token format
    if (!id || id.length < 10) {
      return NextResponse.json(
        { error: "Invalid claim token" },
        { status: 400 }
      );
    }

    console.log(`Getting transfer details for claim token: ${id}`);

    // Get transfer details using TransferService
    const result = await transferService.getTransferDetails(id);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Transfer not found" },
        { status: 404 }
      );
    }

    // Return transfer details (public information only)
    const transfer = result.transfer!;
    const publicTransfer = {
      id: transfer.id,
      sender_address: transfer.sender_address,
      recipient_email: transfer.recipient_email,
      amount: transfer.amount,
      token: transfer.token,
      note: transfer.note,
      status: transfer.status,
      expires_at: transfer.expires_at,
      created_at: transfer.created_at,
      claimed_at: transfer.claimed_at,
      claimed_by_address: transfer.claimed_by_address
    };

    console.log(`Transfer details retrieved: ${transfer.id}`);

    return NextResponse.json({
      success: true,
      transfer: publicTransfer
    });

  } catch (error) {
    console.error("Error getting transfer details:", error);
    return NextResponse.json(
      { 
        error: "Internal server error",
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
