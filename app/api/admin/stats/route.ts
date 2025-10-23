import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
  try {
    if (!supabase) {
      return NextResponse.json(
        { error: "Database not configured" },
        { status: 500 }
      );
    }

    // Get total users
    const { count: totalUsers } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true });

    // Get total transactions
    const { count: totalTransactions } = await supabase
      .from('payments')
      .select('*', { count: 'exact', head: true });

    // Get platform fees collected (sum of all platform fees)
    const { data: payments } = await supabase
      .from('payments')
      .select('amount, token');

    const platformFeesCollected = payments?.reduce((total, payment) => {
      const amount = parseFloat(payment.amount);
      const platformFee = amount * 0.005; // 0.5% platform fee
      return total + platformFee;
    }, 0) || 0;

    // Get accounts created via email
    const { count: accountsCreated } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .eq('account_funded_by', 'admin_payer');

    return NextResponse.json({
      totalUsers: totalUsers || 0,
      totalTransactions: totalTransactions || 0,
      platformFeesCollected,
      accountsCreated: accountsCreated || 0
    });

  } catch (error) {
    console.error('Error fetching admin stats:', error);
    return NextResponse.json(
      { error: "Failed to fetch admin statistics" },
      { status: 500 }
    );
  }
}


