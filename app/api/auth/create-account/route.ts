import { NextRequest, NextResponse } from "next/server";
import { flowAccountService } from "@/lib/flow-account-service";
import { SimpleUserService } from "@/lib/simple-user-service";
import { checkRateLimit } from "@/lib/rate-limit";
import { logError, logInfo } from "@/lib/error-logging";

export async function POST(request: NextRequest) {
  try {
    // Rate limiting check
    const rateLimitResult = await checkRateLimit(request, "account-creation");
    if (!rateLimitResult.success) {
      return NextResponse.json(
        {
          error: "Rate limit exceeded",
          limit: rateLimitResult.limit,
          remaining: rateLimitResult.remaining,
          reset: rateLimitResult.reset,
        },
        { 
          status: 429,
          headers: {
            "X-RateLimit-Limit": rateLimitResult.limit.toString(),
            "X-RateLimit-Remaining": rateLimitResult.remaining.toString(),
            "X-RateLimit-Reset": rateLimitResult.reset.toISOString(),
          }
        }
      );
    }

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

    console.log(`Creating Flow account for: ${email}`);

    // Create Flow account
    const accountResult = await flowAccountService.createFlowAccount(email, name);

    // Verify account creation
    const isVerified = await flowAccountService.verifyAccountCreation(accountResult.address);
    if (!isVerified) {
      throw new Error('Account creation verification failed');
    }

    // Get account balance
    const balance = await flowAccountService.getAccountBalance(accountResult.address);

    logInfo("Flow account created successfully", {
      email,
      name,
      address: accountResult.address,
      balance,
      transactionId: accountResult.transactionId
    });

    return NextResponse.json({
      success: true,
      account: {
        address: accountResult.address,
        email,
        name,
        balance,
        funded: accountResult.funded,
        transactionId: accountResult.transactionId
      }
    });

  } catch (error) {
    logError("Failed to create Flow account", error as Error, {
      endpoint: '/api/auth/create-account',
      method: 'POST'
    });

    return NextResponse.json(
      { 
        error: "Failed to create account",
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}


