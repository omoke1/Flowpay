"use client";

import { useEffect, useState, createContext, useContext, useRef } from "react";
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
  setUserDirectly: (user: any) => void;
  resetLoadingState: () => void;
}

const FlowContext = createContext<FlowContextType | undefined>(undefined);

export function FlowProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const [walletUser, setWalletUser] = useState<WalletUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const loadingRef = useRef(true);
  const [isConnecting, setIsConnecting] = useState(false);

  useEffect(() => {
    const init = async () => {
      try {
        // Initialize FCL with proper configuration
        initializeFCL();
        setInitialized(true);

        // Check if user is already authenticated (without triggering new connection)
        try {
          const currentUser = await fcl.currentUser();
          if (currentUser && (currentUser as any).addr) {
            console.log("Found existing authenticated user:", currentUser);
            setUser(currentUser);
            
            // Get or create user in database
            const dbUser = await WalletService.getOrCreateUser((currentUser as any).addr, {
              email: (currentUser as any).email || '',
              wallet_type: 'external',
              display_name: (currentUser as any).name || '',
              avatar_url: (currentUser as any).avatar || '',
              is_verified: (currentUser as any).verified || false
            });
            setWalletUser(dbUser);
          } else {
            console.log("No existing authenticated user found");
            setUser(null);
            setWalletUser(null);
          }
        } catch (userError) {
          console.warn("Error checking current user:", userError);
          setUser(null);
          setWalletUser(null);
        }

        // Subscribe to user changes (only for future authentication events)
        const unsubscribe = fcl.currentUser.subscribe(async (currentUser: any) => {
          console.log("FCL User changed:", currentUser);
          setUser(currentUser);
          
          try {
            if (currentUser && currentUser.addr) {
              // Get or create user in database
              const dbUser = await WalletService.getOrCreateUser(currentUser.addr, {
                email: currentUser.email || '',
                wallet_type: 'external',
                display_name: currentUser.name || '',
                avatar_url: currentUser.avatar || '',
                is_verified: currentUser.verified || false
              });
              setWalletUser(dbUser);
            } else {
              setWalletUser(null);
            }
          } catch (dbError) {
            console.error("Database user creation failed:", dbError);
            setWalletUser(null);
          }
          
          setError(null);
        });

        // Set loading to false after initialization
        setLoading(false);
        loadingRef.current = false;

        return () => {
          unsubscribe();
        };
      } catch (err) {
        console.error("FCL initialization failed:", err);
        setError("Failed to initialize wallet connection. Please refresh the page.");
        setLoading(false);
        loadingRef.current = false;
      }
    };

    init();
  }, []);

  const logIn = async (method: 'external' | 'flowport' = 'external') => {
    try {
      setLoading(true);
      setIsConnecting(true);
      setError(null);
      console.log("Starting authentication...", method);
      
      // Check if FCL is properly initialized
      if (!initialized) {
        throw new Error("Wallet connection not initialized. Please refresh the page.");
      }
      
      // Set a shorter timeout to prevent endless loading
      const timeoutId = setTimeout(() => {
        setError("Wallet connection timed out. Please try again.");
        setLoading(false);
        setIsConnecting(false);
      }, 15000); // 15 second timeout
      
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
        // Use external wallet authentication with better error handling
        try {
          await fcl.authenticate();
        } catch (authError: any) {
          console.error("FCL authentication error:", authError);
          
          // Handle specific FCL errors
          if (authError.message?.includes("Declined") || authError.message?.includes("Externally Halted")) {
            throw new Error("Wallet connection was cancelled by user. Please try again.");
          } else if (authError.message?.includes("User rejected")) {
            throw new Error("Wallet connection was rejected. Please try again.");
          } else if (authError.message?.includes("No wallet found")) {
            throw new Error("No compatible wallet found. Please install a Flow wallet.");
          } else {
            throw new Error("Wallet connection failed. Please try again.");
          }
        }
      }
      
      clearTimeout(timeoutId);
      setIsConnecting(false);
      console.log("Authentication completed");
    } catch (error: any) {
      console.error("Login failed:", error);
      
      // Handle specific error cases
      if (error.message?.includes("cancelled") || error.message?.includes("rejected")) {
        setError("Wallet connection was cancelled. Please try again.");
      } else if (error.message?.includes("timeout")) {
        setError("Connection timed out. Please try again.");
      } else if (error.message?.includes("No compatible wallet")) {
        setError("No compatible wallet found. Please install a Flow wallet like Blocto or Flow Port.");
      } else if (error.message?.includes("WalletConnect")) {
        setError("Wallet connection issue. Please try a different wallet.");
      } else {
        setError(error.message || "Failed to connect wallet. Please try again.");
      }
    } finally {
      setLoading(false);
      setIsConnecting(false);
    }
  };

  const logOut = async () => {
    try {
      setLoading(true);
      setIsConnecting(false);
      setError(null);
      await WalletService.disconnect();
      setWalletUser(null);
      console.log("Logout completed");
      
      // Redirect to home page after logout
      if (typeof window !== "undefined") {
        window.location.href = "/";
      }
    } catch (error: any) {
      console.error("Logout failed:", error);
      setError(error.message || "Failed to disconnect wallet");
    } finally {
      setLoading(false);
    }
  };

  const setUserDirectly = (user: any) => {
    setWalletUser(user);
    setUser({ loggedIn: true, addr: user.address });
  };

  const resetLoadingState = () => {
    console.log("Manually resetting loading state");
    setLoading(false);
    loadingRef.current = false;
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
    loading: loading || isConnecting,
    initialized,
    loggedIn: user?.loggedIn || false,
    address: user?.addr || null,
    walletType: walletUser?.wallet_type || null,
    logIn,
    logOut,
    error,
    refreshUser,
    setUserDirectly,
    resetLoadingState,
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

