"use client";

import React, { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import * as fcl from '@onflow/fcl';
import { initializeFlowConfig } from '@/lib/flow-config-official';
import { initializeNetworkCheck, checkFlowNetworkStatus } from '@/lib/network-status';

interface FlowContextType {
  user: any;
  isConnected: boolean;
  loading: boolean;
  error: string | null;
  servicesDown: boolean;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  connectWalletFallback: (address: string) => void;
}

const FlowContext = createContext<FlowContextType | undefined>(undefined);

export function FlowProviderOfficial({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [servicesDown, setServicesDown] = useState(false);

  // Initialize Flow configuration with error handling
  useEffect(() => {
    const initializeFlow = async () => {
      try {
        initializeFlowConfig();
        initializeNetworkCheck();
        
        // Check if Flow services are down
        const networkStatus = await checkFlowNetworkStatus();
        if (!networkStatus.allHealthy) {
          setServicesDown(true);
          setError('Flow services are currently unavailable. Using fallback connection.');
        }
      } catch (error) {
        console.error('Flow configuration error:', error);
        setError('Failed to initialize Flow configuration');
        setServicesDown(true);
      }
    };
    
    initializeFlow();
  }, []);

  // Check if user is actually logged in (has an address)
  const isConnected = !!user && (user.loggedIn || user.addr);
  
  // Debug logging
  console.log("FlowProvider - user:", user);
  console.log("FlowProvider - user.loggedIn:", user?.loggedIn);
  console.log("FlowProvider - isConnected:", isConnected);

  useEffect(() => {
    // Subscribe to user changes with error handling
    let unsubscribe: (() => void) | null = null;
    
    try {
      unsubscribe = fcl.currentUser.subscribe((user: any) => {
        console.log("Flow user data:", user);
        console.log("Flow user data type:", typeof user);
        console.log("Flow user data keys:", user ? Object.keys(user) : 'null');
        setUser(user);
      });
    } catch (error) {
      console.error('Flow user subscription error:', error);
      setError('Failed to subscribe to Flow user state');
    }

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  const connectWallet = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log("Starting wallet connection...");
      // Use FCL to authenticate
      await fcl.authenticate();
      console.log("Wallet connection completed");
    } catch (err: any) {
      console.error("Failed to connect wallet:", err);
      setError(err.message || "Failed to connect wallet. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const disconnectWallet = async () => {
    try {
      setLoading(true);
      console.log("Starting wallet disconnection...");
      await fcl.unauthenticate();
      setUser(null);
      setError(null);
      console.log("Wallet disconnection completed");
    } catch (err: any) {
      console.error("Failed to disconnect wallet:", err);
      setError(err.message || "Failed to disconnect wallet.");
    } finally {
      setLoading(false);
    }
  };

  const connectWalletFallback = (address: string) => {
    try {
      console.log("Connecting wallet via fallback method:", address);
      
      // Create a mock user object for fallback connection
      const fallbackUser = {
        addr: address,
        loggedIn: true,
        fallback: true // Mark as fallback connection
      };
      
      setUser(fallbackUser);
      setError(null);
      setServicesDown(false);
      console.log("Fallback wallet connection successful");
    } catch (err: any) {
      console.error("Failed to connect wallet via fallback:", err);
      setError(err.message || "Failed to connect wallet via fallback.");
    }
  };

  return (
    <FlowContext.Provider
      value={{
        user,
        isConnected,
        loading,
        error,
        servicesDown,
        connectWallet,
        disconnectWallet,
        connectWalletFallback,
      }}
    >
      {children}
    </FlowContext.Provider>
  );
}

export function useFlowOfficial() {
  const context = useContext(FlowContext);
  if (context === undefined) {
    throw new Error('useFlowOfficial must be used within a FlowProviderOfficial');
  }
  return context;
}
