"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Menu, X, Home, CreditCard, History, Settings, LogOut } from "lucide-react";

interface CustomerPortalLayoutProps {
  children: React.ReactNode;
}

export default function CustomerPortalLayout({ children }: CustomerPortalLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navigation = [
    { name: "Dashboard", href: "/customer-portal", icon: Home },
    { name: "My Subscriptions", href: "/customer-portal/subscriptions", icon: CreditCard },
    { name: "Billing History", href: "/customer-portal/billing", icon: History },
    { name: "Account Settings", href: "/customer-portal/settings", icon: Settings },
  ];

  const handleLogout = () => {
    // Clear customer session
    localStorage.removeItem('customer_token');
    localStorage.removeItem('customer_email');
    router.push('/customer-portal/login');
  };

  // For auth pages (login/register), render a minimal layout without sidebar/top bar
  const isAuthPage = pathname === '/customer-portal/login' || pathname === '/customer-portal/register';

  if (isAuthPage) {
    return (
      <div className="min-h-screen bg-black dark:bg-[#0A0A0A] text-gray-900 dark:text-gray-200 font-sans antialiased">
        {children}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black dark:bg-[#0A0A0A] text-gray-900 dark:text-gray-200 font-sans antialiased">
      {/* Mobile Sidebar Backdrop */}
      <div id="mobile-backdrop" className="fixed inset-0 z-30 hidden bg-black/60 backdrop-blur-sm lg:hidden"></div>

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-60 bg-black dark:bg-[#0D0D0D] border-r border-zinc-100/10 dark:border-white/10 transform ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0`}>
        <div className="flex items-center justify-between h-16 px-4 border-b border-zinc-100/10 dark:border-white/10">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-[#97F11D] rounded-lg flex items-center justify-center">
              <span className="text-black font-bold text-sm">FP</span>
            </div>
            <h1 className="text-lg font-bold text-white">Customer Portal</h1>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-gray-400 hover:text-gray-300"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <nav className="mt-8 px-4">
          <ul className="space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <li key={item.name}>
                  <a
                    href={item.href}
                    className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                      isActive 
                        ? 'bg-[#97F11D]/10 text-[#97F11D] border border-[#97F11D]/20' 
                        : 'text-gray-300 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <Icon className="mr-3 h-4 w-4" />
                    {item.name}
                  </a>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="absolute bottom-0 w-full p-4 border-t border-zinc-100/10 dark:border-white/10">
          <button
            onClick={handleLogout}
            className="flex items-center w-full px-3 py-2 text-sm font-medium text-gray-300 rounded-lg hover:bg-white/5 hover:text-white transition-colors"
          >
            <LogOut className="mr-3 h-4 w-4" />
            Logout
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-60">
        {/* Top bar */}
        <div className="sticky top-0 z-30 bg-black dark:bg-[#0D0D0D] border-b border-zinc-100/10 dark:border-white/10">
          <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-gray-400 hover:text-gray-300"
            >
              <Menu className="h-5 w-5" />
            </button>
            
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-400">
                Welcome back!
              </span>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
