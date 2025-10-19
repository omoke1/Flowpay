"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useFlowUser } from "@/components/providers/flow-provider";
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { DashboardStats } from "@/components/dashboard/dashboard-stats";
import { DashboardTabs } from "@/components/dashboard/dashboard-tabs";
import { formatAmount, formatAddress } from "@/lib/utils";

export default function DashboardPage() {
  const router = useRouter();
  const { loggedIn, address, logOut } = useFlowUser();
  const [loading, setLoading] = useState(true);
  const [paymentLinks, setPaymentLinks] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState("dash-payments");

  useEffect(() => {
    if (!loggedIn) {
      router.push("/");
      return;
    }

    const fetchData = async () => {
      try {
        // Fetch payment links
        const linksResponse = await fetch(`/api/payment-links?merchantId=${address}`);
        const linksData = await linksResponse.json();
        setPaymentLinks(linksData.paymentLinks || []);

        // Fetch payments
        const paymentsResponse = await fetch(`/api/payments?merchantId=${address}`);
        const paymentsData = await paymentsResponse.json();
        setPayments(paymentsData.payments || []);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [loggedIn, address, router]);

  const stats = {
    totalRevenue: payments.reduce((sum, p) => sum + parseFloat(p.amount || 0), 0),
    activeLinks: paymentLinks.filter(l => l.status === 'active').length,
    customers: new Set(payments.map(p => p.payer_address)).size,
    avgPaymentTime: "3.2s",
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0A0A0A] text-white">
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-[#0A0A0A] text-gray-900 dark:text-gray-200 font-sans antialiased">
      {/* Mobile Sidebar Backdrop */}
      <div id="mobile-backdrop" className="fixed inset-0 z-30 hidden bg-black/60 backdrop-blur-sm lg:hidden"></div>

      {/* Sidebar */}
      <DashboardSidebar activeItem="dashboard" onLogout={logOut} />

      {/* Main */}
      <div className="lg:pl-60">
        {/* Top Bar */}
        <DashboardHeader 
          title="Dashboard" 
          onSearch={() => {}} 
          onCreatePaymentLink={() => router.push("/dashboard/create")}
          address={address}
          onLogout={logOut}
        />

        {/* Content Wrapper */}
        <main className="px-4 sm:px-6 lg:px-8 py-6 space-y-8">
          {/* Dashboard Page */}
          <section className="space-y-8">
            {/* Summary + Quick Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
              {/* Stat Cards */}
              <div className="col-span-1 lg:col-span-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <DashboardStats stats={stats} />
              </div>
            </div>

            {/* Tabs: Payments | Analytics | Links */}
            <div className="rounded-2xl border border-zinc-900/10 dark:border-white/10 bg-white dark:bg-[#0D0D0D]">
              <DashboardTabs 
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                payments={payments}
                paymentLinks={paymentLinks}
                onCreateLink={() => router.push("/dashboard/create")}
              />
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}