"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useFlowUser } from "@/components/providers/flow-provider";
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { 
  Download, 
  UserPlus, 
  Mail, 
  UserX, 
  Check, 
  Clock 
} from "lucide-react";

export default function CustomersPage() {
  const router = useRouter();
  const { loggedIn, address, logOut } = useFlowUser();
  const [loading, setLoading] = useState(true);
  const [customers, setCustomers] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (!loggedIn) {
      router.push("/");
      return;
    }

    const fetchCustomers = async () => {
      try {
        // Mock customer data for now
        setCustomers([
          {
            id: 'customer_1',
            name: 'Chris V.',
            handle: '@chrisv',
            payments: 12,
            totalSpent: 1240,
            lastSeen: 'Oct 15, 2025',
            status: 'active'
          },
          {
            id: 'customer_2',
            name: 'Sierra F.',
            handle: '@sierra',
            payments: 7,
            totalSpent: 680,
            lastSeen: 'Oct 15, 2025',
            status: 'pending'
          },
          {
            id: 'customer_3',
            name: 'Hiromi A.',
            handle: '@hiromi',
            payments: 3,
            totalSpent: 225,
            lastSeen: 'Oct 14, 2025',
            status: 'active'
          }
        ]);
      } catch (error) {
        console.error("Error fetching customers:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCustomers();
  }, [loggedIn, address, router]);

  const filteredCustomers = customers.filter(customer => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      customer.name?.toLowerCase().includes(query) ||
      customer.handle?.toLowerCase().includes(query)
    );
  });

  const contactCustomer = (customer: any) => {
    // This would open a contact modal or email client
    console.log(`Contacting ${customer.name}`);
  };

  const removeCustomer = (customerId: string) => {
    if (confirm('Are you sure you want to remove this customer?')) {
      // This would call an API to remove the customer
      console.log(`Removing customer ${customerId}`);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0A0A0A] text-white">
        <p>Loading customers...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-[#0A0A0A] text-gray-900 dark:text-gray-200 font-sans antialiased">
      {/* Mobile Sidebar Backdrop */}
      <div id="mobile-backdrop" className="fixed inset-0 z-30 hidden bg-black/60 backdrop-blur-sm lg:hidden"></div>

      {/* Sidebar */}
      <DashboardSidebar activeItem="customers" onLogout={logOut} />

      {/* Main */}
      <div className="lg:pl-60">
        {/* Top Bar */}
        <DashboardHeader 
          title="Customers" 
          onSearch={setSearchQuery} 
          onCreatePaymentLink={() => router.push("/dashboard/create")}
          address={address}
        />

        {/* Content Wrapper */}
        <main className="px-4 sm:px-6 lg:px-8 py-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h2 className="text-xl tracking-tight font-semibold text-gray-900 dark:text-white">Customers</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">Directory of paying users</p>
            </div>
            <div className="flex items-center gap-2">
              <button className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-black/[0.03] dark:bg-white/5 hover:bg-black/[0.06] dark:hover:bg-white/10 border border-zinc-900/10 dark:border-white/10 text-sm text-gray-800 dark:text-gray-200">
                <Download className="h-4 w-4" />
                Export CSV
              </button>
              <button className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-[#97F11D] text-black font-medium hover:brightness-95 border border-[#97F11D]/40">
                <UserPlus className="h-4 w-4" />
                Add Customer
              </button>
            </div>
          </div>

          {/* Customers Table */}
          <div className="rounded-2xl border border-zinc-900/10 dark:border-white/10 bg-white dark:bg-[#0D0D0D]">
            <div className="px-4 py-3 flex items-center gap-2">
              <div className="relative">
                <svg className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input 
                  type="text" 
                  placeholder="Search customers…" 
                  className="w-64 bg-white dark:bg-white/5 border border-zinc-900/10 dark:border-white/10 text-gray-900 dark:text-gray-200 placeholder:text-gray-400 rounded-lg pl-9 pr-3 py-2 outline-none focus:ring-2 focus:ring-[#97F11D]/40 focus:border-[#97F11D]/60"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            <div className="overflow-hidden rounded-b-2xl border-t border-zinc-900/10 dark:border-white/10">
              <table className="min-w-full text-sm">
                <thead className="bg-zinc-50 dark:bg-white/[0.03] text-gray-600 dark:text-gray-300">
                  <tr className="[&>th]:px-3 [&>th]:py-3 [&>th]:font-medium [&>th]:text-left">
                    <th className="w-40">Name</th>
                    <th className="w-36">Handle</th>
                    <th className="w-32">Payments</th>
                    <th className="w-36">Total Spent</th>
                    <th className="w-40">Last Seen</th>
                    <th className="w-32">Status</th>
                    <th className="w-40 text-right pr-4">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-900/10 dark:divide-white/10 bg-white dark:bg-[#0D0D0D]">
                  {filteredCustomers.map((customer) => (
                    <tr key={customer.id} className="hover:bg-zinc-50 dark:hover:bg-white/[0.03]">
                      <td className="px-3 py-3 text-gray-900 dark:text-white">{customer.name}</td>
                      <td className="px-3 py-3 text-gray-700 dark:text-gray-300">{customer.handle}</td>
                      <td className="px-3 py-3 text-gray-900 dark:text-white">{customer.payments}</td>
                      <td className="px-3 py-3 text-gray-900 dark:text-white">${customer.totalSpent.toLocaleString()}</td>
                      <td className="px-3 py-3 text-gray-700 dark:text-gray-300">{customer.lastSeen}</td>
                      <td className="px-3 py-3">
                        <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs border ${
                          customer.status === 'active' 
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 border-emerald-500/20'
                            : 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-300 border-yellow-500/20'
                        }`}>
                          {customer.status === 'active' ? <Check className="h-3.5 w-3.5" /> : <Clock className="h-3.5 w-3.5" />}
                          {customer.status === 'active' ? 'Active' : 'Pending'}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-right pr-4">
                        <div className="inline-flex gap-2">
                          <button 
                            onClick={() => contactCustomer(customer)}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-black/[0.03] dark:bg-white/5 hover:bg-black/[0.06] dark:hover:bg-white/10 border border-zinc-900/10 dark:border-white/10 text-gray-800 dark:text-gray-200"
                          >
                            <Mail className="h-4 w-4" />
                            Contact
                          </button>
                          <button 
                            onClick={() => removeCustomer(customer.id)}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-black/[0.03] dark:bg-white/5 hover:bg-red-600/10 hover:text-red-700 dark:hover:text-red-300 border border-zinc-900/10 dark:border-white/10 text-gray-800 dark:text-gray-200"
                          >
                            <UserX className="h-4 w-4" />
                            Remove
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="flex items-center justify-between px-3 py-3 bg-white dark:bg-[#0D0D0D] border-t border-zinc-900/10 dark:border-white/10 text-sm">
                <div className="text-gray-600 dark:text-gray-400">Showing 1–10 of {filteredCustomers.length}</div>
                <div className="flex items-center gap-1.5">
                  <button className="inline-flex items-center justify-center h-8 w-8 rounded-md bg-black/[0.03] dark:bg-white/5 hover:bg-black/[0.06] dark:hover:bg-white/10 border border-zinc-900/10 dark:border-white/10">
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <button className="inline-flex items-center justify-center h-8 w-8 rounded-md bg-black/[0.06] dark:bg-white/10 border border-zinc-900/10 dark:border-white/10 text-gray-900 dark:text-white">1</button>
                  <button className="inline-flex items-center justify-center h-8 w-8 rounded-md bg-black/[0.03] dark:bg-white/5 hover:bg-black/[0.06] dark:hover:bg-white/10 border border-zinc-900/10 dark:border-white/10">2</button>
                  <button className="inline-flex items-center justify-center h-8 w-8 rounded-md bg-black/[0.03] dark:bg-white/5 hover:bg-black/[0.06] dark:hover:bg-white/10 border border-zinc-900/10 dark:border-white/10">
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
