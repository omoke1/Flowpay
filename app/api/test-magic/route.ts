import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    magicKey: process.env.NEXT_PUBLIC_MAGIC_PUBLISHABLE_KEY ? "SET" : "NOT SET",
    magicKeyValue: process.env.NEXT_PUBLIC_MAGIC_PUBLISHABLE_KEY?.substring(0, 10) + "...",
    nodeEnv: process.env.NODE_ENV,
    appUrl: process.env.NEXT_PUBLIC_APP_URL,
  });
}
