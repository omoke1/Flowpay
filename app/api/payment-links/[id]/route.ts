import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Fetch payment link by ID
    const { data, error } = await supabase
      .from("payment_links")
      .select("*")
      .eq("id", id)
      .eq("status", "active")
      .single();

    if (error || !data) {
      return NextResponse.json(
        { error: "Payment link not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ paymentLink: data });
  } catch (error) {
    console.error("Error fetching payment link:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

