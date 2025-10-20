"use client";

import { useState } from "react";

interface Payment {
  id: string;
  customer: string;
  amount: string;
  token: string;
  status: "completed" | "failed" | "pending";
  date: string;
  hash?: string;
}

interface PaymentsTableProps {
  payments: Payment[];
}

export function PaymentsTable({ payments }: PaymentsTableProps) {
  const [sortBy, setSortBy] = useState<keyof Payment>("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  const getStatusIcon = (status: Payment["status"]) => {
    switch (status) {
      case "completed":
        return "✅";
      case "failed":
        return "❌";
      case "pending":
        return "🕓";
      default:
        return "❓";
    }
  };

  const getStatusColor = (status: Payment["status"]) => {
    switch (status) {
      case "completed":
        return "text-[#97F11D]";
      case "failed":
        return "text-red-400";
      case "pending":
        return "text-yellow-400";
      default:
        return "text-gray-400";
    }
  };

  const handleSort = (column: keyof Payment) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortOrder("desc");
    }
  };

  const filteredPayments = payments.filter(
    (payment) => filterStatus === "all" || payment.status === filterStatus
  );

  const sortedPayments = [...filteredPayments].sort((a, b) => {
    const aValue = a[sortBy];
    const bValue = b[sortBy];
    
    if (typeof aValue === "string" && typeof bValue === "string") {
      return sortOrder === "asc" 
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }
    
    return 0;
  });

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // You could add a toast notification here
  };

  return (
    <div className="bg-black dark:bg-[#0D0D0D] border border-zinc-100/10 dark:border-white/10 rounded-2xl overflow-hidden">
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-100 dark:text-white">Recent Payments</h2>
          <div className="flex items-center gap-4">
            {/* Status Filter */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-black/[0.03] dark:bg-white/5 border border-zinc-100/10 dark:border-white/10 rounded-lg px-3 py-2 text-gray-100 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#97F11D]/50"
            >
              <option value="all">All Status</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Desktop Table */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="w-full">
          <thead className="bg-zinc-950 dark:bg-white/[0.03]">
            <tr>
              <th className="px-6 py-4 text-left">
                <button
                  onClick={() => handleSort("id")}
                  className="flex items-center gap-2 text-gray-400 text-sm font-medium hover:text-white transition-colors"
                >
                  Payment ID
                  {sortBy === "id" && (
                    <span className="text-[#97F11D]">
                      {sortOrder === "asc" ? "↑" : "↓"}
                    </span>
                  )}
                </button>
              </th>
              <th className="px-6 py-4 text-left">
                <button
                  onClick={() => handleSort("customer")}
                  className="flex items-center gap-2 text-gray-400 text-sm font-medium hover:text-white transition-colors"
                >
                  Customer
                  {sortBy === "customer" && (
                    <span className="text-[#97F11D]">
                      {sortOrder === "asc" ? "↑" : "↓"}
                    </span>
                  )}
                </button>
              </th>
              <th className="px-6 py-4 text-left">
                <button
                  onClick={() => handleSort("amount")}
                  className="flex items-center gap-2 text-gray-400 text-sm font-medium hover:text-white transition-colors"
                >
                  Amount
                  {sortBy === "amount" && (
                    <span className="text-[#97F11D]">
                      {sortOrder === "asc" ? "↑" : "↓"}
                    </span>
                  )}
                </button>
              </th>
              <th className="px-6 py-4 text-left">
                <button
                  onClick={() => handleSort("token")}
                  className="flex items-center gap-2 text-gray-400 text-sm font-medium hover:text-white transition-colors"
                >
                  Token
                  {sortBy === "token" && (
                    <span className="text-[#97F11D]">
                      {sortOrder === "asc" ? "↑" : "↓"}
                    </span>
                  )}
                </button>
              </th>
              <th className="px-6 py-4 text-left">
                <button
                  onClick={() => handleSort("status")}
                  className="flex items-center gap-2 text-gray-400 text-sm font-medium hover:text-white transition-colors"
                >
                  Status
                  {sortBy === "status" && (
                    <span className="text-[#97F11D]">
                      {sortOrder === "asc" ? "↑" : "↓"}
                    </span>
                  )}
                </button>
              </th>
              <th className="px-6 py-4 text-left">
                <button
                  onClick={() => handleSort("date")}
                  className="flex items-center gap-2 text-gray-400 text-sm font-medium hover:text-white transition-colors"
                >
                  Date
                  {sortBy === "date" && (
                    <span className="text-[#97F11D]">
                      {sortOrder === "asc" ? "↑" : "↓"}
                    </span>
                  )}
                </button>
              </th>
              <th className="px-6 py-4 text-left text-gray-400 text-sm font-medium">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {sortedPayments.map((payment) => (
              <tr key={payment.id} className="hover:bg-white/5 transition-colors">
                <td className="px-6 py-4">
                  <span className="text-white font-mono text-sm">
                    #{payment.id}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-white">@{payment.customer}</span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-white font-semibold">{payment.amount}</span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-gray-300">{payment.token}</span>
                </td>
                <td className="px-6 py-4">
                  <span className={`flex items-center gap-2 ${getStatusColor(payment.status)}`}>
                    {getStatusIcon(payment.status)}
                    <span className="capitalize">{payment.status}</span>
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-gray-300">{payment.date}</span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    {payment.hash && (
                      <button
                        onClick={() => copyToClipboard(payment.hash!)}
                        className="text-gray-400 hover:text-white transition-colors"
                        title="Copy transaction hash"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                      </button>
                    )}
                    <button
                      className="text-gray-400 hover:text-white transition-colors"
                      title="View details"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
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
        {sortedPayments.map((payment) => (
          <div key={payment.id} className="p-4 border-b border-white/10 last:border-b-0">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h3 className="font-medium text-white text-sm">@{payment.customer}</h3>
                <p className="text-xs text-gray-400 mt-1">
                  ID: #{payment.id}
                </p>
                <p className="text-sm text-white font-medium mt-1">
                  {payment.amount} {payment.token}
                </p>
              </div>
              <span className={`flex items-center gap-2 ${getStatusColor(payment.status)}`}>
                {getStatusIcon(payment.status)}
                <span className="capitalize text-sm">{payment.status}</span>
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="text-xs text-gray-400">
                {payment.date}
              </div>
              <div className="flex items-center gap-2">
                {payment.hash && (
                  <button
                    onClick={() => copyToClipboard(payment.hash!)}
                    className="text-gray-400 hover:text-white transition-colors"
                    title="Copy transaction hash"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </button>
                )}
                <button
                  className="text-gray-400 hover:text-white transition-colors"
                  title="View details"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {sortedPayments.length === 0 && (
        <div className="p-12 text-center">
          <div className="text-gray-400 text-lg">No payments found</div>
          <div className="text-gray-500 text-sm mt-2">
            Payments will appear here once customers start using your links
          </div>
        </div>
      )}
    </div>
  );
}
