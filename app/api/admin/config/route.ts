import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  try {
    // Return current admin configuration from environment variables
    const config = {
      adminPayerAddress: process.env.NEXT_PUBLIC_ADMIN_PAYER_ADDRESS || 'Not configured',
      platformFeeRecipient: process.env.NEXT_PUBLIC_PLATFORM_FEE_RECIPIENT || 'Not configured',
      platformFeeRate: 0.005, // 0.5%
      accountCreationCost: 0.011 // 0.011 FLOW per account
    };

    return NextResponse.json(config);

  } catch (error) {
    console.error('Error fetching admin config:', error);
    return NextResponse.json(
      { error: "Failed to fetch admin configuration" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    
    // In a real implementation, you would update these in your environment
    // For now, we'll just return the updated config
    const updatedConfig = {
      adminPayerAddress: body.adminPayerAddress || process.env.NEXT_PUBLIC_ADMIN_PAYER_ADDRESS,
      platformFeeRecipient: body.platformFeeRecipient || process.env.NEXT_PUBLIC_PLATFORM_FEE_RECIPIENT,
      platformFeeRate: body.platformFeeRate || 0.005,
      accountCreationCost: body.accountCreationCost || 0.011
    };

    return NextResponse.json(updatedConfig);

  } catch (error) {
    console.error('Error updating admin config:', error);
    return NextResponse.json(
      { error: "Failed to update admin configuration" },
      { status: 500 }
    );
  }
}


