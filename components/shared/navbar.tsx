"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useFlowUser } from "@/components/providers/flow-provider";
import { formatAddress } from "@/lib/utils";

export function Navbar() {
  const { loggedIn, address, logIn, logOut } = useFlowUser();

  return (
    <nav className="border-b border-flow-gray bg-flow-dark">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-2xl font-bold text-flow-green">FlowPay</span>
          </Link>

          <div className="flex items-center gap-4">
            {loggedIn && (
              <Link href="/dashboard">
                <Button variant="ghost" size="sm">
                  Dashboard
                </Button>
              </Link>
            )}
            
            {loggedIn ? (
              <div className="flex items-center gap-2">
                <span className="text-sm text-text-secondary font-mono">
                  {formatAddress(address)}
                </span>
                <Button size="sm" variant="outline" onClick={logOut}>
                  Disconnect
                </Button>
              </div>
            ) : (
              <Button size="sm" onClick={logIn}>
                Connect Wallet
              </Button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

