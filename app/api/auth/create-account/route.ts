import { NextRequest, NextResponse } from "next/server";
import { SimpleUserService } from "@/lib/simple-user-service";
import { createFlowAccount, checkAdminBalance, estimateAccountCreationCost } from "@/lib/flow-transactions";
import { createFlowAccount as createFlowAccountWithKeys, exportAccountRecovery } from "@/lib/flow-key-management-server";
import { encryptRecoveryInfo, generateEncryptionPassword } from "@/lib/encryption-utils";

export async function POST(request: NextRequest) {
  try {
    console.log("POST /api/auth/create-account - Starting account creation");
    
    const body = await request.json();
    const { email, name } = body;

    // Validate input
    if (!email || !name) {
      return NextResponse.json(
        { error: "Email and name are required" },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    // Check if email already exists
    const existingUser = await SimpleUserService.getUserByEmail(email);
    if (existingUser) {
      return NextResponse.json(
        { error: "Account with this email already exists" },
        { status: 409 }
      );
    }

    console.log(`Creating account for: ${email}`);

    console.log("Creating Flow account with proper key management");

    // Create Flow account with proper key management
    const flowAccount = createFlowAccountWithKeys(email, name);
    console.log("Flow account created with keys:", flowAccount.address);

    // Generate recovery information
    const recoveryInfo = exportAccountRecovery(flowAccount);
    console.log("Recovery information generated");

    // Encrypt recovery information for secure storage
    const serverSecret = process.env.ENCRYPTION_SECRET || 'default-secret-change-in-production';
    const encryptionPassword = generateEncryptionPassword(email, serverSecret);
    const encryptedRecoveryInfo = encryptRecoveryInfo(recoveryInfo, encryptionPassword);
    console.log("Recovery information encrypted for secure storage");

    // Create user record in database with Flow address and encrypted recovery info
    const userData = await SimpleUserService.getOrCreateUser(flowAccount.address, {
      email,
      display_name: name,
      encrypted_recovery_info: encryptedRecoveryInfo,
    });

    if (!userData) {
      console.error("Failed to create user record in database");
      return NextResponse.json(
        { 
          error: "Failed to create user record",
          details: "Flow account was created but failed to save user data"
        },
        { status: 500 }
      );
    }

    console.log("User account created successfully:", userData.id);

    // Send recovery email (optional - for enhanced security)
    try {
      // In production, you would send an email with recovery instructions
      console.log("Recovery email would be sent here with instructions");
    } catch (emailError) {
      console.warn("Failed to send recovery email:", emailError);
      // Don't fail the registration if email fails
    }

    return NextResponse.json({
      success: true,
      account: {
        id: userData.id,
        email,
        name,
        address: flowAccount.address,
        message: "Flow account created successfully! Your secure wallet is ready to use."
      }
    });

  } catch (error) {
    console.error("Failed to create account:", error);

    return NextResponse.json(
      { 
        error: "Failed to create account",
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}


