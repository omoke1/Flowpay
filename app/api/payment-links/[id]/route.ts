import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Check if Supabase is configured
    if (!supabase) {
      return NextResponse.json(
        { error: "Database not configured. Please set up Supabase." },
        { status: 500 }
      );
    }

    // Fetch payment link by ID from Supabase with merchant wallet address
    const supabaseClient = supabase!; // We know supabase is not null due to the check above
    const { data, error } = await supabaseClient
      .from("payment_links")
      .select(`
        *,
        users!merchant_id (
          wallet_address
        )
      `)
      .eq("id", id)
      .eq("status", "active")
      .single();

    if (error || !data) {
      console.error("Supabase error fetching payment link:", error);
      return NextResponse.json(
        { error: "Payment link not found" },
        { status: 404 }
      );
    }

    // Transform data to include merchant wallet address
    const paymentLink = {
      ...data,
      merchant_wallet_address: data.users?.wallet_address || data.merchant_id,
    };

    return NextResponse.json({ paymentLink });
  } catch (error) {
    console.error("Error fetching payment link:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { status } = body;

    // Check if Supabase is configured
    if (!supabase) {
      return NextResponse.json(
        { error: "Database not configured. Please set up Supabase." },
        { status: 500 }
      );
    }

    // Update payment link status in Supabase
    const supabaseClient = supabase!; // We know supabase is not null due to the check above
    const { data, error } = await supabaseClient
      .from("payment_links")
      .update({ status })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Supabase error updating payment link:", error);
      return NextResponse.json(
        { error: "Failed to update payment link" },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      paymentLink: data,
      message: `Payment link ${status === 'paused' ? 'paused' : 'resumed'} successfully` 
    });
  } catch (error) {
    console.error("Error updating payment link:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    console.log("DELETE request for payment link ID:", id);

    // Check if Supabase is configured
    if (!supabase) {
      return NextResponse.json(
        { error: "Database not configured. Please set up Supabase." },
        { status: 500 }
      );
    }
    
    // Delete payment link from Supabase
    const { data, error } = await supabaseClient
      .from("payment_links")
      .delete()
      .eq("id", id)
      .select();

    if (error) {
      console.error("Supabase error deleting payment link:", error);
      return NextResponse.json(
        { error: `Failed to delete payment link: ${error.message}` },
        { status: 500 }
      );
    }

    console.log("Delete result:", data);

    return NextResponse.json({ 
      success: true, 
      message: "Payment link deleted successfully",
      deletedCount: data?.length || 0
    });
  } catch (error) {
    console.error("Error deleting payment link:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}