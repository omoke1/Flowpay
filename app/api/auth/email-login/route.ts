import { NextRequest, NextResponse } from "next/server";
import { SimpleUserService } from "@/lib/simple-user-service";

export async function POST(request: NextRequest) {
  try {
    console.log("POST /api/auth/email-login - Starting email login");
    
    const body = await request.json();
    const { email } = body;

    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { error: "Email address is required" },
        { status: 400 }
      );
    }

    console.log(`Attempting login for: ${email}`);

    // Find user by email
    const user = await SimpleUserService.getUserByEmail(email);

    if (!user) {
      console.log(`User not found for email: ${email}`);
      return NextResponse.json(
        { 
          error: "No account found with this email address",
          suggestion: "Please check your email address or create a new account"
        },
        { status: 404 }
      );
    }

    if (!user.wallet_address) {
      console.log(`User found but no wallet address: ${email}`);
      return NextResponse.json(
        { 
          error: "Account found but no wallet address associated",
          suggestion: "Please contact support for assistance"
        },
        { status: 400 }
      );
    }

    console.log(`Login successful for user: ${user.id}, wallet: ${user.wallet_address}`);

    // Return user data for frontend
    const userData = {
      id: user.id,
      email: user.email,
      display_name: user.display_name,
      wallet_address: user.wallet_address,
      created_at: user.created_at
    };

    return NextResponse.json({
      success: true,
      message: "Login successful",
      user: userData
    });

  } catch (error) {
    console.error("Email login error:", error);
    
    return NextResponse.json(
      { 
        error: "Login failed",
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
