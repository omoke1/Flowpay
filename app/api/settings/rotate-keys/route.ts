import { NextRequest, NextResponse } from "next/server";
import { realSettingsService } from "@/lib/real-settings-service";

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

    const { publicKey, secretKey } = await realSettingsService.rotateApiKeys(walletAddress);
    
    return NextResponse.json({ 
      success: true, 
      publicKey,
      secretKey,
      message: "API keys rotated successfully"
    });
  } catch (error) {
    console.error("Error rotating API keys:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

