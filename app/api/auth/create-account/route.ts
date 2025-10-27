import { NextRequest, NextResponse } from "next/server";
import { SimpleUserService } from "@/lib/simple-user-service";
import { FCLAccountService } from "@/lib/fcl-account-service";

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

    // Use FCL Account Service for account creation
    // This handles all the complex blockchain operations automatically
    const result = await FCLAccountService.createAccount({
      email,
      name
    });

    if (!result.success) {
      return NextResponse.json(
        { 
          error: result.error || "Failed to create account",
          details: "FCL account creation failed"
        },
        { status: 500 }
      );
    }

    console.log("FCL account created successfully:", result.address);

    return NextResponse.json({
      success: true,
      account: {
        id: result.user?.id,
        email,
        name,
        address: result.address,
        transactionId: result.transactionId,
        message: "Flow account created successfully! Your secure wallet is ready to use with vault pre-configured."
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


