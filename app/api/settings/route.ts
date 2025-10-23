import { NextRequest, NextResponse } from "next/server";
import { realSettingsService } from "@/lib/real-settings-service";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const walletAddress = searchParams.get('walletAddress');

    if (!walletAddress) {
      return NextResponse.json(
        { error: "Wallet address required" },
        { status: 400 }
      );
    }

    console.log("Fetching settings for wallet:", walletAddress);
    const settings = await realSettingsService.getUserSettings(walletAddress);
    console.log("Settings fetched successfully:", settings ? "Found" : "Not found");
    return NextResponse.json({ settings });
  } catch (error) {
    console.error("Error fetching settings:", error);
    console.error("Error details:", {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : 'Unknown'
    });
    return NextResponse.json(
      { error: "Internal server error", details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { walletAddress, updates } = body;

    if (!walletAddress) {
      return NextResponse.json(
        { error: "Wallet address required" },
        { status: 400 }
      );
    }

    const updatedSettings = await realSettingsService.updateUserSettings(walletAddress, updates);
    return NextResponse.json({ 
      success: true, 
      settings: updatedSettings,
      message: "Settings updated successfully"
    });
  } catch (error) {
    console.error("Error updating settings:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

