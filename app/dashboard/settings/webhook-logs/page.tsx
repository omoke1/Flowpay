"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useFlowProduction } from "@/components/providers/flow-provider-production";
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { ArrowLeft, Clock, CheckCircle, XCircle, AlertCircle } from "lucide-react";

interface WebhookLog {
  id: string;
  event_type: string;
  payload: any;
  response_status: number;
  response_body: string;
  created_at: string;
}

export default function WebhookLogsPage() {
  const router = useRouter();
  const { isConnected, user, disconnectWallet } = useFlowProduction();
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState<WebhookLog[]>([]);

  useEffect(() => {
    if (!isConnected) {
      router.push("/");
      return;
    }
    fetchWebhookLogs();
  }, [loggedIn, router, address]);

  const fetchWebhookLogs = async () => {
    try {
      const response = await fetch(`/api/settings/webhook-logs?walletAddress=${address}`);
      const data = await response.json();
      setLogs(data.logs || []);
    } catch (error) {
      console.error("Error fetching webhook logs:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: number) => {
    if (status >= 200 && status < 300) {
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    } else if (status >= 400 && status < 500) {
      return <XCircle className="h-4 w-4 text-red-500" />;
    } else {
      return <AlertCircle className="h-4 w-4 text-yellow-500" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-950 text-white">
        <p>Loading webhook logs...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-200 font-sans antialiased">
      {/* Mobile Sidebar Backdrop */}
      <div id="mobile-backdrop" className="fixed inset-0 z-30 hidden bg-black/60 backdrop-blur-sm lg:hidden"></div>

      {/* Sidebar */}
      <DashboardSidebar activeItem="settings" onLogout={disconnectWallet} />

      {/* Main */}
      <div className="lg:pl-60">
        {/* Top Bar */}
        <DashboardHeader 
          title="Webhook Logs" 
          onSearch={() => {}} 
          onCreatePaymentLink={() => router.push("/dashboard/create")}
          address={address}
          onLogout={disconnectWallet}
        />

        {/* Content Wrapper */}
        <main className="px-4 sm:px-6 lg:px-8 py-6 space-y-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push("/dashboard/settings")}
              className="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Settings
            </button>
          </div>

          <div>
            <h2 className="text-xl tracking-tight font-semibold text-gray-900 dark:text-white">Webhook Logs</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">View all webhook events and responses</p>
          </div>

          {logs.length === 0 ? (
            <div className="rounded-2xl bg-white dark:bg-gray-900 border border-zinc-900/10 dark:border-white/10 p-8 text-center">
              <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No webhook logs yet</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Webhook events will appear here when they are triggered.
              </p>
            </div>
          ) : (
            <div className="rounded-2xl bg-white dark:bg-gray-900 border border-zinc-900/10 dark:border-white/10 overflow-hidden">
              {/* Desktop Table */}
              <div className="hidden lg:block">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-black/[0.02] dark:bg-white/5 border-b border-zinc-900/10 dark:border-white/10">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                          Event
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                          Time
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                          Response
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-900/10 dark:divide-white/10">
                      {logs.map((log) => (
                        <tr key={log.id} className="hover:bg-black/[0.02] dark:hover:bg-white/5">
                          <td className="px-4 py-3 text-sm">
                            <div className="font-medium text-gray-900 dark:text-white">
                              {log.event_type}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm">
                            <div className="flex items-center gap-2">
                              {getStatusIcon(log.response_status)}
                              <span className="text-gray-600 dark:text-gray-400">
                                {log.response_status}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                            {formatDate(log.created_at)}
                          </td>
                          <td className="px-4 py-3 text-sm">
                            <div className="max-w-xs truncate text-gray-600 dark:text-gray-400">
                              {log.response_body || "No response"}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              
              {/* Mobile Cards */}
              <div className="lg:hidden">
                {logs.map((log) => (
                  <div key={log.id} className="p-4 border-b border-zinc-900/10 dark:border-white/10 last:border-b-0">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900 dark:text-white text-sm">{log.event_type}</h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {formatDate(log.created_at)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(log.response_status)}
                        <span className="text-xs text-gray-600 dark:text-gray-400">
                          {log.response_status}
                        </span>
                      </div>
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      Response: {log.response_body || "No response"}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
