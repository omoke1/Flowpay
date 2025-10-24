"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useFlowMainnet } from "@/components/providers/flow-provider-mainnet";
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { getUserAddress } from "@/lib/utils";

export default function AnalyticsPage() {
  const router = useRouter();
  const { isConnected, user, disconnectWallet } = useFlowMainnet();
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<any>({});

  // Get user address using utility function
  const userAddress = getUserAddress(user);

  useEffect(() => {
    if (!isConnected) {
      router.push("/");
      return;
    }

    const fetchAnalytics = async () => {
      try {
        if (!userAddress) {
          console.error("No user address found");
          return;
        }
        // Fetch real analytics data from payments
        const paymentsResponse = await fetch(`/api/payments?merchantId=${userAddress}`);
        const paymentsData = await paymentsResponse.json();
        const payments = paymentsData.payments || [];
        
        const linksResponse = await fetch(`/api/payment-links?merchantId=${userAddress}`);
        const linksData = await linksResponse.json();
        const links = linksData.paymentLinks || [];
        
        // Calculate analytics from real data
        const grossVolume = payments.reduce((sum: number, payment: any) => sum + parseFloat(payment.amount || 0), 0);
        const successfulPayments = payments.filter((p: any) => p.status === 'completed').length;
        const refundRate = payments.length > 0 ? (payments.filter((p: any) => p.status === 'refunded').length / payments.length) * 100 : 0;
        
        // Calculate token distribution
        const tokenCounts: { [key: string]: number } = {};
        payments.forEach((payment: any) => {
          tokenCounts[payment.token] = (tokenCounts[payment.token] || 0) + 1;
        });
        
        const totalTokenPayments = Object.values(tokenCounts).reduce((sum: number, count: number) => sum + count, 0);
        const topTokens = Object.entries(tokenCounts).map(([token, count]) => ({
          name: token,
          percentage: totalTokenPayments > 0 ? Math.round((count / totalTokenPayments) * 100) : 0,
          color: token === 'USDC.e' ? '#97F11D' : token === 'FLOW' ? '#60A5FA' : '#F59E0B'
        }));
        
        // Calculate top payment links
        const linkEarnings: { [key: string]: number } = {};
        payments.forEach((payment: any) => {
          linkEarnings[payment.link_id] = (linkEarnings[payment.link_id] || 0) + parseFloat(payment.amount || 0);
        });
        
        const topLinks = Object.entries(linkEarnings)
          .map(([linkId, amount]) => {
            const link = links.find((l: any) => l.id === linkId);
            return {
              name: link?.product_name || 'Unknown Product',
              amount: amount
            };
          })
          .sort((a, b) => b.amount - a.amount)
          .slice(0, 3);
        
        // Calculate daily volume for the last 14 days
        const dailyVolume = [];
        const today = new Date();
        for (let i = 13; i >= 0; i--) {
          const date = new Date(today);
          date.setDate(date.getDate() - i);
          const dateStr = date.toISOString().split('T')[0];
          
          const dayPayments = payments.filter((payment: any) => {
            const paymentDate = new Date(payment.paid_at || payment.created_at);
            return paymentDate.toISOString().split('T')[0] === dateStr;
          });
          
          const dayVolume = dayPayments.reduce((sum: number, payment: any) => sum + parseFloat(payment.amount || 0), 0);
          dailyVolume.push({
            date: dateStr,
            volume: dayVolume,
            payments: dayPayments.length
          });
        }

        setAnalytics({
          grossVolume,
          successfulPayments,
          refundRate,
          topTokens,
          topLinks,
          dailyVolume
        });
      } catch (error) {
        console.error("Error fetching analytics:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [isConnected, userAddress, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black dark:bg-[#0A0A0A] text-white">
        <p>Loading analytics...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black dark:bg-[#0A0A0A] text-gray-900 dark:text-gray-200 font-sans antialiased">
      {/* Mobile Sidebar Backdrop */}
      <div id="mobile-backdrop" className="fixed inset-0 z-30 hidden bg-black/60 backdrop-blur-sm lg:hidden"></div>

      {/* Sidebar */}
      <DashboardSidebar activeItem="analytics" onLogout={disconnectWallet} />

      {/* Main */}
      <div className="lg:pl-60">
        {/* Top Bar */}
        <DashboardHeader 
          title="Analytics" 
          onSearch={() => {}} 
          onCreatePaymentLink={() => router.push("/dashboard/create")}
          address={userAddress}
        />

        {/* Content Wrapper */}
        <main className="px-4 sm:px-6 lg:px-8 py-6 space-y-6">
          <div>
            <h2 className="text-xl tracking-tight font-semibold text-gray-900 dark:text-white">Analytics</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">Key metrics across your business</p>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="rounded-2xl bg-black border border-white/10 p-4">
              <div className="text-sm text-gray-400">Gross Volume</div>
              <div className="mt-2 text-2xl font-semibold text-white">${analytics.grossVolume?.toLocaleString() || '0'}</div>
              <div className="mt-1 text-xs text-[#97F11D]">Total revenue</div>
            </div>
            <div className="rounded-2xl bg-black border border-white/10 p-4">
              <div className="text-sm text-gray-400">Successful Payments</div>
              <div className="mt-2 text-2xl font-semibold text-white">{analytics.successfulPayments || 0}</div>
              <div className="mt-1 text-xs text-[#97F11D]">Completed transactions</div>
            </div>
            <div className="rounded-2xl bg-black border border-white/10 p-4">
              <div className="text-sm text-gray-400">Refund Rate</div>
              <div className="mt-2 text-2xl font-semibold text-white">{analytics.refundRate?.toFixed(1) || '0.0'}%</div>
              <div className="mt-1 text-xs text-[#97F11D]">Refund percentage</div>
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="rounded-2xl bg-black border border-white/10 p-4">
              <div className="flex items-center justify-between">
                <div className="text-sm text-white">Daily volume</div>
                <div className="text-xs text-gray-400">Last 14 days</div>
              </div>
              <div className="mt-4">
                {analytics.dailyVolume && analytics.dailyVolume.length > 0 ? (
                  <svg viewBox="0 0 300 120" className="w-full h-40">
                    {(() => {
                      const maxVolume = Math.max(...analytics.dailyVolume.map((d: any) => d.volume));
                      const barWidth = 280 / analytics.dailyVolume.length;
                      const maxHeight = 100;
                      
                      return analytics.dailyVolume.map((day: any, index: number) => {
                        const height = maxVolume > 0 ? (day.volume / maxVolume) * maxHeight : 0;
                        const x = 10 + (index * barWidth);
                        const y = 110 - height;
                        const opacity = height > 0 ? Math.max(0.3, height / maxHeight) : 0.1;
                        
                        return (
                          <rect
                            key={index}
                            x={x}
                            y={y}
                            width={barWidth - 2}
                            height={height}
                            fill="#97F11D"
                            opacity={opacity}
                          />
                        );
                      });
                    })()}
                    <g stroke="#00000022">
                      <line x1="0" y1="120" x2="300" y2="120"></line>
                      <line x1="0" y1="90" x2="300" y2="90"></line>
                      <line x1="0" y1="60" x2="300" y2="60"></line>
                      <line x1="0" y1="30" x2="300" y2="30"></line>
                    </g>
                  </svg>
                ) : (
                  <div className="flex items-center justify-center h-40 text-gray-400">
                    <div className="text-center">
                      <div className="text-sm">No payment data yet</div>
                      <div className="text-xs mt-1">Create payment links to see analytics</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="rounded-2xl bg-black border border-white/10 p-4">
              <div className="flex items-center justify-between">
                <div className="text-sm text-white">Top tokens</div>
                <div className="text-xs text-gray-400">Share of volume</div>
              </div>
              <div className="mt-4 space-y-3">
                {analytics.topTokens && analytics.topTokens.length > 0 ? (
                  analytics.topTokens.map((token: any, index: number) => (
                    <div key={index} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: token.color }}></span>
                        {token.name}
                      </div>
                      <div className="text-white font-medium">{token.percentage}%</div>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-gray-400 text-sm">
                    No token data yet
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Top Links */}
          <div className="rounded-2xl bg-black border border-white/10 p-4">
            <div className="text-sm text-white mb-2">Top payment links</div>
            {analytics.topLinks && analytics.topLinks.length > 0 ? (
              <ul className="space-y-2 text-sm">
                {analytics.topLinks.map((link: any, index: number) => (
                  <li key={index} className="flex items-center justify-between">
                    <span className="text-white">{link.name}</span>
                    <span className="text-white">${link.amount.toLocaleString()}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-center text-gray-400 text-sm py-4">
                No payment links with revenue yet
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
