"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import * as fcl from '@onflow/fcl';

// Stable Flow Provider that doesn't cause chunk loading issues
interface FlowContextType {
  isConnected: boolean;
  user: any;
  connectWallet: () => Promise<void>;
  disconnect: () => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

const FlowContext = createContext<FlowContextType | undefined>(undefined);

export function FlowProviderStable({ children }: { children: React.ReactNode }) {
  const [isConnected, setIsConnected] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize Flow configuration
  useEffect(() => {
    try {
      // Simple, stable Flow configuration
      fcl.config({
        'accessNode.api': 'https://rest-mainnet.onflow.org',
        'discovery.wallet': 'https://fcl-discovery.onflow.org/authn',
        'discovery.authn.endpoint': 'https://fcl-discovery.onflow.org/authn',
        'app.detail.title': 'FlowPay',
        'app.detail.icon': 'https://www.useflowpay.xyz/logo.svg',
        'app.detail.url': 'https://www.useflowpay.xyz',
        'discovery.wallet.method.default': 'IFRAME/RPC',
        'discovery.wallet.method.include': ['IFRAME/RPC', 'POP/RPC', 'TAB/RPC'],
        'discovery.wallet.method.include.services': ['https://fcl-discovery.onflow.org/authn'],
        'walletconnect.projectId': process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'demo-project-id',
        'discovery.wallet.method.include.services.timeout': 10000,
      });

      // Check if user is already connected
      fcl.currentUser.subscribe((user: any) => {
        if (user && user.loggedIn) {
          setUser(user);
          setIsConnected(true);
        } else {
          setUser(null);
          setIsConnected(false);
        }
      });
    } catch (err) {
      console.error('Flow configuration error:', err);
      setError('Failed to initialize Flow');
    }
  }, []);

  const connectWallet = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      await fcl.authenticate();
      
      // User will be set via the subscription above
    } catch (err) {
      console.error('Wallet connection error:', err);
      setError('Failed to connect wallet');
    } finally {
      setIsLoading(false);
    }
  };

  const disconnect = async () => {
    try {
      await fcl.unauthenticate();
      setUser(null);
      setIsConnected(false);
    } catch (err) {
      console.error('Disconnect error:', err);
      setError('Failed to disconnect wallet');
    }
  };

  const value: FlowContextType = {
    isConnected,
    user,
    connectWallet,
    disconnect,
    isLoading,
    error,
  };

  return (
    <FlowContext.Provider value={value}>
      {children}
    </FlowContext.Provider>
  );
}

export function useFlowStable() {
  const context = useContext(FlowContext);
  if (context === undefined) {
    throw new Error('useFlowStable must be used within a FlowProviderStable');
  }
  return context;
}

