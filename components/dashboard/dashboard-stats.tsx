"use client";

import { Wallet, Link as LinkIcon, Users, Send, DollarSign } from "lucide-react";

interface DashboardStatsProps {
  stats: {
    totalRevenue: number;
    activeLinks: number;
    customers: number;
    transfersSent: number;
  };
  walletBalance?: {
    flow: number;
    usdc: number;
  };
}

export function DashboardStats({ stats, walletBalance }: DashboardStatsProps) {
  return (
    <>
      {/* Total Revenue */}
      <div className="rounded-2xl bg-black border border-white/10 p-4 sm:p-5">
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-400">Total Revenue</div>
          <DollarSign className="h-4 w-4 text-gray-400" />
        </div>
        <div className="mt-3 text-2xl tracking-tight font-semibold text-white">
          ${stats.totalRevenue.toFixed(2)}
        </div>
        <div className="mt-2 text-[#97F11D] text-sm">payments received</div>
      </div>

      {/* Wallet Balance */}
      <div className="rounded-2xl bg-black border border-white/10 p-4 sm:p-5">
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-400">Wallet Balance</div>
          <Wallet className="h-4 w-4 text-gray-400" />
        </div>
        <div className="mt-3 text-2xl tracking-tight font-semibold text-white">
          {walletBalance ? (
            <div className="space-y-1">
              <div>{walletBalance.flow === 0 ? '$0' : `${walletBalance.flow.toFixed(6)} FLOW`}</div>
              <div className="text-lg">{walletBalance.usdc === 0 ? '$0' : `${walletBalance.usdc.toFixed(6)} USDC`}</div>
            </div>
          ) : (
            <div className="text-gray-400">Loading...</div>
          )}
        </div>
        <div className="mt-2 text-[#97F11D] text-sm">Flow blockchain</div>
      </div>

      {/* Active Links */}
      <div className="rounded-2xl bg-black border border-white/10 p-4 sm:p-5">
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-400">Active Links</div>
          <LinkIcon className="h-4 w-4 text-gray-400" />
        </div>
        <div className="mt-3 text-2xl tracking-tight font-semibold text-white">
          {stats.activeLinks}
        </div>
        <div className="mt-2 text-[#97F11D] text-sm">payment links</div>
      </div>

      {/* Customers */}
      <div className="rounded-2xl bg-black border border-white/10 p-4 sm:p-5">
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-400">Customers</div>
          <Users className="h-4 w-4 text-gray-400" />
        </div>
        <div className="mt-3 text-2xl tracking-tight font-semibold text-white">
          {stats.customers}
        </div>
        <div className="mt-2 text-[#97F11D] text-sm">unique customers</div>
      </div>

      {/* Transfers Sent */}
      <div className="rounded-2xl bg-black border border-white/10 p-4 sm:p-5">
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-400">Transfers Sent</div>
          <Send className="h-4 w-4 text-gray-400" />
        </div>
        <div className="mt-3 text-2xl tracking-tight font-semibold text-white">
          {stats.transfersSent}
        </div>
        <div className="mt-2 text-[#97F11D] text-sm">P2P transfers</div>
      </div>
    </>
  );
}
