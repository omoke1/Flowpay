import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
  try {
    const nowIso = new Date().toISOString();

    const { data: due, error } = await supabase
      .from("scheduled_payments")
      .select("*")
      .eq("status", "pending")
      .lte("scheduled_at", nowIso)
      .order("scheduled_at", { ascending: true });

    if (error) throw error;

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || process.env.BASE_URL || "http://localhost:3000";
    let processed = 0;
    for (const item of due || []) {
      try {
        // Mark processing
        await supabase.from("scheduled_payments").update({ status: "processing" }).eq("id", item.id);

        // Create actual transfer via existing API so it follows the Flow blockchain path
        const resp = await fetch(`${baseUrl}/api/transfers`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            amount: Number(item.amount),
            token: item.token,
            recipientEmail: item.delivery_method === "email" ? item.recipient_email : null,
            note: item.note || null,
          })
        });

        const json = await resp.json();
        if (!resp.ok) throw new Error(json?.error || "Transfer API failed");

        // Persist resulting transfer linkage for traceability
        await supabase
          .from("scheduled_payments")
          .update({ 
            status: "completed", 
            processed_at: new Date().toISOString(),
            result_transfer_id: json?.transfer?.id || null,
            result_claim_link: json?.transfer?.claim_link || null
          })
          .eq("id", item.id);
        processed++;
      } catch (e) {
        await supabase
          .from("scheduled_payments")
          .update({ status: "failed", failure_reason: e instanceof Error ? e.message : "Unknown" })
          .eq("id", item.id);
      }
    }

    return NextResponse.json({ success: true, processed });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to process" }, { status: 500 });
  }
}


