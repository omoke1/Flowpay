"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useFlowUser } from "@/components/providers/flow-provider";
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";

export default function AnalyticsPage() {
  const router = useRouter();
  const { loggedIn, address, logOut } = useFlowUser();
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<any>({});

  useEffect(() => {
    if (!loggedIn) {
      router.push("/");
      return;
    }

    const fetchAnalytics = async () => {
      try {
        // Mock analytics data for now
        setAnalytics({
          grossVolume: 12430,
          successfulPayments: 296,
          refundRate: 0.7,
          topTokens: [
            { name: 'USDC.e', percentage: 52, color: '#97F11D' },
            { name: 'FLOW', percentage: 30, color: '#60A5FA' },
            { name: 'USDT', percentage: 18, color: '#F59E0B' }
          ],
          topLinks: [
            { name: 'Design Service', amount: 1540 },
            { name: 'Consultation', amount: 990 },
            { name: 'Template Pack', amount: 760 }
          ]
        });
      } catch (error) {
        console.error("Error fetching analytics:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [loggedIn, address, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0A0A0A] text-white">
        <p>Loading analytics...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-[#0A0A0A] text-gray-900 dark:text-gray-200 font-sans antialiased">
      {/* Mobile Sidebar Backdrop */}
      <div id="mobile-backdrop" className="fixed inset-0 z-30 hidden bg-black/60 backdrop-blur-sm lg:hidden"></div>

      {/* Sidebar */}
      <DashboardSidebar activeItem="analytics" onLogout={logOut} />

      {/* Main */}
      <div className="lg:pl-60">
        {/* Top Bar */}
        <DashboardHeader 
          title="Analytics" 
          onSearch={() => {}} 
          onCreatePaymentLink={() => router.push("/dashboard/create")}
          address={address}
        />

        {/* Content Wrapper */}
        <main className="px-4 sm:px-6 lg:px-8 py-6 space-y-6">
          <div>
            <h2 className="text-xl tracking-tight font-semibold text-gray-900 dark:text-white">Analytics</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">Key metrics across your business</p>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="rounded-2xl bg-white dark:bg-[#111111] border border-zinc-900/10 dark:border-white/10 p-4">
              <div className="text-sm text-gray-700 dark:text-gray-300">Gross Volume</div>
              <div className="mt-2 text-2xl font-semibold text-gray-900 dark:text-white">${analytics.grossVolume?.toLocaleString()}</div>
              <div className="mt-1 text-xs text-[#97F11D]">+18% MoM</div>
            </div>
            <div className="rounded-2xl bg-white dark:bg-[#111111] border border-zinc-900/10 dark:border-white/10 p-4">
              <div className="text-sm text-gray-700 dark:text-gray-300">Successful Payments</div>
              <div className="mt-2 text-2xl font-semibold text-gray-900 dark:text-white">{analytics.successfulPayments}</div>
              <div className="mt-1 text-xs text-[#97F11D]">+9% MoM</div>
            </div>
            <div className="rounded-2xl bg-white dark:bg-[#111111] border border-zinc-900/10 dark:border-white/10 p-4">
              <div className="text-sm text-gray-700 dark:text-gray-300">Refund Rate</div>
              <div className="mt-2 text-2xl font-semibold text-gray-900 dark:text-white">{analytics.refundRate}%</div>
              <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">steady</div>
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="rounded-2xl bg-white dark:bg-[#111111] border border-zinc-900/10 dark:border-white/10 p-4">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-700 dark:text-gray-300">Daily volume</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Last 14 days</div>
              </div>
              <div className="mt-4">
                <svg viewBox="0 0 300 120" className="w-full h-40">
                  <g fill="#97F11D">
                    <rect x="5" y="80" width="14" height="40" opacity="0.5"></rect>
                    <rect x="25" y="60" width="14" height="60" opacity="0.6"></rect>
                    <rect x="45" y="50" width="14" height="70" opacity="0.7"></rect>
                    <rect x="65" y="70" width="14" height="50" opacity="0.55"></rect>
                    <rect x="85" y="40" width="14" height="80" opacity="0.85"></rect>
                    <rect x="105" y="62" width="14" height="58" opacity="0.65"></rect>
                    <rect x="125" y="30" width="14" height="90" opacity="0.9"></rect>
                    <rect x="145" y="55" width="14" height="65" opacity="0.7"></rect>
                    <rect x="165" y="68" width="14" height="52" opacity="0.6"></rect>
                    <rect x="185" y="45" width="14" height="75" opacity="0.8"></rect>
                    <rect x="205" y="60" width="14" height="60" opacity="0.65"></rect>
                    <rect x="225" y="35" width="14" height="85" opacity="0.9"></rect>
                    <rect x="245" y="58" width="14" height="62" opacity="0.7"></rect>
                    <rect x="265" y="50" width="14" height="70" opacity="0.75"></rect>
                  </g>
                  <g stroke="#00000022">
                    <line x1="0" y1="120" x2="300" y2="120"></line>
                    <line x1="0" y1="90" x2="300" y2="90"></line>
                    <line x1="0" y1="60" x2="300" y2="60"></line>
                    <line x1="0" y1="30" x2="300" y2="30"></line>
                  </g>
                </svg>
              </div>
            </div>
            <div className="rounded-2xl bg-white dark:bg-[#111111] border border-zinc-900/10 dark:border-white/10 p-4">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-700 dark:text-gray-300">Top tokens</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Share of volume</div>
              </div>
              <div className="mt-4 space-y-3">
                {analytics.topTokens?.map((token: any, index: number) => (
                  <div key={index} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: token.color }}></span>
                      {token.name}
                    </div>
                    <div className="text-gray-900 dark:text-white font-medium">{token.percentage}%</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Top Links */}
          <div className="rounded-2xl bg-white dark:bg-[#111111] border border-zinc-900/10 dark:border-white/10 p-4">
            <div className="text-sm text-gray-700 dark:text-gray-300 mb-2">Top 5 payment links</div>
            <ul className="space-y-2 text-sm">
              {analytics.topLinks?.map((link: any, index: number) => (
                <li key={index} className="flex items-center justify-between">
                  <span className="text-gray-700 dark:text-gray-300">{link.name}</span>
                  <span className="text-gray-900 dark:text-white">${link.amount.toLocaleString()}</span>
                </li>
              ))}
            </ul>
          </div>
        </main>
      </div>
    </div>
  );
}
