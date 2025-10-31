import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const merchantId = searchParams.get("merchantId");
    if (!merchantId) {
      return NextResponse.json({ error: "merchantId is required" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("scheduled_payments")
      .select("*")
      .eq("merchant_id", merchantId)
      .order("scheduled_at", { ascending: true });

    if (error) throw error;

    return NextResponse.json({ success: true, scheduled: data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to load" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { merchantId, amount, token, delivery, recipientEmail, note, scheduledAt } = body;

    if (!merchantId || !amount || !token || !scheduledAt) {
      return NextResponse.json({ error: "merchantId, amount, token, scheduledAt are required" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("scheduled_payments")
      .insert({
        merchant_id: merchantId,
        amount,
        token,
        delivery_method: delivery || "link",
        recipient_email: recipientEmail || null,
        note: note || null,
        scheduled_at: scheduledAt,
        status: "pending"
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, scheduled: data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to schedule" }, { status: 500 });
  }
}


