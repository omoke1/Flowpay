"use client";

import { Wallet, Link as LinkIcon, Users, Zap } from "lucide-react";

interface DashboardStatsProps {
  stats: {
    totalRevenue: number;
    activeLinks: number;
    customers: number;
    avgPaymentTime: string;
  };
}

export function DashboardStats({ stats }: DashboardStatsProps) {
  return (
    <>
      {/* Total Revenue */}
      <div className="rounded-2xl bg-white dark:bg-[#111111] border border-zinc-900/10 dark:border-white/10 p-4 sm:p-5">
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-500 dark:text-gray-400">Total Revenue</div>
          <Wallet className="h-4 w-4 text-gray-400" />
        </div>
        <div className="mt-3 text-2xl tracking-tight font-semibold text-gray-900 dark:text-white">
          ${stats.totalRevenue.toFixed(2)}
        </div>
        <div className="mt-2 text-[#97F11D] text-sm">+12.3% WoW</div>
      </div>

      {/* Active Links */}
      <div className="rounded-2xl bg-white dark:bg-[#111111] border border-zinc-900/10 dark:border-white/10 p-4 sm:p-5">
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-500 dark:text-gray-400">Active Links</div>
          <LinkIcon className="h-4 w-4 text-gray-400" />
        </div>
        <div className="mt-3 text-2xl tracking-tight font-semibold text-gray-900 dark:text-white">
          {stats.activeLinks}
        </div>
        <div className="mt-2 text-[#97F11D] text-sm">2 paused</div>
      </div>

      {/* Customers */}
      <div className="rounded-2xl bg-white dark:bg-[#111111] border border-zinc-900/10 dark:border-white/10 p-4 sm:p-5">
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-500 dark:text-gray-400">Customers</div>
          <Users className="h-4 w-4 text-gray-400" />
        </div>
        <div className="mt-3 text-2xl tracking-tight font-semibold text-gray-900 dark:text-white">
          {stats.customers}
        </div>
        <div className="mt-2 text-[#97F11D] text-sm">+5 new this week</div>
      </div>

      {/* Avg Payment Time */}
      <div className="rounded-2xl bg-white dark:bg-[#111111] border border-zinc-900/10 dark:border-white/10 p-4 sm:p-5">
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-500 dark:text-gray-400">Avg. Payment Time</div>
          <Zap className="h-4 w-4 text-gray-400" />
        </div>
        <div className="mt-3 text-2xl tracking-tight font-semibold text-gray-900 dark:text-white">
          {stats.avgPaymentTime}
        </div>
        <div className="mt-2 text-[#97F11D] text-sm">-0.4s vs last week</div>
      </div>
    </>
  );
}
