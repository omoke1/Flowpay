"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useFlowMainnet } from "@/components/providers/flow-provider-mainnet";
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { DashboardStats } from "@/components/dashboard/dashboard-stats";
import { DashboardTabs } from "@/components/dashboard/dashboard-tabs";
import { OnboardingTour } from "@/components/onboarding/onboarding-tour";
import { WelcomeBanner } from "@/components/onboarding/welcome-banner";
import { useTourState } from "@/lib/hooks/use-tour-state";
import { formatAmount, formatAddress } from "@/lib/utils";
import { getUserAddress } from "@/lib/utils";

export default function DashboardPage() {
  const router = useRouter();
  const { isConnected, user, disconnectWallet } = useFlowMainnet();
  const [loading, setLoading] = useState(true);
  const [paymentLinks, setPaymentLinks] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState("dash-payments");
  const [showWelcomeBanner, setShowWelcomeBanner] = useState(false);
  const { hasCompletedTour, showTour, startTour, skipTour, markTourCompleted } = useTourState();

  // Get user address using utility function
  const userAddress = getUserAddress(user);
  
  // Debug logging
  console.log("Dashboard - isConnected:", isConnected);
  console.log("Dashboard - user:", user);
  console.log("Dashboard - userAddress:", userAddress);

  const fetchData = async () => {
    try {
      console.log("Dashboard fetchData - user:", user);
      console.log("Dashboard fetchData - userAddress:", userAddress);
      
      if (!userAddress) {
        console.error("No user address found");
        return;
      }
      
      // Fetch payment links
      const linksResponse = await fetch(`/api/payment-links?merchantId=${userAddress}`);
      const linksData = await linksResponse.json();
      setPaymentLinks(linksData.paymentLinks || []);

      // Fetch payments
      const paymentsResponse = await fetch(`/api/payments?merchantId=${userAddress}`);
      const paymentsData = await paymentsResponse.json();
      setPayments(paymentsData.payments || []);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isConnected) {
      router.push("/");
      return;
    }

    // Only fetch data if we have a valid user address
    if (userAddress) {
      fetchData();
      
      // Check if this is a new user (no payment links or payments) and hasn't completed tour
      const checkNewUser = async () => {
        const linksResponse = await fetch(`/api/payment-links?merchantId=${userAddress}`);
        const linksData = await linksResponse.json();
        const links = linksData.paymentLinks || [];
        
        const paymentsResponse = await fetch(`/api/payments?merchantId=${userAddress}`);
        const paymentsData = await paymentsResponse.json();
        const payments = paymentsData.payments || [];
        
        // Show welcome banner only for truly new users who have never seen the tour
        if (links.length === 0 && payments.length === 0 && hasCompletedTour === false) {
          setShowWelcomeBanner(true);
        }
      };
      
      checkNewUser();
    }
  }, [isConnected, userAddress, router, hasCompletedTour]);

  const stats = {
    totalRevenue: payments.reduce((sum, p) => sum + parseFloat(p.amount || 0), 0),
    activeLinks: paymentLinks.filter(l => l.status === 'active').length,
    customers: new Set(payments.map(p => p.payer_user?.address)).size,
    avgPaymentTime: payments.length > 0 ? "3.2s" : "0s",
  };

  if (loading || (isConnected && !userAddress)) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-950 text-white">
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black dark:bg-[#0A0A0A] text-gray-900 dark:text-gray-200 font-sans antialiased">
      {/* Mobile Sidebar Backdrop */}
      <div id="mobile-backdrop" className="fixed inset-0 z-30 hidden bg-black/60 backdrop-blur-sm lg:hidden"></div>

      {/* Sidebar */}
      <DashboardSidebar activeItem="dashboard" onLogout={disconnectWallet} />

      {/* Main */}
      <div className="lg:pl-60">
        {/* Top Bar */}
        <DashboardHeader 
          title="Dashboard" 
          onSearch={() => {}} 
          onCreatePaymentLink={() => router.push("/dashboard/create")}
          address={userAddress}
          onLogout={disconnectWallet}
        />

        {/* Content Wrapper */}
        <main className="px-4 sm:px-6 lg:px-8 py-6 space-y-8">
          <WelcomeBanner
            isVisible={showWelcomeBanner}
            onStartTour={() => {
              setShowWelcomeBanner(false);
              startTour();
            }}
            onDismiss={() => setShowWelcomeBanner(false)}
            onCreateFirstLink={() => router.push("/dashboard/create")}
          />
          
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
            <div className="rounded-2xl border border-zinc-100/10 dark:border-white/10 bg-black dark:bg-[#0D0D0D]">
              <DashboardTabs 
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                payments={payments}
                paymentLinks={paymentLinks}
                onCreateLink={() => router.push("/dashboard/create")}
                onRefreshLinks={fetchData}
              />
            </div>
          </section>
        </main>
      </div>
      
      {/* Onboarding Tour */}
      <OnboardingTour
        isOpen={showTour}
        onComplete={markTourCompleted}
        onSkip={skipTour}
      />
      
    </div>
  );
}
