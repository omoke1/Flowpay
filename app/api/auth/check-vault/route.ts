import { NextRequest, NextResponse } from "next/server";
import { hasFlowTokenCapability, getFlowBalance, getUSDCBalance } from "@/lib/flow-transactions";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const address = searchParams.get('address');
    
    if (!address) {
      return NextResponse.json(
        { error: "Address parameter is required" },
        { status: 400 }
      );
    }

    console.log(`Checking vault status for address: ${address}`);

    // Check if account has FlowToken capability
    const hasCapability = await hasFlowTokenCapability(address);
    
    let balances = { flow: 0, usdc: 0 };
    if (hasCapability) {
      try {
        const [flowBalance, usdcBalance] = await Promise.all([
          getFlowBalance(address),
          getUSDCBalance(address)
        ]);
        
        balances = {
          flow: parseFloat(flowBalance) || 0,
          usdc: parseFloat(usdcBalance) || 0
        };
      } catch (error) {
        console.error('Error fetching balances:', error);
      }
    }

    return NextResponse.json({
      address,
      hasFlowTokenCapability: hasCapability,
      needsVaultSetup: !hasCapability,
      balances,
      status: hasCapability ? 'ready' : 'needs_setup'
    });

  } catch (error) {
    console.error("Error checking vault status:", error);
    return NextResponse.json(
      { 
        error: "Failed to check vault status",
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
