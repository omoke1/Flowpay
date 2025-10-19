import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { WalletService } from "@/lib/wallet-service";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { merchantId, productName, description, amount, token, redirectUrl } = body;

    // Validate required fields
    if (!merchantId || !productName || !amount || !token) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // If Supabase is not configured, return mock data
    if (!supabase) {
      const mockData = {
        id: `link_${Date.now()}`,
        merchant_id: merchantId,
        product_name: productName,
        description: description || null,
        amount: amount.toString(),
        token,
        redirect_url: redirectUrl || null,
        status: "active",
        created_at: new Date().toISOString(),
      };
      return NextResponse.json({
        success: true,
        paymentLink: mockData,
        checkoutUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001'}/pay/${mockData.id}`,
      });
    }

            // Use WalletService to get or create user
            const userData = await WalletService.getOrCreateUser(merchantId);
            if (!userData) {
              return NextResponse.json(
                { error: "Failed to get or create user" },
                { status: 500 }
              );
            }

    // Insert payment link into Supabase
    const { data, error } = await supabase
      .from("payment_links")
      .insert({
        merchant_id: userData.id,
        product_name: productName,
        description: description || null,
        amount: amount.toString(),
        token,
        redirect_url: redirectUrl || null,
        status: "active",
      })
      .select()
      .single();

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json(
        { error: "Failed to create payment link" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      paymentLink: data,
      checkoutUrl: `${process.env.NEXT_PUBLIC_APP_URL}/pay/${data.id}`,
    });
  } catch (error) {
    console.error("Error creating payment link:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const merchantId = searchParams.get("merchantId");

    if (!merchantId) {
      return NextResponse.json(
        { error: "Merchant ID required" },
        { status: 400 }
      );
    }

    // If Supabase is not configured, return mock data
    if (!supabase) {
      const mockData = [
        {
          id: 'link_1',
          merchant_id: merchantId,
          product_name: 'Design Service',
          description: 'Professional design consultation',
          amount: '250',
          token: 'USDC.e',
          status: 'active',
          created_at: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
        },
        {
          id: 'link_2',
          merchant_id: merchantId,
          product_name: 'Consultation',
          description: 'Business strategy consultation',
          amount: '150',
          token: 'FLOW',
          status: 'active',
          created_at: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
        }
      ];
      return NextResponse.json({ paymentLinks: mockData });
    }

            // Use WalletService to get user
            const userData = await WalletService.getUserByWalletAddress(merchantId);
            if (!userData) {
              return NextResponse.json(
                { error: "User not found" },
                { status: 404 }
              );
            }

    // Fetch payment links for merchant
    const { data, error } = await supabase
      .from("payment_links")
      .select("*")
      .eq("merchant_id", userData.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json(
        { error: "Failed to fetch payment links" },
        { status: 500 }
      );
    }

    return NextResponse.json({ paymentLinks: data });
  } catch (error) {
    console.error("Error fetching payment links:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

