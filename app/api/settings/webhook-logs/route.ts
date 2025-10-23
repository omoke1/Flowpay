import { NextRequest, NextResponse } from "next/server";
import { realSettingsService } from "@/lib/real-settings-service";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const walletAddress = searchParams.get('walletAddress');

    if (!walletAddress) {
      return NextResponse.json(
        { error: "Wallet address required" },
        { status: 400 }
      );
    }

    const logs = await realSettingsService.getWebhookLogs(walletAddress);
    return NextResponse.json({ logs });
  } catch (error) {
    console.error("Error fetching webhook logs:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

