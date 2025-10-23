"use client";

import React, { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import * as fcl from '@onflow/fcl';

interface FlowContextType {
  user: any;
  isConnected: boolean;
  loading: boolean;
  error: string | null;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
}

const FlowContext = createContext<FlowContextType | undefined>(undefined);

export function FlowProviderProduction({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isConnected = !!user && (user.loggedIn || user.addr);

  // Configure Flow on component mount - MAINNET ONLY
  useEffect(() => {
    // Force mainnet for production - ignore environment variable
    const network = 'mainnet';
    
    console.log(`🚀 FlowPay configured for ${network} network (forced mainnet for production)`);
    
    // Always use mainnet configuration
    if (true) { // Always true to force mainnet
      fcl.config({
        'accessNode.api': 'https://rest-mainnet.onflow.org',
        'discovery.wallet': 'https://fcl-discovery.onflow.org/authn',
        'discovery.authn.endpoint': 'https://fcl-discovery.onflow.org/authn',
        'app.detail.title': 'FlowPay',
        'app.detail.icon': 'https://www.useflowpay.xyz/logo.svg',
        'app.detail.url': 'https://www.useflowpay.xyz',
        'discovery.wallet.method.default': 'IFRAME/RPC',
        'discovery.wallet.method.include': ['IFRAME/RPC', 'POP/RPC', 'TAB/RPC'],
        'discovery.wallet.method.include.services': [
          'https://fcl-discovery.onflow.org/authn'
        ],
        'walletconnect.projectId': process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'demo-project-id',
        // Force mainnet - no fallback to testnet
        'discovery.wallet.method.include.services.timeout': 10000,
      });
      console.log('✅ FlowPay configured for MAINNET (production)');
    } else {
      // Only allow testnet if explicitly set
      console.warn('⚠️ Testnet configuration detected - this should only be used for development');
      fcl.config({
        'accessNode.api': 'https://rest-testnet.onflow.org',
        'discovery.wallet': 'https://fcl-discovery.onflow.org/testnet/authn',
        'discovery.authn.endpoint': 'https://fcl-discovery.onflow.org/testnet/authn',
        'app.detail.title': 'FlowPay',
        'app.detail.icon': 'https://www.useflowpay.xyz/logo.svg',
        'app.detail.url': 'https://www.useflowpay.xyz',
        'discovery.wallet.method.default': 'IFRAME/RPC',
        'discovery.wallet.method.include': ['IFRAME/RPC', 'POP/RPC', 'TAB/RPC'],
        'discovery.wallet.method.include.services': [
          'https://fcl-discovery.onflow.org/testnet/authn'
        ],
        'walletconnect.projectId': process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'demo-project-id',
        'discovery.wallet.method.include.services.timeout': 10000,
      });
      console.log('⚠️ FlowPay configured for TESTNET (development only)');
    }

    // Subscribe to user changes
    const unsubscribe = fcl.currentUser.subscribe(async (user: any) => {
      console.log("FlowProviderProduction - user:", user);
      setUser(user);
      
      // If user is connected, create user record in database
      if (user && (user.loggedIn || user.addr)) {
        try {
          const response = await fetch('/api/auth/create-wallet-user', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              address: user.addr,
              name: user.name || null,
              email: user.email || null
            })
          });
          
          if (response.ok) {
            const result = await response.json();
            console.log('User record created/verified:', result);
          } else {
            console.warn('Failed to create user record:', await response.text());
          }
        } catch (error) {
          console.error('Error creating user record:', error);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  const connectWallet = async () => {
    setLoading(true);
    setError(null);
    
    try {
      await fcl.authenticate();
    } catch (err) {
      setError('Failed to connect wallet');
      console.error('Wallet connection error:', err);
    } finally {
      setLoading(false);
    }
  };

  const disconnectWallet = async () => {
    try {
      await fcl.unauthenticate();
      setUser(null);
      setError(null);
    } catch (err) {
      console.error('Wallet disconnection error:', err);
    }
  };

  const value: FlowContextType = {
    user,
    isConnected,
    loading,
    error,
    connectWallet,
    disconnectWallet
  };

  return (
    <FlowContext.Provider value={value}>
      {children}
    </FlowContext.Provider>
  );
}

export function useFlowProduction() {
  const context = useContext(FlowContext);
  if (context === undefined) {
    throw new Error('useFlowProduction must be used within a FlowProviderProduction');
  }
  return context;
}
