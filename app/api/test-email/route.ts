import { NextRequest, NextResponse } from "next/server";
import { resend } from "@/lib/resend";
import { checkRateLimit } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  try {
    const rate = await checkRateLimit(request, "general");
    if (!rate.success) {
      return NextResponse.json(
        {
          error: "Rate limit exceeded",
          limit: rate.limit,
          remaining: rate.remaining,
          reset: rate.reset,
        },
        {
          status: 429,
          headers: {
            "X-RateLimit-Limit": rate.limit.toString(),
            "X-RateLimit-Remaining": rate.remaining.toString(),
            "X-RateLimit-Reset": rate.reset.toISOString(),
          },
        }
      );
    }

    if (!resend) {
      return NextResponse.json(
        { error: "Resend is not configured on the server" },
        { status: 500 }
      );
    }

    const body = await request.json();
    const to = String(body?.to || "").trim();
    const subject = String(body?.subject || "FlowPay Test Email");
    const html = String(
      body?.html ||
        `<div style=\"font-family:Inter,Arial,sans-serif;padding:16px\">` +
          `<h2 style=\"margin:0 0 12px\">FlowPay Email Test</h2>` +
          `<p style=\"margin:0 0 8px\">This is a test message to confirm Resend delivery.</p>` +
          `<p style=\"margin:0;color:#777\">Timestamp: ${new Date().toISOString()}</p>` +
        `</div>`
    );

    if (!to || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to)) {
      return NextResponse.json(
        { error: "A valid 'to' email is required" },
        { status: 400 }
      );
    }

    const sent = await resend.emails.send({
      from: "FlowPay <payments@flowpay.app>",
      to,
      subject,
      html,
    });

    return NextResponse.json({ success: true, id: sent?.id || null });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to send test email" },
      { status: 500 }
    );
  }
}


