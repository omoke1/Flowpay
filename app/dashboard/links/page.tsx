"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useFlowUser } from "@/components/providers/flow-provider";
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { formatAmount, formatAddress } from "@/lib/utils";
import { 
  Plus, 
  Copy, 
  Pause, 
  Play, 
  Trash2, 
  Check, 
  PauseCircle,
  ExternalLink 
} from "lucide-react";

export default function LinksPage() {
  const router = useRouter();
  const { loggedIn, address, logOut } = useFlowUser();
  const [loading, setLoading] = useState(true);
  const [paymentLinks, setPaymentLinks] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);

  useEffect(() => {
    if (!loggedIn) {
      router.push("/");
      return;
    }

    const fetchLinks = async () => {
      try {
        // Fetch payment links
        const linksResponse = await fetch(`/api/payment-links?merchantId=${address}`);
        const linksData = await linksResponse.json();
        setPaymentLinks(linksData.paymentLinks || []);
        
        // Fetch payments to calculate total earned
        const paymentsResponse = await fetch(`/api/payments?merchantId=${address}`);
        const paymentsData = await paymentsResponse.json();
        setPayments(paymentsData.payments || []);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLinks();
  }, [loggedIn, address, router]);

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
    <div className="min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-200 font-sans antialiased">
      {/* Mobile Sidebar Backdrop */}
      <div id="mobile-backdrop" className="fixed inset-0 z-30 hidden bg-black/60 backdrop-blur-sm lg:hidden"></div>

      {/* Sidebar */}
      <DashboardSidebar activeItem="links" onLogout={logOut} />

      {/* Main */}
      <div className="lg:pl-60">
        {/* Top Bar */}
        <DashboardHeader 
          title="Payment Links" 
          onSearch={() => {}} 
          onCreatePaymentLink={() => router.push("/dashboard/create")}
          address={address}
        />

        {/* Content Wrapper */}
        <main className="px-4 sm:px-6 lg:px-8 py-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h2 className="text-xl tracking-tight font-semibold text-gray-900 dark:text-white">Payment Links</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">Create, manage and track links</p>
            </div>
            <button 
              onClick={() => router.push("/dashboard/create")}
              className="inline-flex items-center gap-2 rounded-lg px-3.5 py-2.5 bg-[#97F11D] text-black font-medium hover:brightness-95 border border-[#97F11D]/40 w-full sm:w-auto justify-center"
            >
              <Plus className="h-4 w-4" />
              Create Link
            </button>
          </div>

          {/* Links Table */}
          <div className="rounded-2xl border border-zinc-900/10 dark:border-white/10 bg-white dark:bg-gray-900">
            <div className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">All links</div>
            <div className="overflow-hidden rounded-b-2xl border-t border-zinc-900/10 dark:border-white/10">
              {/* Desktop Table */}
              <div className="hidden lg:block">
                <table className="min-w-full text-sm">
                  <thead className="bg-zinc-50 dark:bg-white/[0.03] text-gray-600 dark:text-gray-300">
                    <tr className="[&>th]:px-3 [&>th]:py-3 [&>th]:font-medium [&>th]:text-left">
                      <th>Link Name</th>
                      <th className="w-28">Token</th>
                      <th className="w-28">Price</th>
                      <th className="w-28">Status</th>
                      <th className="w-32">Created</th>
                      <th className="w-48 text-right pr-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-900/10 dark:divide-white/10 bg-white dark:bg-gray-900">
                    {paymentLinks.map((link) => (
                      <tr key={link.id} className="hover:bg-zinc-50 dark:hover:bg-white/[0.03]">
                        <td className="px-3 py-3 text-gray-900 dark:text-white">{link.product_name}</td>
                        <td className="px-3 py-3 text-gray-700 dark:text-gray-300">{link.token}</td>
                        <td className="px-3 py-3 text-gray-900 dark:text-white">${link.amount}</td>
                        <td className="px-3 py-3">
                          <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs border ${
                            link.status === 'active' 
                              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 border-emerald-500/20'
                              : 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-300 border-yellow-500/20'
                          }`}>
                            {link.status === 'active' ? <Check className="h-3.5 w-3.5" /> : <PauseCircle className="h-3.5 w-3.5" />}
                            {link.status === 'active' ? 'Active' : 'Paused'}
                          </span>
                        </td>
                        <td className="px-3 py-3 text-gray-700 dark:text-gray-300">
                          {new Date(link.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </td>
                        <td className="px-3 py-3 text-right pr-4">
                          <div className="inline-flex gap-2">
                            <button 
                              onClick={() => copyToClipboard(`${window.location.origin}/pay/${link.id}`)}
                              className="copy-btn inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-black/[0.03] dark:bg-white/5 hover:bg-black/[0.06] dark:hover:bg-white/10 border border-zinc-900/10 dark:border-white/10 text-gray-800 dark:text-gray-200"
                            >
                              <Copy className="h-4 w-4" />
                              Copy
                            </button>
                            <button 
                              onClick={() => toggleLinkStatus(link.id, link.status)}
                              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-black/[0.03] dark:bg-white/5 hover:bg-black/[0.06] dark:hover:bg-white/10 border border-zinc-900/10 dark:border-white/10 text-gray-800 dark:text-gray-200"
                            >
                              {link.status === 'active' ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                              {link.status === 'active' ? 'Pause' : 'Resume'}
                            </button>
                            <button 
                              onClick={() => deleteLink(link.id)}
                              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-black/[0.03] dark:bg-white/5 hover:bg-red-600/10 hover:text-red-700 dark:hover:text-red-300 border border-zinc-900/10 dark:border-white/10 text-gray-800 dark:text-gray-200"
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
                  <div key={link.id} className="p-4 border-b border-zinc-900/10 dark:border-white/10 last:border-b-0">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900 dark:text-white">{link.product_name}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">${link.amount} {link.token}</p>
                      </div>
                      <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs border ${
                        link.status === 'active' 
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 border-emerald-500/20'
                          : 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-300 border-yellow-500/20'
                      }`}>
                        {link.status === 'active' ? <Check className="h-3.5 w-3.5" /> : <PauseCircle className="h-3.5 w-3.5" />}
                        {link.status === 'active' ? 'Active' : 'Paused'}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                      Created {new Date(link.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => copyToClipboard(`${window.location.origin}/pay/${link.id}`)}
                        className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-md bg-black/[0.03] dark:bg-white/5 hover:bg-black/[0.06] dark:hover:bg-white/10 border border-zinc-900/10 dark:border-white/10 text-gray-800 dark:text-gray-200 text-sm"
                      >
                        <Copy className="h-4 w-4" />
                        Copy
                      </button>
                      <button 
                        onClick={() => toggleLinkStatus(link.id, link.status)}
                        className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-md bg-black/[0.03] dark:bg-white/5 hover:bg-black/[0.06] dark:hover:bg-white/10 border border-zinc-900/10 dark:border-white/10 text-gray-800 dark:text-gray-200 text-sm"
                      >
                        {link.status === 'active' ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                        {link.status === 'active' ? 'Pause' : 'Resume'}
                      </button>
                      <button 
                        onClick={() => deleteLink(link.id)}
                        className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-md bg-black/[0.03] dark:bg-white/5 hover:bg-red-600/10 hover:text-red-700 dark:hover:text-red-300 border border-zinc-900/10 dark:border-white/10 text-gray-800 dark:text-gray-200 text-sm"
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="px-3 py-3 bg-white dark:bg-gray-900 border-t border-zinc-900/10 dark:border-white/10 text-sm text-gray-600 dark:text-gray-400">
                Total earned from links: <span className="text-gray-900 dark:text-white">
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
