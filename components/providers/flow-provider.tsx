"use client";

import { useEffect, useState, createContext, useContext } from "react";
import { fcl, initializeFCL } from "@/lib/flow-config";
import { WalletService, WalletUser } from "@/lib/wallet-service";

interface FlowContextType {
  user: any;
  walletUser: WalletUser | null;
  loading: boolean;
  initialized: boolean;
  loggedIn: boolean;
  address: string | null;
  walletType: 'external' | 'managed' | null;
  logIn: (method?: 'external' | 'flowport') => Promise<void>;
  logOut: () => Promise<void>;
  error: string | null;
  refreshUser: () => Promise<void>;
}

const FlowContext = createContext<FlowContextType | undefined>(undefined);

export function FlowProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const [walletUser, setWalletUser] = useState<WalletUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const init = async () => {
      try {
        // Initialize FCL
        initializeFCL();
        setInitialized(true);

        // Subscribe to user changes
        const unsubscribe = fcl.currentUser.subscribe(async (currentUser: any) => {
          console.log("FCL User changed:", currentUser);
          setUser(currentUser);
          
          if (currentUser.loggedIn && currentUser.addr) {
            // Get or create user in database
            const dbUser = await WalletService.getOrCreateUser(currentUser.addr, {
              email: currentUser.email,
              wallet_type: 'external', // Default to external for now
              display_name: currentUser.name,
              avatar_url: currentUser.avatar,
              is_verified: currentUser.verified || false
            });
            setWalletUser(dbUser);
          } else {
            setWalletUser(null);
          }
          
          setLoading(false);
          setError(null);
        });

        return () => unsubscribe();
      } catch (err) {
        console.error("FCL initialization failed:", err);
        setError("Failed to initialize wallet connection");
        setLoading(false);
      }
    };

    init();
  }, []);

  const logIn = async (method: 'external' | 'flowport' = 'external') => {
    try {
      setLoading(true);
      setError(null);
      console.log("Starting authentication...", method);
      
      // Check if FCL is properly initialized
      if (!initialized) {
        throw new Error("Wallet connection not initialized. Please refresh the page.");
      }
      
      // Set a timeout to prevent endless loading
      const timeoutId = setTimeout(() => {
        setError("Wallet connection timed out. Please try again.");
        setLoading(false);
      }, 30000); // 30 second timeout
      
      if (method === 'flowport') {
        // Use Flow Port for email-based registration
        const flowPortUser = await WalletService.authenticateWithFlowPort();
        if (flowPortUser) {
          // Get or create user in database
          const dbUser = await WalletService.getOrCreateUser(flowPortUser.address, {
            email: flowPortUser.email,
            wallet_type: 'managed',
            display_name: flowPortUser.name,
            avatar_url: flowPortUser.avatar,
            is_verified: flowPortUser.verified
          });
          setWalletUser(dbUser);
        }
      } else {
        // Use external wallet authentication
        await fcl.authenticate();
      }
      
      clearTimeout(timeoutId);
      console.log("Authentication completed");
    } catch (error: any) {
      console.error("Login failed:", error);
      
      // Handle specific error cases
      if (error.message?.includes("Declined") || error.message?.includes("Externally Halted")) {
        setError("Wallet connection was cancelled. Please try again.");
      } else if (error.message?.includes("timeout")) {
        setError("Connection timed out. Please try again.");
      } else if (error.message?.includes("WalletConnect")) {
        setError("Wallet connection issue. Please try a different wallet.");
      } else {
        setError(error.message || "Failed to connect wallet. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const logOut = async () => {
    try {
      setLoading(true);
      setError(null);
      await WalletService.disconnect();
      setWalletUser(null);
      console.log("Logout completed");
    } catch (error: any) {
      console.error("Logout failed:", error);
      setError(error.message || "Failed to disconnect wallet");
    } finally {
      setLoading(false);
    }
  };

  const refreshUser = async () => {
    if (user?.addr) {
      const dbUser = await WalletService.getUserByWalletAddress(user.addr);
      setWalletUser(dbUser);
    }
  };

  const value: FlowContextType = {
    user,
    walletUser,
    loading,
    initialized,
    loggedIn: user?.loggedIn || false,
    address: user?.addr || null,
    walletType: walletUser?.wallet_type || null,
    logIn,
    logOut,
    error,
    refreshUser,
  };

  return (
    <FlowContext.Provider value={value}>
      {children}
    </FlowContext.Provider>
  );
}

export function useFlowUser() {
  const context = useContext(FlowContext);
  if (context === undefined) {
    throw new Error("useFlowUser must be used within a FlowProvider");
  }
  return context;
}

