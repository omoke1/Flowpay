"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import {
  Home,
  CreditCard,
  Link as LinkIcon,
  Users,
  BarChart2,
  Settings,
  LogOut,
  X,
} from "lucide-react";

interface DashboardSidebarProps {
  activeItem: string;
  onLogout: () => void;
}

export function DashboardSidebar({ activeItem, onLogout }: DashboardSidebarProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { name: "Dashboard", href: "/dashboard", icon: Home, route: "dashboard" },
    { name: "Payments", href: "/dashboard/payments", icon: CreditCard, route: "payments" },
    { name: "Payment Links", href: "/dashboard/links", icon: LinkIcon, route: "links" },
    { name: "Customers", href: "/dashboard/customers", icon: Users, route: "customers" },
    { name: "Analytics", href: "/dashboard/analytics", icon: BarChart2, route: "analytics" },
    { name: "Settings", href: "/dashboard/settings", icon: Settings, route: "settings" },
  ];

  const closeSidebar = () => setMobileMenuOpen(false);

  useEffect(() => {
    const handleOpenSidebar = () => {
      setMobileMenuOpen(true);
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMobileMenuOpen(false);
      }
    };

    window.addEventListener('openMobileSidebar', handleOpenSidebar);
    window.addEventListener('keydown', handleEscape);

    return () => {
      window.removeEventListener('openMobileSidebar', handleOpenSidebar);
      window.removeEventListener('keydown', handleEscape);
    };
  }, []);

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`fixed inset-y-0 left-0 z-40 w-60 bg-black dark:bg-[#111111] border-r border-zinc-100/10 dark:border-white/10 flex flex-col transition-transform ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Logo */}
        <div className="h-16 px-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-[#97F11D] shadow-[0_0_20px_#97F11D80]"></div>
            <div className="text-gray-100 dark:text-white text-lg tracking-tight font-semibold">FlowPay</div>
          </div>
          <button 
            onClick={closeSidebar}
            className="lg:hidden inline-flex items-center justify-center h-9 w-9 rounded-md text-gray-500 dark:text-gray-400 hover:text-gray-100 dark:hover:text-white hover:bg-black/[0.03] dark:hover:bg-white/5"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Nav */}
        <nav className="px-2 mt-2 flex-1">
          <ul className="space-y-1 text-sm">
            {navItems.map((item) => {
              const isActive = activeItem === item.route;
              return (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className={`group w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-gray-300 dark:text-gray-300 hover:text-gray-100 dark:hover:text-white hover:bg-black/[0.03] dark:hover:bg-white/5 border-l-2 border-transparent ${
                      isActive 
                        ? 'active:border-[#97F11D] active:bg-black/[0.02] dark:active:bg-white/[0.03]' 
                        : ''
                    }`}
                    onClick={closeSidebar}
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.name}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Sidebar Footer */}
        <div className="border-t border-zinc-100/10 dark:border-white/10 p-3">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>v0.9.2</span>
            <button 
              onClick={onLogout}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-black/[0.03] dark:bg-white/5 hover:bg-black/[0.06] dark:hover:bg-white/10 text-gray-300 dark:text-gray-200 border border-zinc-100/10 dark:border-white/10"
            >
              <LogOut className="h-3.5 w-3.5" />
              Logout
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
