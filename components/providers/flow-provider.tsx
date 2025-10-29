"use client";

import { createContext, useContext, ReactNode } from 'react';

interface FlowContextType {
  // Add Flow-related context here if needed
}

const FlowContext = createContext<FlowContextType | undefined>(undefined);

export function FlowProvider({ children }: { children: ReactNode }) {
  return (
    <FlowContext.Provider value={{}}>
      {children}
    </FlowContext.Provider>
  );
}

export function useFlow() {
  const context = useContext(FlowContext);
  if (context === undefined) {
    throw new Error('useFlow must be used within a FlowProvider');
  }
  return context;
}
