import { NextRequest, NextResponse } from "next/server";
import { SimpleUserService } from "@/lib/simple-user-service";

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
    const user = await SimpleUserService.getUserByWalletAddress(walletAddress);
    
    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Return user settings (basic user info for now)
    const settings = {
      display_name: user.display_name,
      email: user.email,
      wallet_address: user.wallet_address,
      created_at: user.created_at
    };

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

    // Update user settings using SimpleUserService
    const updatedUser = await SimpleUserService.getOrCreateUser(walletAddress, updates);
    
    if (!updatedUser) {
      return NextResponse.json(
        { error: "Failed to update settings" },
        { status: 500 }
      );
    }

    const settings = {
      display_name: updatedUser.display_name,
      email: updatedUser.email,
      wallet_address: updatedUser.wallet_address,
      created_at: updatedUser.created_at
    };

    return NextResponse.json({ 
      success: true, 
      settings: settings,
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

