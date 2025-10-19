"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: "🏠" },
  { name: "Payments", href: "/dashboard/payments", icon: "💵" },
  { name: "Payment Links", href: "/dashboard/links", icon: "🔗" },
  { name: "Customers", href: "/dashboard/customers", icon: "👥" },
  { name: "Analytics", href: "/dashboard/analytics", icon: "📊" },
  { name: "Settings", href: "/dashboard/settings", icon: "⚙️" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="w-60 bg-[#111111] border-r border-white/10 h-screen flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-white/10">
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-[#97F11D] to-[#7ED321] rounded-lg flex items-center justify-center">
            <span className="text-black font-bold text-sm">FP</span>
          </div>
          <span className="text-white font-semibold text-lg">FlowPay</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200",
                    isActive
                      ? "bg-white/10 text-white border-l-4 border-[#97F11D]"
                      : "text-gray-400 hover:text-white hover:bg-white/5"
                  )}
                >
                  <span className="text-lg">{item.icon}</span>
                  <span className="font-medium">{item.name}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-white/10">
        <div className="text-xs text-gray-500 text-center">
          FlowPay v1.0.0
        </div>
      </div>
    </div>
  );
}
