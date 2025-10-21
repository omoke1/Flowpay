import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    message: "Authentication test endpoint",
    timestamp: new Date().toISOString(),
    status: "working"
  });
}
