// Transfer API Routes
// Handles creating, listing, and managing P2P transfers

import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { transferService } from "@/lib/transfer-service";
import { SimpleUserService } from "@/lib/simple-user-service";

// POST: Create new transfer
export async function POST(request: NextRequest) {
  try {
    console.log("POST /api/transfers - Creating new transfer");

    const body = await request.json();
    const { 
      recipientEmail, 
      amount, 
      token, 
      note, 
      sendEmail = false 
    } = body;

    // Validate required fields
    if (!amount || !token) {
      return NextResponse.json(
        { error: "Amount and token are required" },
        { status: 400 }
      );
    }

    if (amount <= 0) {
      return NextResponse.json(
        { error: "Amount must be greater than 0" },
        { status: 400 }
      );
    }

    if (!['FLOW', 'USDC'].includes(token)) {
      return NextResponse.json(
        { error: "Token must be FLOW or USDC" },
        { status: 400 }
      );
    }

    // Get sender information from request headers or session
    // For now, we'll use a placeholder - in production, this would come from auth
    const senderAddress = request.headers.get('x-sender-address');
    const senderId = request.headers.get('x-sender-id');

    if (!senderAddress || !senderId) {
      return NextResponse.json(
        { error: "Sender authentication required" },
        { status: 401 }
      );
    }

    // Check if Supabase is configured
    if (!supabase) {
      return NextResponse.json(
        { error: "Database not configured" },
        { status: 500 }
      );
    }

    console.log(`Creating transfer: ${amount} ${token} from ${senderAddress}`);

    // Create transfer using TransferService
    const result = await transferService.createTransfer({
      senderId,
      senderAddress,
      recipientEmail,
      amount: parseFloat(amount),
      token,
      note,
      sendEmail
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Failed to create transfer" },
        { status: 500 }
      );
    }

    console.log(`Transfer created successfully: ${result.transfer?.id}`);

    return NextResponse.json({
      success: true,
      transfer: result.transfer,
      message: "Transfer created successfully"
    });

  } catch (error) {
    console.error("Error creating transfer:", error);
    return NextResponse.json(
      { 
        error: "Internal server error",
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// GET: List user's transfers
export async function GET(request: NextRequest) {
  try {
    console.log("GET /api/transfers - Listing user transfers");

    const { searchParams } = new URL(request.url);
    const senderId = searchParams.get('senderId');

    if (!senderId) {
      return NextResponse.json(
        { error: "Sender ID is required" },
        { status: 400 }
      );
    }

    // Check if Supabase is configured
    if (!supabase) {
      return NextResponse.json(
        { error: "Database not configured" },
        { status: 500 }
      );
    }

    console.log(`Getting transfers for sender: ${senderId}`);

    // Get transfers using TransferService
    const result = await transferService.getTransfersBySender(senderId);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Failed to get transfers" },
        { status: 500 }
      );
    }

    console.log(`Found ${result.transfers?.length || 0} transfers`);

    return NextResponse.json({
      success: true,
      transfers: result.transfers || [],
      count: result.transfers?.length || 0
    });

  } catch (error) {
    console.error("Error getting transfers:", error);
    return NextResponse.json(
      { 
        error: "Internal server error",
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
