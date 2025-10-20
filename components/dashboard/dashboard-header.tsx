"use client";

import { useState, useEffect } from "react";
import { Search, Plus, Sun, Moon, ChevronDown, Menu, Settings, LogOut } from "lucide-react";
import { formatAddress } from "@/lib/utils";

interface DashboardHeaderProps {
  title: string;
  onSearch: (query: string) => void;
  onCreatePaymentLink: () => void;
  address?: string | null;
  onLogout?: () => void;
}

export function DashboardHeader({ 
  title, 
  onSearch, 
  onCreatePaymentLink, 
  address,
  onLogout
}: DashboardHeaderProps) {
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    // Initialize theme from localStorage or system preference
    const storedTheme = localStorage.getItem('theme') as 'light' | 'dark';
    if (storedTheme) {
      setTheme(storedTheme);
      if (storedTheme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    } else {
      const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const initialTheme = systemDark ? 'dark' : 'light';
      setTheme(initialTheme);
      if (systemDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', newTheme);
  };

  const openSidebar = () => {
    setMobileMenuOpen(true);
    // Dispatch event for sidebar to listen
    window.dispatchEvent(new CustomEvent('openMobileSidebar'));
  };

  return (
    <header className="sticky top-0 z-20 backdrop-blur supports-[backdrop-filter]:bg-white/70 bg-white/95 dark:supports-[backdrop-filter]:bg-gray-950/70 dark:bg-gray-950/90 border-b border-zinc-900/10 dark:border-white/10">
      <div className="px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button 
            onClick={openSidebar}
            className="lg:hidden inline-flex items-center justify-center h-9 w-9 rounded-md text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-black/[0.03] dark:hover:bg-white/5"
          >
            <Menu className="h-4 w-4" />
          </button>
          <h1 className="text-xl sm:text-2xl tracking-tight font-semibold text-gray-900 dark:text-white">
            {title}
          </h1>
        </div>
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Search */}
          <div className="hidden md:block">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
              <input 
                type="text" 
                placeholder="Search payments…" 
                  className="w-72 bg-black dark:bg-white/5 border border-zinc-100/10 dark:border-white/10 text-gray-100 dark:text-gray-200 placeholder:text-gray-400 rounded-lg pl-9 pr-3 py-2 outline-none focus:ring-2 focus:ring-[#97F11D]/40 focus:border-[#97F11D]/60"
                onChange={(e) => onSearch(e.target.value)}
              />
            </div>
          </div>
          
          {/* Actions */}
          <button 
            onClick={onCreatePaymentLink}
            className="inline-flex items-center gap-1.5 sm:gap-2 rounded-lg px-2.5 sm:px-3.5 py-2 sm:py-2.5 bg-[#97F11D] text-black font-medium hover:brightness-95 active:brightness-90 shadow-[0_0_20px_#97F11D40] border border-[#97F11D]/40 text-sm sm:text-base"
          >
            <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">Create Payment Link</span>
            <span className="sm:hidden">Create</span>
          </button>
          
          {/* Theme Toggle */}
          <button 
            onClick={toggleTheme}
            className="hidden sm:inline-flex items-center justify-center h-9 w-9 rounded-md bg-black/[0.03] dark:bg-white/5 hover:bg-black/[0.06] dark:hover:bg-white/10 text-gray-600 dark:text-gray-300 border border-zinc-900/10 dark:border-white/10"
          >
            {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
          </button>
          
          {/* User */}
          <div className="relative">
            <button 
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="inline-flex items-center gap-2 px-2 sm:px-3 py-1.5 rounded-lg hover:bg-black/[0.03] dark:hover:bg-white/5 border border-zinc-900/10 dark:border-white/10"
            >
              <img 
                src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=80&auto=format&fit=crop" 
                className="h-7 w-7 rounded-full object-cover" 
                alt="user" 
              />
              <span className="hidden sm:block text-sm text-gray-800 dark:text-gray-200">
                {address ? formatAddress(address) : "User"}
              </span>
              <ChevronDown className="h-4 w-4 text-gray-400" />
            </button>
            {userMenuOpen && (
              <div className="absolute right-0 mt-2 w-44 rounded-lg bg-white dark:bg-gray-900 border border-zinc-900/10 dark:border-white/10 shadow-lg overflow-hidden">
                <button className="w-full text-left px-3 py-2.5 text-sm hover:bg-black/[0.03] dark:hover:bg-white/5 flex items-center gap-2 text-gray-800 dark:text-gray-200">
                  <Settings className="h-4 w-4" />
                  Settings
                </button>
                <button 
                  onClick={() => {
                    setUserMenuOpen(false);
                    onLogout?.();
                  }}
                  className="w-full text-left px-3 py-2.5 text-sm hover:bg-black/[0.03] dark:hover:bg-white/5 flex items-center gap-2 text-gray-800 dark:text-gray-200"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
