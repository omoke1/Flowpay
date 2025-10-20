import { NextRequest, NextResponse } from "next/server";
import { settingsService } from "@/lib/settings-service";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { walletAddress } = body;

    if (!walletAddress) {
      return NextResponse.json(
        { error: "Wallet address required" },
        { status: 400 }
      );
    }

    await settingsService.revokeSessions(walletAddress);
    
    return NextResponse.json({ 
      success: true, 
      message: "All sessions revoked successfully"
    });
  } catch (error) {
    console.error("Error revoking sessions:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

