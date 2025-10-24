"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';

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

export function FlowProviderMainnet({ children }: { children: React.ReactNode }) {
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [fclLoaded, setFclLoaded] = useState(false);

  // Dynamic FCL import to avoid chunk loading issues
  useEffect(() => {
    const loadFCL = async () => {
      try {
        console.log("Loading FCL dynamically...");
        const fcl = await import('@onflow/fcl');
        
        // Configure FCL for mainnet
        fcl.config({
          "app.detail.title": "FlowPay",
          "app.detail.icon": "https://useflowpay.xyz/logo.svg",
          "accessNode.api": "https://rest-mainnet.onflow.org",
          "discovery.wallet": "https://fcl-discovery.onflow.org/authn",
          "discovery.authn.endpoint": "https://fcl-discovery.onflow.org/authn",
          "discovery.wallet.method": "POP/RPC",
          "fcl.limit": 9999,
          "flow.network": "mainnet",
          "walletconnect.projectId": process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "flowpay-demo-project"
        });

        console.log("FCL configured for mainnet");

        // Listen to authentication changes
        fcl.currentUser.subscribe((user: any) => {
          console.log("FCL user changed:", user);
          setUser(user);
          setIsConnected(!!user?.addr);
          setError(null);
        });

        setFclLoaded(true);
        console.log("FCL loaded successfully");
      } catch (err) {
        console.error("Failed to load FCL:", err);
        setError("Failed to load Flow client library");
      }
    };

    loadFCL();
  }, []);

  const connectWallet = async () => {
    if (!fclLoaded) {
      setError("Flow client library not loaded yet");
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      console.log("Connecting to Flow wallet...");
      const fcl = await import('@onflow/fcl');
      await fcl.authenticate();
      console.log("Wallet connection initiated");
    } catch (err: any) {
      console.error("Wallet connection error:", err);
      setError(err.message || "Failed to connect wallet");
    } finally {
      setIsLoading(false);
    }
  };

  const disconnectWallet = async () => {
    if (!fclLoaded) {
      setError("Flow client library not loaded yet");
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      console.log("Disconnecting from Flow wallet...");
      const fcl = await import('@onflow/fcl');
      await fcl.unauthenticate();
      setUser(null);
      setIsConnected(false);
      console.log("Wallet disconnected");
    } catch (err: any) {
      console.error("Wallet disconnection error:", err);
      setError(err.message || "Failed to disconnect wallet");
    } finally {
      setIsLoading(false);
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

export function useFlowMainnet(): FlowContextType {
  const context = useContext(FlowContext);
  if (context === undefined) {
    throw new Error('useFlowMainnet must be used within a FlowProviderMainnet');
  }
  return context;
}
