import { NextRequest, NextResponse } from "next/server";
import { SimpleUserService } from "@/lib/simple-user-service";
import { createFlowAccount, checkAdminBalance, estimateAccountCreationCost } from "@/lib/flow-transactions";

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

    // Check if admin wallet is fully configured for real account creation
    const isAdminWalletConfigured = process.env.ADMIN_WALLET_ADDRESS && process.env.ADMIN_WALLET_PRIVATE_KEY;
    
    if (isAdminWalletConfigured) {
      console.log("Admin wallet configured - attempting real Flow account creation");
      
      // Check admin wallet balance before creating account
      const adminBalance = await checkAdminBalance();
      const estimatedCost = estimateAccountCreationCost();
      
      console.log(`Admin balance: ${adminBalance.balance} FLOW, Estimated cost: ${estimatedCost} FLOW`);

      if (!adminBalance.sufficient) {
        return NextResponse.json(
          { 
            error: "Insufficient admin wallet balance",
            details: `Admin wallet has ${adminBalance.balance} FLOW, but needs at least 0.1 FLOW to create accounts. Please fund the admin wallet.`,
            adminBalance: adminBalance.balance,
            requiredBalance: "0.1 FLOW"
          },
          { status: 503 }
        );
      }

      // Create real Flow account
      const accountResult = await createFlowAccount(email, name);

      if (!accountResult.success) {
        console.error("Failed to create Flow account:", accountResult.error);
        return NextResponse.json(
          { 
            error: "Failed to create Flow account",
            details: accountResult.error || "Unknown error occurred during account creation"
          },
          { status: 500 }
        );
      }

      console.log("Flow account created successfully:", accountResult.address);

      // Create user record in database with real Flow address
      const userData = await SimpleUserService.getOrCreateUser(accountResult.address!, {
        email,
        display_name: name
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

      return NextResponse.json({
        success: true,
        account: {
          id: userData.id,
          email,
          name,
          address: accountResult.address, // Real Flow address
          transactionId: accountResult.transactionId,
          message: "Flow account created successfully! You can now use FlowPay with your blockchain account."
        }
      });
    } else {
      console.log("Admin wallet not fully configured - creating mock account for development");
      
      // Create mock user record for development
      const userData = await SimpleUserService.getOrCreateUser(`mock_${Date.now()}`, {
        email,
        display_name: name
      });

      if (!userData) {
        console.error("Failed to create mock user record");
        return NextResponse.json(
          { 
            error: "Failed to create user record",
            details: "Failed to save user data"
          },
          { status: 500 }
        );
      }

      console.log("Mock user account created successfully:", userData.id);

      return NextResponse.json({
        success: true,
        account: {
          id: userData.id,
          email,
          name,
          address: userData.id, // Mock address for development
          message: "Account created successfully! (Development mode - admin wallet not configured for real Flow accounts)"
        }
      });
    }

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


