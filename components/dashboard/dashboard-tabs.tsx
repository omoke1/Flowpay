"use client";

import { useState } from "react";
import { useNotification } from "@/components/providers/notification-provider";
import { 
  CreditCard, 
  BarChart3, 
  Link as LinkIcon, 
  Download, 
  Activity,
  Filter,
  Coins,
  ChevronDown,
  SortDesc,
  Calendar,
  Check,
  Clock,
  X,
  Copy,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Plus,
  Pause,
  Play,
  Trash2
} from "lucide-react";
import { EmptyState } from "@/components/onboarding/empty-state";

interface DashboardTabsProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  payments: any[];
  paymentLinks: any[];
  onCreateLink: () => void;
  onRefreshLinks?: () => void;
}

export function DashboardTabs({ 
  activeTab, 
  setActiveTab, 
  payments, 
  paymentLinks, 
  onCreateLink,
  onRefreshLinks 
}: DashboardTabsProps) {
  const { success, error, warning } = useNotification();
  const [statusFilter, setStatusFilter] = useState("All");
  const [tokenFilter, setTokenFilter] = useState("All");
  const [sortBy, setSortBy] = useState("Date");

  // Transform real data to display format
  const displayPayments = payments.map(payment => ({
    id: payment.id ? `#${payment.id.slice(-8)}` : payment.tx_hash ? `#${payment.tx_hash.slice(-8)}` : "N/A",
    customer: payment.payer_address ? `${payment.payer_address.slice(0, 6)}...${payment.payer_address.slice(-4)}` : "Unknown",
    amount: `$${payment.amount}`,
    token: payment.token,
    status: payment.status,
    date: payment.paid_at ? new Date(payment.paid_at).toLocaleDateString() : "N/A"
  }));

  const displayLinks = paymentLinks.map(link => ({
    id: link.id,
    name: link.product_name,
    token: link.token,
    price: `$${link.amount}`,
    status: link.status,
    created: new Date(link.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }));

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <Check className="h-3.5 w-3.5" />;
      case "failed":
        return <X className="h-3.5 w-3.5" />;
      case "pending":
        return <Clock className="h-3.5 w-3.5" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 border-emerald-500/20";
      case "failed":
        return "bg-red-500/10 text-red-700 dark:text-red-300 border-red-500/20";
      case "pending":
        return "bg-yellow-500/10 text-yellow-700 dark:text-yellow-300 border-yellow-500/20";
      default:
        return "bg-gray-500/10 text-gray-700 dark:text-gray-300 border-gray-500/20";
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      // You could add a toast notification here
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  const handlePauseResume = async (linkId: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'active' ? 'paused' : 'active';
      
      const response = await fetch(`/api/payment-links/${linkId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error('Failed to update payment link');
      }

      const data = await response.json();
      console.log(data.message);
      
      // Show success notification
      success(
        newStatus === 'active' ? "Link Activated! ✅" : "Link Paused ⏸️",
        `Payment link has been ${newStatus === 'active' ? 'activated' : 'paused'} successfully`
      );
      
      // Refresh the links list
      if (onRefreshLinks) {
        onRefreshLinks();
      }
    } catch (error: any) {
      console.error('Error updating payment link:', error);
      error(
        "Update Failed",
        "Failed to update payment link. Please try again."
      );
    }
  };

  const handleDelete = async (linkId: string, linkName: string) => {
    if (!confirm(`Are you sure you want to delete "${linkName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      console.log('Attempting to delete payment link:', linkId);
      
      const response = await fetch(`/api/payment-links/${linkId}`, {
        method: 'DELETE',
      });

      console.log('Delete response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Delete error response:', errorData);
        throw new Error(errorData.error || 'Failed to delete payment link');
      }

      const data = await response.json();
      console.log('Delete success:', data);
      
      // Show success notification
      success(
        "Link Deleted! 🗑️",
        `"${linkName}" has been permanently deleted`
      );
      
      // Refresh the links list
      if (onRefreshLinks) {
        onRefreshLinks();
      }
    } catch (error: any) {
      console.error('Error deleting payment link:', error);
      error(
        "Delete Failed",
        `Failed to delete payment link: ${error instanceof Error ? error.message : 'Please try again.'}`
      );
    }
  };

  return (
    <>
      {/* Tabs Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-3 sm:px-4 pt-3 sm:pt-4">
        <div className="flex items-center gap-1 overflow-x-auto">
          <button 
            onClick={() => setActiveTab("dash-payments")}
            className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm border ${
              activeTab === "dash-payments" 
                ? "text-gray-900 dark:text-white bg-black/[0.03] dark:bg-white/5 border-zinc-900/10 dark:border-white/10" 
                : "text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-black/[0.03] dark:hover:bg-white/5 border-transparent"
            }`}
          >
            <CreditCard className="h-4 w-4" />
            Payments
          </button>
          <button 
            onClick={() => setActiveTab("dash-analytics")}
            className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm border ${
              activeTab === "dash-analytics" 
                ? "text-gray-900 dark:text-white bg-black/[0.03] dark:bg-white/5 border-zinc-900/10 dark:border-white/10" 
                : "text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-black/[0.03] dark:hover:bg-white/5 border-transparent"
            }`}
          >
            <BarChart3 className="h-4 w-4" />
            Analytics
          </button>
          <button 
            onClick={() => setActiveTab("dash-links")}
            className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm border ${
              activeTab === "dash-links" 
                ? "text-gray-900 dark:text-white bg-black/[0.03] dark:bg-white/5 border-zinc-900/10 dark:border-white/10" 
                : "text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-black/[0.03] dark:hover:bg-white/5 border-transparent"
            }`}
          >
            <LinkIcon className="h-4 w-4" />
            Links
          </button>
        </div>
        <div className="flex items-center gap-1 sm:gap-2">
          <button className="inline-flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-2 rounded-lg bg-zinc-500/10 hover:bg-zinc-500/20 text-xs sm:text-sm text-gray-800 dark:text-gray-200 border border-zinc-500/20">
            <Download className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">Export CSV</span>
            <span className="sm:hidden">Export</span>
          </button>
          <button className="inline-flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-2 rounded-lg bg-zinc-500/10 hover:bg-zinc-500/20 text-xs sm:text-sm text-gray-800 dark:text-gray-200 border border-zinc-500/20">
            <Activity className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">Webhooks</span>
            <span className="sm:hidden">Web</span>
          </button>
        </div>
      </div>

      <div className="px-3 sm:px-4 pb-4 sm:pb-5 pt-2">
        {/* Payments Panel */}
        {activeTab === "dash-payments" && (
          <div>
            {displayPayments.length === 0 ? (
              <EmptyState 
                type="payments" 
                onCreateLink={onCreateLink}
              />
            ) : (
              <>
                {/* Filters + Sort */}
                <div className="flex flex-col gap-3 py-3">
                  <div className="flex flex-wrap items-center gap-2">
                {/* Status Filter */}
                <div className="relative">
                  <button className="inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-2 rounded-lg bg-black/[0.03] dark:bg-white/5 hover:bg-black/[0.06] dark:hover:bg-white/10 border border-zinc-100/10 dark:border-white/10 text-xs sm:text-sm text-gray-800 dark:text-gray-200">
                    <Filter className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    <span className="hidden sm:inline">Status: {statusFilter}</span>
                    <span className="sm:hidden">{statusFilter}</span>
                    <ChevronDown className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-400" />
                  </button>
                </div>
                {/* Token Filter */}
                <div className="relative">
                  <button className="inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-2 rounded-lg bg-black/[0.03] dark:bg-white/5 hover:bg-black/[0.06] dark:hover:bg-white/10 border border-zinc-100/10 dark:border-white/10 text-xs sm:text-sm text-gray-800 dark:text-gray-200">
                    <Coins className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    <span className="hidden sm:inline">Token: {tokenFilter}</span>
                    <span className="sm:hidden">{tokenFilter}</span>
                    <ChevronDown className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-400" />
                  </button>
                </div>
                <button className="inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-2 rounded-lg bg-zinc-500/10 hover:bg-zinc-500/20 text-xs sm:text-sm border border-zinc-500/20 text-gray-800 dark:text-gray-200">
                  <SortDesc className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline">Sort: {sortBy}</span>
                  <span className="sm:hidden">{sortBy}</span>
                </button>
                <button className="inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-2 rounded-lg bg-zinc-500/10 hover:bg-zinc-500/20 text-xs sm:text-sm border border-zinc-500/20 text-gray-800 dark:text-gray-200">
                  <Calendar className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline">Last 30 days</span>
                  <span className="sm:hidden">30d</span>
                </button>
                  </div>
                </div>

                {/* Payments Table */}
                <div className="overflow-x-auto rounded-xl border border-zinc-100/10 dark:border-white/10">
                  <table className="min-w-full text-sm">
                    <thead className="bg-zinc-950 dark:bg-white/[0.03] text-gray-400 dark:text-gray-300">
                  <tr className="[&>th]:px-3 [&>th]:py-3 [&>th]:font-medium [&>th]:text-left">
                    <th className="w-40">Payment ID</th>
                    <th>Customer</th>
                    <th className="w-32">Amount</th>
                    <th className="w-28">Token</th>
                    <th className="w-32">Status</th>
                    <th className="w-40">Date</th>
                    <th className="w-28 text-right pr-4">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100/10 dark:divide-white/10 bg-black dark:bg-[#0D0D0D]">
                  {displayPayments.map((payment) => (
                      <tr key={payment.id} className="hover:bg-zinc-950 dark:hover:bg-white/[0.03] cursor-pointer">
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-900 dark:text-white">{payment.id}</span>
                          <button 
                            onClick={() => copyToClipboard(payment.id)}
                            className="copy-btn inline-flex items-center justify-center h-7 w-7 rounded-md bg-black/[0.03] dark:bg-white/5 hover:bg-black/[0.06] dark:hover:bg-white/10 border border-zinc-100/10 dark:border-white/10"
                          >
                            <Copy className="h-3.5 w-3.5 text-gray-500" />
                          </button>
                        </div>
                      </td>
                      <td className="px-3 py-3 text-gray-500">{payment.customer}</td>
                      <td className="px-3 py-3 text-gray-900 dark:text-white">{payment.amount}</td>
                      <td className="px-3 py-3 text-gray-500">{payment.token}</td>
                      <td className="px-3 py-3">
                        <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs border ${getStatusColor(payment.status)}`}>
                          {getStatusIcon(payment.status)}
                          {payment.status}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-gray-500">{payment.date}</td>
                      <td className="px-3 py-3 text-right pr-4">
                        <button className="inline-flex items-center gap-2 px-2.5 py-1.5 rounded-md bg-black/[0.03] dark:bg-white/5 hover:bg-black/[0.06] dark:hover:bg-white/10 border border-zinc-100/10 dark:border-white/10 text-gray-800 dark:text-gray-200">
                          <ExternalLink className="h-4 w-4" />
                          Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {/* Pagination */}
              <div className="flex items-center justify-between px-3 py-3 bg-black dark:bg-[#0D0D0D] border-t border-zinc-100/10 dark:border-white/10 text-sm">
                <div className="text-gray-500">Showing 1–10 of 48</div>
                <div className="flex items-center gap-1.5">
                  <button className="inline-flex items-center justify-center h-8 w-8 rounded-md bg-black/[0.03] dark:bg-white/5 hover:bg-black/[0.06] dark:hover:bg-white/10 border border-zinc-100/10 dark:border-white/10">
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button className="inline-flex items-center justify-center h-8 w-8 rounded-md bg-black/[0.06] dark:bg-white/10 border border-zinc-500/20 text-gray-900 dark:text-white">1</button>
                  <button className="inline-flex items-center justify-center h-8 w-8 rounded-md bg-black/[0.03] dark:bg-white/5 hover:bg-black/[0.06] dark:hover:bg-white/10 border border-zinc-100/10 dark:border-white/10">2</button>
                  <button className="inline-flex items-center justify-center h-8 w-8 rounded-md bg-black/[0.03] dark:bg-white/5 hover:bg-black/[0.06] dark:hover:bg-white/10 border border-zinc-100/10 dark:border-white/10">3</button>
                  <button className="inline-flex items-center justify-center h-8 w-8 rounded-md bg-black/[0.03] dark:bg-white/5 hover:bg-black/[0.06] dark:hover:bg-white/10 border border-zinc-100/10 dark:border-white/10">
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
              </>
            )}
          </div>
        )}

        {/* Analytics Panel */}
        {activeTab === "dash-analytics" && (
          <div>
            {payments.length === 0 ? (
              <EmptyState 
                type="analytics" 
                onCreateLink={onCreateLink}
              />
            ) : (
              <>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Line Chart */}
              <div className="rounded-xl bg-black dark:bg-[#111111] border border-zinc-100/10 dark:border-white/10 p-4">
                <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-300 dark:text-gray-300">Payments over time</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Last 30 days</div>
                </div>
                <div className="mt-4">
                  {payments.length > 0 ? (
                    <svg viewBox="0 0 300 120" className="w-full h-36">
                      <defs>
                        <linearGradient id="area" x1="0" x2="0" y1="0" y2="1">
                          <stop offset="0%" stopColor="#97F11D" stopOpacity="0.35"></stop>
                          <stop offset="100%" stopColor="#97F11D" stopOpacity="0"></stop>
                        </linearGradient>
                      </defs>
                      {(() => {
                        // Calculate daily revenue for the last 30 days
                        const dailyRevenue = [];
                        const today = new Date();
                        for (let i = 29; i >= 0; i--) {
                          const date = new Date(today);
                          date.setDate(date.getDate() - i);
                          const dateStr = date.toISOString().split('T')[0];
                          
                          const dayPayments = payments.filter((payment: any) => {
                            const paymentDate = new Date(payment.paid_at || payment.created_at);
                            return paymentDate.toISOString().split('T')[0] === dateStr;
                          });
                          
                          const dayRevenue = dayPayments.reduce((sum: number, payment: any) => sum + parseFloat(payment.amount || 0), 0);
                          dailyRevenue.push(dayRevenue);
                        }
                        
                        const maxRevenue = Math.max(...dailyRevenue);
                        const points = dailyRevenue.map((revenue, index) => {
                          const x = (index / (dailyRevenue.length - 1)) * 300;
                          const y = maxRevenue > 0 ? 120 - (revenue / maxRevenue) * 100 : 120;
                          return `${x},${y}`;
                        }).join(' ');
                        
                        return (
                          <>
                            <polyline fill="url(#area)" stroke="none" points={`${points} 300,120 0,120`}></polyline>
                            <polyline fill="none" stroke="#97F11D" strokeWidth="2" points={points}></polyline>
                          </>
                        );
                      })()}
                      <g stroke="#00000022">
                        <line x1="0" y1="120" x2="300" y2="120"></line>
                        <line x1="0" y1="90" x2="300" y2="90"></line>
                        <line x1="0" y1="60" x2="300" y2="60"></line>
                        <line x1="0" y1="30" x2="300" y2="30"></line>
                      </g>
                    </svg>
                  ) : (
                    <div className="flex items-center justify-center h-36 text-gray-400 dark:text-gray-500">
                      <div className="text-center">
                        <div className="text-sm">No payment data yet</div>
                        <div className="text-xs mt-1">Create payment links to see revenue trends</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              {/* Pie Chart */}
              <div className="rounded-xl bg-black dark:bg-[#111111] border border-zinc-100/10 dark:border-white/10 p-4">
                <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-300 dark:text-gray-300">Token distribution</div>
                  <div className="text-xs text-gray-500">USDC, FLOW, USDT</div>
                </div>
                <div className="mt-4 flex items-center justify-center">
                  {(() => {
                    // Calculate token distribution from payments
                    const tokenCounts: { [key: string]: number } = {};
                    payments.forEach((payment: any) => {
                      tokenCounts[payment.token] = (tokenCounts[payment.token] || 0) + 1;
                    });
                    
                    const totalPayments = Object.values(tokenCounts).reduce((sum: number, count: number) => sum + count, 0);
                    
                    if (totalPayments === 0) {
                      return (
                        <div className="text-center text-gray-400 dark:text-gray-500">
                          <div className="text-sm">No token data yet</div>
                        </div>
                      );
                    }
                    
                    const tokens = Object.entries(tokenCounts).map(([token, count]) => ({
                      name: token,
                      count,
                      percentage: (count / totalPayments) * 100,
                      color: token === 'USDC.e' ? '#97F11D' : token === 'FLOW' ? '#60A5FA' : token === 'USDT' ? '#F59E0B' : '#6B7280'
                    }));
                    
                    const circumference = 2 * Math.PI * 44;
                    let offset = 0;
                    
                    return (
                      <>
                        <svg viewBox="0 0 120 120" className="h-36 w-36 -rotate-90">
                          {tokens.map((token, index) => {
                            const strokeDasharray = `${(token.percentage / 100) * circumference} ${circumference}`;
                            const strokeDashoffset = -offset;
                            offset += (token.percentage / 100) * circumference;
                            
                            return (
                              <circle
                                key={index}
                                cx="60"
                                cy="60"
                                r="44"
                                stroke={token.color}
                                strokeWidth="16"
                                strokeDasharray={strokeDasharray}
                                strokeDashoffset={strokeDashoffset}
                                fill="none"
                              />
                            );
                          })}
                        </svg>
                        <div className="mt-3 grid grid-cols-1 gap-2 text-xs text-gray-700 dark:text-gray-300">
                          {tokens.map((token, index) => (
                            <div key={index} className="flex items-center gap-2">
                              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: token.color }}></span>
                              {token.name} ({token.percentage.toFixed(0)}%)
                            </div>
                          ))}
                        </div>
                      </>
                    );
                  })()}
                </div>
              </div>
              {/* Bar Chart */}
              <div className="rounded-xl bg-black dark:bg-[#111111] border border-zinc-100/10 dark:border-white/10 p-4">
                <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-300 dark:text-gray-300">Revenue by customer</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Top 5</div>
                </div>
                <div className="mt-4">
                  {(() => {
                    // Calculate revenue by customer
                    const customerRevenue: { [key: string]: number } = {};
                    payments.forEach((payment: any) => {
                      const customerId = payment.payer_address;
                      customerRevenue[customerId] = (customerRevenue[customerId] || 0) + parseFloat(payment.amount || 0);
                    });
                    
                    const topCustomers = Object.entries(customerRevenue)
                      .map(([customerId, revenue]) => ({
                        id: customerId,
                        name: `Customer ${customerId.slice(0, 6)}...${customerId.slice(-4)}`,
                        revenue
                      }))
                      .sort((a, b) => b.revenue - a.revenue)
                      .slice(0, 5);
                    
                    if (topCustomers.length === 0) {
                      return (
                        <div className="flex items-center justify-center h-36 text-gray-400 dark:text-gray-500">
                          <div className="text-center">
                            <div className="text-sm">No customer data yet</div>
                            <div className="text-xs mt-1">Revenue by customer will appear here</div>
                          </div>
                        </div>
                      );
                    }
                    
                    const maxRevenue = Math.max(...topCustomers.map(c => c.revenue));
                    const barWidth = 280 / topCustomers.length;
                    
                    return (
                      <svg viewBox="0 0 300 120" className="w-full h-36">
                        {topCustomers.map((customer, index) => {
                          const height = maxRevenue > 0 ? (customer.revenue / maxRevenue) * 100 : 0;
                          const x = 10 + (index * barWidth);
                          const y = 120 - height;
                          const opacity = height > 0 ? Math.max(0.3, height / maxRevenue) : 0.1;
                          
                          return (
                            <rect
                              key={customer.id}
                              x={x}
                              y={y}
                              width={barWidth - 2}
                              height={height}
                              fill="#97F11D"
                              opacity={opacity}
                            />
                          );
                        })}
                        <g stroke="#00000022">
                          <line x1="0" y1="120" x2="300" y2="120"></line>
                          <line x1="0" y1="90" x2="300" y2="90"></line>
                          <line x1="0" y1="60" x2="300" y2="60"></line>
                          <line x1="0" y1="30" x2="300" y2="30"></line>
                        </g>
                      </svg>
                    );
                  })()}
                </div>
              </div>
            </div>
            {/* Insights */}
            <div className="mt-4 grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="rounded-xl bg-black dark:bg-[#111111] border border-zinc-100/10 dark:border-white/10 p-4">
                  <div className="text-sm text-gray-300 dark:text-gray-300 mb-2">Top payment links</div>
                <ul className="space-y-2 text-sm">
                  {paymentLinks.slice(0, 3).map((link, index) => (
                    <li key={link.id} className="flex items-center justify-between">
                      <span className="text-gray-700 dark:text-gray-300">{link.product_name}</span>
                      <span className="text-gray-900 dark:text-white">${link.amount}</span>
                    </li>
                  ))}
                  {paymentLinks.length === 0 && (
                    <li className="text-gray-500 dark:text-gray-400 text-sm">No payment links yet</li>
                  )}
                </ul>
              </div>
              <div className="rounded-xl bg-black dark:bg-[#111111] border border-zinc-100/10 dark:border-white/10 p-4">
                  <div className="text-sm text-gray-300 dark:text-gray-300 mb-2">Total payments</div>
                  <div className="text-2xl tracking-tight font-semibold text-gray-100 dark:text-white">{payments.length}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">completed transactions</div>
              </div>
              <div className="rounded-xl bg-black dark:bg-[#111111] border border-zinc-100/10 dark:border-white/10 p-4">
                <div className="text-sm text-gray-300 dark:text-gray-300 mb-2">Success rate</div>
                <div className="text-2xl tracking-tight font-semibold text-gray-100 dark:text-white">
                  {payments.length > 0 ? Math.round((payments.filter(p => p.status === 'completed').length / payments.length) * 100) : 0}%
                </div>
                <div className="text-xs text-[#97F11D] mt-1">payment success</div>
              </div>
            </div>
              </>
            )}
          </div>
        )}

        {/* Links Panel */}
        {activeTab === "dash-links" && (
          <div>
            {paymentLinks.length === 0 ? (
              <EmptyState 
                type="links" 
                onCreateLink={onCreateLink}
              />
            ) : (
              <>
                <div className="flex items-center justify-between py-3">
              <div className="text-sm text-gray-700 dark:text-gray-300">Manage your payment links</div>
              <button 
                onClick={onCreateLink}
                className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-[#97F11D] text-black font-medium hover:brightness-95 border border-[#97F11D]/40"
              >
                <Plus className="h-4 w-4" />
                New Link
              </button>
            </div>
            <div className="overflow-hidden rounded-xl border border-zinc-100/10 dark:border-white/10">
              <table className="min-w-full text-sm">
                <thead className="bg-zinc-950 dark:bg-white/[0.03] text-gray-400 dark:text-gray-300">
                  <tr className="[&>th]:px-3 [&>th]:py-3 [&>th]:font-medium [&>th]:text-left">
                    <th>Link Name</th>
                    <th className="w-28">Token</th>
                    <th className="w-28">Price</th>
                    <th className="w-28">Status</th>
                    <th className="w-32">Created</th>
                    <th className="w-48 text-right pr-4">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100/10 dark:divide-white/10 bg-black dark:bg-[#0D0D0D]">
                  {displayLinks.map((link) => (
                      <tr key={link.id} className="hover:bg-zinc-950 dark:hover:bg-white/[0.03]">
                      <td className="px-3 py-3 text-gray-100 dark:text-white">{link.name}</td>
                      <td className="px-3 py-3 text-gray-300 dark:text-gray-300">{link.token}</td>
                      <td className="px-3 py-3 text-gray-100 dark:text-white">{link.price}</td>
                      <td className="px-3 py-3">
                        <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs border ${
                          link.status === 'active' 
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 border-emerald-500/20'
                            : 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-300 border-yellow-500/20'
                        }`}>
                          {link.status === 'active' ? <Check className="h-3.5 w-3.5" /> : <Pause className="h-3.5 w-3.5" />}
                          {link.status === 'active' ? 'Active' : 'Paused'}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-gray-700 dark:text-gray-300">{link.created}</td>
                      <td className="px-3 py-3 text-right pr-4">
                        <div className="inline-flex gap-2">
                          <button 
                            onClick={() => copyToClipboard(`https://pay.flow/${link.id}`)}
                            className="copy-btn inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-black/[0.03] dark:bg-white/5 hover:bg-black/[0.06] dark:hover:bg-white/10 border border-zinc-100/10 dark:border-white/10 text-gray-800 dark:text-gray-200"
                          >
                            <Copy className="h-4 w-4" />
                            Copy
                          </button>
                          <button 
                            onClick={() => handlePauseResume(link.id, link.status)}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-black/[0.03] dark:bg-white/5 hover:bg-black/[0.06] dark:hover:bg-white/10 border border-zinc-100/10 dark:border-white/10 text-gray-800 dark:text-gray-200"
                          >
                            {link.status === 'active' ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                            {link.status === 'active' ? 'Pause' : 'Resume'}
                          </button>
                          <button 
                            onClick={() => handleDelete(link.id, link.name)}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-black/[0.03] dark:bg-white/5 hover:bg-red-600/10 hover:text-red-700 dark:hover:text-red-300 border border-zinc-500/20 text-gray-800 dark:text-gray-200"
                          >
                            <Trash2 className="h-4 w-4" />
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="px-3 py-3 bg-black dark:bg-[#0D0D0D] border-t border-zinc-100/10 dark:border-white/10 text-sm text-gray-400 dark:text-gray-400">
                Total earned from links: <span className="text-gray-100 dark:text-white">
                  ${payments.reduce((sum, payment) => sum + parseFloat(payment.amount || 0), 0).toFixed(2)}
                </span>
              </div>
            </div>
              </>
            )}
          </div>
        )}
      </div>
    </>
  );
}
