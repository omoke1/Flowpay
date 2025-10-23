"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useFlowOfficial } from "@/components/providers/flow-provider-official";
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { PaymentsTable } from "@/components/dashboard/payments-table";
import { formatAmount, formatAddress } from "@/lib/utils";
import { getUserAddress } from "@/lib/flow-utils";

export default function PaymentsPage() {
  const router = useRouter();
  const { isConnected, user, disconnectWallet } = useFlowOfficial();
  const [loading, setLoading] = useState(true);
  const [payments, setPayments] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  // Get user address using utility function
  const userAddress = getUserAddress(user);

  useEffect(() => {
    if (!isConnected) {
      router.push("/");
      return;
    }

    const fetchPayments = async () => {
      try {
        if (!userAddress) {
          console.error("No user address found");
          return;
        }
        const response = await fetch(`/api/payments?merchantId=${userAddress}`);
        const data = await response.json();
        
        // Transform payments data to match Payment interface
        const transformedPayments = (data.payments || []).map((payment: any) => ({
          id: payment.id,
          customer: payment.payer_address ? formatAddress(payment.payer_address) : 'Unknown',
          amount: payment.amount,
          token: payment.token,
          status: payment.status,
          date: payment.paid_at || payment.created_at,
          hash: payment.tx_hash // Map tx_hash to hash for the table
        }));
        
        setPayments(transformedPayments);
      } catch (error) {
        console.error("Error fetching payments:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPayments();
  }, [isConnected, userAddress, router]);

  const filteredPayments = payments.filter(payment => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      payment.id?.toLowerCase().includes(query) ||
      payment.payer_user?.address?.toLowerCase().includes(query) ||
      payment.token?.toLowerCase().includes(query) ||
      payment.payment_links?.product_name?.toLowerCase().includes(query)
    );
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-950 text-white">
        <p>Loading payments...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black dark:bg-[#0A0A0A] text-gray-900 dark:text-gray-200 font-sans antialiased">
      {/* Mobile Sidebar Backdrop */}
      <div id="mobile-backdrop" className="fixed inset-0 z-30 hidden bg-black/60 backdrop-blur-sm lg:hidden"></div>

      {/* Sidebar */}
      <DashboardSidebar activeItem="payments" onLogout={disconnectWallet} />

      {/* Main */}
      <div className="lg:pl-60">
        {/* Top Bar */}
        <DashboardHeader 
          title="Payments" 
          onSearch={setSearchQuery} 
          onCreatePaymentLink={() => router.push("/dashboard/create")}
          address={userAddress}
        />

        {/* Content Wrapper */}
        <main className="px-4 sm:px-6 lg:px-8 py-6 space-y-8">
          {/* Summary Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total Payments */}
            <div className="rounded-2xl bg-black dark:bg-[#111111] border border-zinc-100/10 dark:border-white/10 p-4 sm:p-5">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-500 dark:text-gray-400">Total Payments</div>
                <svg className="h-4 w-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="mt-3 text-2xl tracking-tight font-semibold text-gray-100 dark:text-white">
                {payments.length}
              </div>
              <div className="mt-2 text-[#97F11D] text-sm">transactions</div>
            </div>

            {/* Total Revenue */}
            <div className="rounded-2xl bg-black dark:bg-[#111111] border border-zinc-100/10 dark:border-white/10 p-4 sm:p-5">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-500 dark:text-gray-400">Total Revenue</div>
                <svg className="h-4 w-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <div className="mt-3 text-2xl tracking-tight font-semibold text-gray-100 dark:text-white">
                ${payments.reduce((sum, p) => sum + parseFloat(p.amount || 0), 0).toFixed(2)}
              </div>
              <div className="mt-2 text-[#97F11D] text-sm">total earned</div>
            </div>

            {/* Success Rate */}
            <div className="rounded-2xl bg-black dark:bg-[#111111] border border-zinc-100/10 dark:border-white/10 p-4 sm:p-5">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-500 dark:text-gray-400">Success Rate</div>
                <svg className="h-4 w-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <div className="mt-3 text-2xl tracking-tight font-semibold text-gray-100 dark:text-white">
                {payments.length > 0 ? Math.round((payments.filter(p => p.status === 'completed').length / payments.length) * 100) : 0}%
              </div>
              <div className="mt-2 text-[#97F11D] text-sm">completed</div>
            </div>

            {/* Avg Amount */}
            <div className="rounded-2xl bg-black dark:bg-[#111111] border border-zinc-100/10 dark:border-white/10 p-4 sm:p-5">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-500 dark:text-gray-400">Avg Amount</div>
                <svg className="h-4 w-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div className="mt-3 text-2xl tracking-tight font-semibold text-gray-100 dark:text-white">
                ${payments.length > 0 ? (payments.reduce((sum, p) => sum + parseFloat(p.amount || 0), 0) / payments.length).toFixed(2) : '0.00'}
              </div>
              <div className="mt-2 text-[#97F11D] text-sm">per payment</div>
            </div>
          </div>

          {/* Payments Table Card */}
          <div className="rounded-2xl border border-zinc-100/10 dark:border-white/10 bg-black dark:bg-[#0D0D0D] overflow-hidden">
            <div className="px-4 sm:px-6 py-4 border-b border-zinc-100/10 dark:border-white/10">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <h2 className="text-xl tracking-tight font-semibold text-gray-100 dark:text-white">All Payments</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Monitor and manage all transactions</p>
                </div>
                <div className="flex items-center gap-2">
                  <button className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-black/[0.03] dark:bg-white/5 hover:bg-black/[0.06] dark:hover:bg-white/10 border border-zinc-100/10 dark:border-white/10 text-sm text-gray-200 dark:text-gray-200">
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                    </svg>
                    Filters
                  </button>
                  <button className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-black/[0.03] dark:bg-white/5 hover:bg-black/[0.06] dark:hover:bg-white/10 border border-zinc-100/10 dark:border-white/10 text-sm text-gray-200 dark:text-gray-200">
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Export CSV
                  </button>
                </div>
              </div>
            </div>
            <PaymentsTable payments={filteredPayments} />
          </div>
        </main>
      </div>
    </div>
  );
}
