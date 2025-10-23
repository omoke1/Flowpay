"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import { FlowService, FlowUser } from "@/lib/flow-simple";

interface FlowContextType {
  user: FlowUser | null;
  loading: boolean;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  isConnected: boolean;
  error: string | null;
}

const FlowContext = createContext<FlowContextType | undefined>(undefined);

export function SimpleFlowProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<FlowUser | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const flowService = FlowService.getInstance();

  const connectWallet = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const flowUser = await flowService.connectWallet();
      setUser(flowUser);
      
      console.log("Wallet connected successfully", flowUser);
    } catch (err) {
      console.error("Failed to connect wallet:", err);
      setError("Failed to connect wallet. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const disconnectWallet = () => {
    flowService.disconnectWallet();
    setUser(null);
    setError(null);
  };

  const isConnected = !!user;

  return (
    <FlowContext.Provider
      value={{
        user,
        loading,
        connectWallet,
        disconnectWallet,
        isConnected,
        error,
      }}
    >
      {children}
    </FlowContext.Provider>
  );
}

export function useFlow() {
  const context = useContext(FlowContext);
  if (context === undefined) {
    throw new Error("useFlow must be used within a SimpleFlowProvider");
  }
  return context;
}
