import { NextRequest, NextResponse } from "next/server";
import { SimpleUserService } from "@/lib/simple-user-service";

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

    console.log(`Creating user account for: ${email}`);

    // For now, just create a simple user record
    // In a real implementation, this would create a Flow account
    const userData = await SimpleUserService.getOrCreateUser(`temp_${Date.now()}`, {
      email,
      display_name: name
    });

    if (!userData) {
      throw new Error('Failed to create user account');
    }

    console.log("User account created successfully:", userData.id);

    return NextResponse.json({
      success: true,
      account: {
        id: userData.id,
        email,
        name,
        message: "Account created successfully. Please connect your Flow wallet to complete setup."
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


