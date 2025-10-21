import { NextResponse } from "next/server";
import { Magic } from 'magic-sdk';

export async function GET() {
  try {
    const magic = new Magic(process.env.NEXT_PUBLIC_MAGIC_PUBLISHABLE_KEY!);
    
    // Test if Magic.link can initialize
    const isLoggedIn = await magic.user.isLoggedIn();
    
    return NextResponse.json({
      success: true,
      isLoggedIn,
      message: "Magic.link initialized successfully"
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
      errorType: error.constructor.name,
      magicKey: process.env.NEXT_PUBLIC_MAGIC_PUBLISHABLE_KEY?.substring(0, 10) + "..."
    }, { status: 500 });
  }
}
