"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import * as fcl from '@onflow/fcl';

// Minimal Flow context interface
interface FlowContextType {
  isConnected: boolean;
  isLoading: boolean;
  user: any;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => Promise<void>;
  setUserDirectly: (userData: any) => void;
  error: string | null;
}

const FlowContext = createContext<FlowContextType | undefined>(undefined);

// Minimal Flow provider with minimal FCL configuration
export function FlowProviderMinimal({ children }: { children: React.ReactNode }) {
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // Minimal FCL configuration - only essential settings
  useEffect(() => {
    try {
      // Force mainnet configuration with strict mainnet enforcement
      fcl.config({
        "app.detail.title": "FlowPay",
        "app.detail.icon": "https://useflowpay.xyz/logo.svg",
        "accessNode.api": "https://rest-mainnet.onflow.org",
        "discovery.wallet": "https://fcl-discovery.onflow.org/authn",
        "discovery.wallet.method": "POP/RPC",
        "fcl.limit": 9999,
        "0xFlowToken": "0x1654653399040a61",
        "0xFungibleToken": "0xf233dcee88fe0abe",
        "0xUSDCFlow": "0xf1ab99c82dee3526",
        // Force mainnet - prevent testnet fallback
        "flow.network": "mainnet",
        "fcl.mainnet": "https://rest-mainnet.onflow.org"
      });

      // Additional mainnet enforcement
      fcl.config({
        "discovery.wallet.include": ["https://fcl-discovery.onflow.org/authn"],
        "discovery.wallet.method": "POP/RPC"
      });

      // Listen to authentication changes
      fcl.currentUser.subscribe((user: any) => {
        setUser(user);
        setIsConnected(!!user?.addr);
        setError(null);
      });
    } catch (err) {
      console.error("Flow configuration error:", err);
      setError("Flow configuration failed");
    }
  }, []);

  const connectWallet = async () => {
    try {
      setIsLoading(true);
      setError(null);
      await fcl.authenticate();
    } catch (err) {
      console.error("Wallet connection error:", err);
      setError("Failed to connect wallet");
    } finally {
      setIsLoading(false);
    }
  };

  const disconnectWallet = async () => {
    try {
      await fcl.unauthenticate();
      setUser(null);
      setIsConnected(false);
      setError(null);
    } catch (err) {
      console.error("Wallet disconnection error:", err);
      setError("Failed to disconnect wallet");
    }
  };

  const setUserDirectly = (userData: any) => {
    console.log("Setting user directly:", userData);
    setUser(userData);
    setIsConnected(true);
    setError(null);
  };

  const value: FlowContextType = {
    isConnected,
    isLoading,
    user,
    connectWallet,
    disconnectWallet,
    setUserDirectly,
    error
  };

  return (
    <FlowContext.Provider value={value}>
      {children}
    </FlowContext.Provider>
  );
}

// Hook to use the minimal Flow context
export function useFlowMinimal(): FlowContextType {
  const context = useContext(FlowContext);
  if (context === undefined) {
    throw new Error('useFlowMinimal must be used within a FlowProviderMinimal');
  }
  return context;
}
