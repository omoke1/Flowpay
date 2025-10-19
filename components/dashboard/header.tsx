"use client";

import Link from "next/link";
import { useFlowUser } from "@/components/providers/flow-provider";
import { useState } from "react";

interface HeaderProps {
  title: string;
  showCreateButton?: boolean;
}

export function Header({ title, showCreateButton = true }: HeaderProps) {
  const { address, logOut } = useFlowUser();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  return (
    <header className="bg-transparent border-b border-white/10 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Title */}
        <h1 className="text-2xl font-bold text-white">{title}</h1>

        {/* Right side */}
        <div className="flex items-center gap-4">
          {/* Search bar */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search payments..."
              className="bg-white/5 border border-white/10 rounded-lg px-4 py-2 pl-10 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#97F11D]/50 focus:border-[#97F11D]"
            />
            <svg
              className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>

          {/* Create Payment Link Button */}
          {showCreateButton && (
            <Link
              href="/dashboard/create"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-[#97F11D] to-[#7ED321] text-black px-4 py-2 rounded-lg font-medium transition-all hover:scale-105"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Create Payment Link
            </Link>
          )}

          {/* User Menu */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-lg px-4 py-2 hover:bg-white/10 transition-colors"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-[#97F11D] to-[#7ED321] rounded-full flex items-center justify-center">
                <span className="text-black font-bold text-sm">
                  {address ? address.slice(0, 2).toUpperCase() : "U"}
                </span>
              </div>
              <div className="text-left">
                <div className="text-white text-sm font-medium">
                  {address ? formatAddress(address) : "User"}
                </div>
                <div className="text-gray-400 text-xs">Flow Wallet</div>
              </div>
              <svg
                className="w-4 h-4 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>

            {/* Dropdown Menu */}
            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-[#111111] border border-white/10 rounded-lg shadow-lg z-50">
                <div className="py-2">
                  <Link
                    href="/dashboard/settings"
                    className="flex items-center gap-3 px-4 py-2 text-gray-300 hover:text-white hover:bg-white/5 transition-colors"
                    onClick={() => setShowUserMenu(false)}
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                    Settings
                  </Link>
                  <button
                    onClick={() => {
                      logOut();
                      setShowUserMenu(false);
                    }}
                    className="flex items-center gap-3 px-4 py-2 text-gray-300 hover:text-white hover:bg-white/5 transition-colors w-full text-left"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                      />
                    </svg>
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
