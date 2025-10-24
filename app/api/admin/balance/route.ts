import { NextRequest, NextResponse } from "next/server";
import { checkAdminBalance, estimateAccountCreationCost } from "@/lib/flow-transactions";

export async function GET(request: NextRequest) {
  try {
    console.log("GET /api/admin/balance - Checking admin wallet balance");

    // Check admin balance
    const balanceResult = await checkAdminBalance();
    const estimatedCost = estimateAccountCreationCost();

    // Get account count (mock for now - in production, query database)
    const accountCount = 0; // TODO: Implement real account count from database

    return NextResponse.json({
      balance: balanceResult.balance,
      sufficient: balanceResult.sufficient,
      estimatedCost,
      accountCount,
      minimumBalance: 0.1,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error("Error checking admin balance:", error);

    return NextResponse.json(
      { 
        error: "Failed to check admin balance",
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
