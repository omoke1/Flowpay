import { NextRequest, NextResponse } from "next/server";
import { SimpleUserService } from "@/lib/simple-user-service";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const address = searchParams.get('address');

    if (!address) {
      return NextResponse.json(
        { error: "Wallet address is required" },
        { status: 400 }
      );
    }

    console.log("GET /api/user/recovery-info - Fetching recovery info for:", address);

    // Get user data to check if they exist and get their email
    const userData = await SimpleUserService.getUserByWalletAddress(address);

    if (!userData) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Check if user has an email (email-registered accounts)
    if (!userData.email) {
      return NextResponse.json({
        success: false,
        message: "Recovery information is not available for this account type.",
        details: "This appears to be a wallet-connected account. Recovery information is managed by your wallet provider.",
        recommendation: "Please check your wallet application for recovery options."
      });
    }

    // Try to decrypt recovery information for email-registered accounts
    try {
      const decryptedRecoveryInfo = await SimpleUserService.getDecryptedRecoveryInfo(address, userData.email);
      
      if (!decryptedRecoveryInfo) {
        return NextResponse.json({
          success: false,
          message: "Recovery information is not available.",
          details: "No encrypted recovery information found for this account. This may be an older account created before encrypted storage was implemented.",
          recommendation: "If you need to recover your wallet, please contact support."
        });
      }

      // Return decrypted recovery information
      const recoveryInfo = {
        address: userData.wallet_address,
        seedPhrase: decryptedRecoveryInfo.seedPhrase,
        privateKey: decryptedRecoveryInfo.privateKey,
        publicKey: decryptedRecoveryInfo.publicKey,
        derivationPath: decryptedRecoveryInfo.derivationPath,
        createdAt: decryptedRecoveryInfo.createdAt,
        warning: "⚠️ IMPORTANT: Save this information securely! You cannot recover your wallet without it."
      };

      console.log("Recovery information retrieved and decrypted successfully");

      return NextResponse.json({
        success: true,
        recoveryInfo
      });

    } catch (decryptError) {
      console.error("Failed to decrypt recovery information:", decryptError);
      
      return NextResponse.json({
        success: false,
        message: "Failed to decrypt recovery information.",
        details: "The recovery information could not be decrypted. This may indicate a data integrity issue.",
        recommendation: "Please contact support for assistance with account recovery."
      });
    }

  } catch (error) {
    console.error("Failed to fetch recovery information:", error);

    return NextResponse.json(
      { 
        error: "Failed to fetch recovery information",
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
