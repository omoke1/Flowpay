"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useFlowMainnet } from "@/components/providers/flow-provider-mainnet";
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { formatAmount, formatAddress } from "@/lib/utils";
import { getUserAddress } from "@/lib/utils";
import { 
  Plus, 
  Copy, 
  Pause, 
  Play, 
  Trash2,
  ExternalLink,
  Check,
  X,
  Clock
} from "lucide-react";

export default function LinksPage() {
  const router = useRouter();
  const { isConnected, user, disconnectWallet } = useFlowMainnet();
  const [loading, setLoading] = useState(true);
  const [paymentLinks, setPaymentLinks] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);

  // Status helper functions (matching dashboard styling)
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <Check className="h-3.5 w-3.5" />;
      case "paused":
        return <X className="h-3.5 w-3.5" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 border-emerald-500/20";
      case "paused":
        return "bg-red-500/10 text-red-700 dark:text-red-300 border-red-500/20";
      default:
        return "bg-gray-500/10 text-gray-700 dark:text-gray-300 border-gray-500/20";
    }
  };

  // Get user address using utility function
  const userAddress = getUserAddress(user);

  useEffect(() => {
    if (!isConnected) {
      router.push("/");
      return;
    }

    const fetchLinks = async () => {
      try {
        if (!userAddress) {
          console.error("No user address found");
          return;
        }
        // Fetch payment links
        const linksResponse = await fetch(`/api/payment-links?merchantId=${userAddress}`);
        const linksData = await linksResponse.json();
        setPaymentLinks(linksData.paymentLinks || []);
        
        // Fetch payments to calculate total earned
        const paymentsResponse = await fetch(`/api/payments?merchantId=${userAddress}`);
        const paymentsData = await paymentsResponse.json();
        setPayments(paymentsData.payments || []);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLinks();
  }, [isConnected, userAddress, router]);

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      // You could add a toast notification here
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  const toggleLinkStatus = async (linkId: string, currentStatus: string) => {
    // This would call an API to update the link status
    console.log(`Toggling link ${linkId} from ${currentStatus}`);
  };

  const deleteLink = async (linkId: string) => {
    if (confirm('Are you sure you want to delete this payment link?')) {
      // This would call an API to delete the link
      console.log(`Deleting link ${linkId}`);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-950 text-white">
        <p>Loading payment links...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black dark:bg-[#0A0A0A] text-gray-900 dark:text-gray-200 font-sans antialiased">
      {/* Mobile Sidebar Backdrop */}
      <div id="mobile-backdrop" className="fixed inset-0 z-30 hidden bg-black/60 backdrop-blur-sm lg:hidden"></div>

      {/* Sidebar */}
      <DashboardSidebar activeItem="links" onLogout={disconnectWallet} />

      {/* Main */}
      <div className="lg:pl-60">
        {/* Top Bar */}
        <DashboardHeader 
          title="Payment Links" 
          onSearch={() => {}} 
          onCreatePaymentLink={() => router.push("/dashboard/create")}
          address={userAddress}
        />

        {/* Content Wrapper */}
        <main className="px-4 sm:px-6 lg:px-8 py-6 space-y-8">
          {/* Summary Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total Links */}
            <div className="rounded-2xl bg-black dark:bg-[#111111] border border-zinc-100/10 dark:border-white/10 p-4 sm:p-5">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-500 dark:text-gray-400">Total Links</div>
                <svg className="h-4 w-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
              </div>
              <div className="mt-3 text-2xl tracking-tight font-semibold text-gray-100 dark:text-white">
                {paymentLinks.length}
              </div>
              <div className="mt-2 text-[#97F11D] text-sm">payment links</div>
            </div>

            {/* Active Links */}
            <div className="rounded-2xl bg-black dark:bg-[#111111] border border-zinc-100/10 dark:border-white/10 p-4 sm:p-5">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-500 dark:text-gray-400">Active Links</div>
                <svg className="h-4 w-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="mt-3 text-2xl tracking-tight font-semibold text-gray-100 dark:text-white">
                {paymentLinks.filter(l => l.status === 'active').length}
              </div>
              <div className="mt-2 text-[#97F11D] text-sm">currently active</div>
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
              <div className="mt-2 text-[#97F11D] text-sm">from links</div>
            </div>

            {/* Avg Link Value */}
            <div className="rounded-2xl bg-black dark:bg-[#111111] border border-zinc-100/10 dark:border-white/10 p-4 sm:p-5">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-500 dark:text-gray-400">Avg Link Value</div>
                <svg className="h-4 w-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div className="mt-3 text-2xl tracking-tight font-semibold text-gray-100 dark:text-white">
                ${paymentLinks.length > 0 ? (paymentLinks.reduce((sum, l) => sum + parseFloat(l.amount || 0), 0) / paymentLinks.length).toFixed(2) : '0.00'}
              </div>
              <div className="mt-2 text-[#97F11D] text-sm">per link</div>
            </div>
          </div>

          {/* Links Table Card */}
          <div className="rounded-2xl border border-zinc-100/10 dark:border-white/10 bg-black dark:bg-[#0D0D0D] overflow-hidden">
            <div className="px-4 sm:px-6 py-4 border-b border-zinc-100/10 dark:border-white/10">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <h2 className="text-xl tracking-tight font-semibold text-gray-100 dark:text-white">All Payment Links</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Create, manage and track your payment links</p>
                </div>
                <button 
                  onClick={() => router.push("/dashboard/create")}
                  className="inline-flex items-center gap-2 rounded-lg px-3.5 py-2.5 bg-[#97F11D] text-black font-medium hover:brightness-95 border border-[#97F11D]/40 w-full sm:w-auto justify-center"
                >
                  <Plus className="h-4 w-4" />
                  Create Link
                </button>
              </div>
            </div>
            <div className="overflow-hidden">
              {/* Desktop Table */}
              <div className="hidden lg:block">
                <table className="min-w-full text-sm">
                  <thead className="bg-zinc-950 dark:bg-white/[0.03] text-gray-400">
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
                    {paymentLinks.map((link) => (
                      <tr key={link.id} className="hover:bg-zinc-950 dark:hover:bg-white/[0.03]">
                        <td className="px-3 py-3 text-gray-100 dark:text-white">{link.product_name}</td>
                        <td className="px-3 py-3 text-gray-300 dark:text-gray-300">{link.token}</td>
                        <td className="px-3 py-3 text-gray-100 dark:text-white">${link.amount}</td>
                        <td className="px-3 py-3">
                          <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs border ${getStatusColor(link.status)}`}>
                            {getStatusIcon(link.status)}
                            {link.status === 'active' ? 'Active' : 'Paused'}
                          </span>
                        </td>
                        <td className="px-3 py-3 text-gray-300 dark:text-gray-300">
                          {new Date(link.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </td>
                        <td className="px-3 py-3 text-right pr-4">
                          <div className="inline-flex gap-2">
                            <button 
                              onClick={() => copyToClipboard(`${window.location.origin}/pay/${link.id}`)}
                              className="copy-btn inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-black/[0.03] dark:bg-white/5 hover:bg-black/[0.06] dark:hover:bg-white/10 border border-zinc-100/10 dark:border-white/10 text-gray-200 dark:text-gray-200"
                            >
                              <Copy className="h-4 w-4" />
                              Copy
                            </button>
                            <button 
                              onClick={() => toggleLinkStatus(link.id, link.status)}
                              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-black/[0.03] dark:bg-white/5 hover:bg-black/[0.06] dark:hover:bg-white/10 border border-zinc-100/10 dark:border-white/10 text-gray-200 dark:text-gray-200"
                            >
                              {link.status === 'active' ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                              {link.status === 'active' ? 'Pause' : 'Resume'}
                            </button>
                            <button 
                              onClick={() => deleteLink(link.id)}
                              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-black/[0.03] dark:bg-white/5 hover:bg-red-600/10 hover:text-red-300 border border-zinc-100/10 dark:border-white/10 text-gray-200 dark:text-gray-200"
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
              </div>
              
              {/* Mobile Cards */}
              <div className="lg:hidden">
                {paymentLinks.map((link) => (
                  <div key={link.id} className="p-4 border-b border-zinc-100/10 dark:border-white/10 last:border-b-0">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-100 dark:text-white">{link.product_name}</h3>
                        <p className="text-sm text-gray-300 dark:text-gray-300">${link.amount} {link.token}</p>
                      </div>
                      <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs border ${getStatusColor(link.status)}`}>
                        {getStatusIcon(link.status)}
                        {link.status === 'active' ? 'Active' : 'Paused'}
                      </span>
                    </div>
                    <div className="text-xs text-gray-400 dark:text-gray-400 mb-3">
                      Created {new Date(link.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => copyToClipboard(`${window.location.origin}/pay/${link.id}`)}
                        className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-md bg-black/[0.03] dark:bg-white/5 hover:bg-black/[0.06] dark:hover:bg-white/10 border border-zinc-100/10 dark:border-white/10 text-gray-200 dark:text-gray-200 text-sm"
                      >
                        <Copy className="h-4 w-4" />
                        Copy
                      </button>
                      <button 
                        onClick={() => toggleLinkStatus(link.id, link.status)}
                        className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-md bg-black/[0.03] dark:bg-white/5 hover:bg-black/[0.06] dark:hover:bg-white/10 border border-zinc-100/10 dark:border-white/10 text-gray-200 dark:text-gray-200 text-sm"
                      >
                        {link.status === 'active' ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                        {link.status === 'active' ? 'Pause' : 'Resume'}
                      </button>
                      <button 
                        onClick={() => deleteLink(link.id)}
                        className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-md bg-black/[0.03] dark:bg-white/5 hover:bg-red-600/10 hover:text-red-300 border border-zinc-100/10 dark:border-white/10 text-gray-200 dark:text-gray-200 text-sm"
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="px-3 py-3 bg-black dark:bg-[#0D0D0D] border-t border-zinc-100/10 dark:border-white/10 text-sm text-gray-400">
                Total earned from links: <span className="text-gray-100 dark:text-white">
                  ${payments.reduce((sum, payment) => sum + parseFloat(payment.amount || 0), 0).toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
