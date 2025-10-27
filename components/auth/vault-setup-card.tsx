"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, CheckCircle, Loader2, Wallet } from "lucide-react";
import { useNotification } from "@/components/providers/notification-provider";

interface VaultSetupCardProps {
  onVaultSetupComplete?: () => void;
}

export function VaultSetupCard({ onVaultSetupComplete }: VaultSetupCardProps) {
  const [loading, setLoading] = useState(false);
  const [completed, setCompleted] = useState(false);
  const { success, error: showError } = useNotification();

  const handleSetupVault = async () => {
    setLoading(true);
    try {
      // Import the vault setup function
      const { setupFlowTokenVault } = await import('@/lib/flow-transactions');
      
      // Execute vault setup transaction (client-side)
      const result = await setupFlowTokenVault();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to setup vault');
      }

      success("FlowToken vault setup completed! You can now receive payments.");
      setCompleted(true);
      onVaultSetupComplete?.();
      
    } catch (err: any) {
      console.error('Vault setup failed:', err);
      showError(err.message || 'Failed to setup vault. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (completed) {
    return (
      <Card className="bg-green-500/10 border border-green-500/20">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-400" />
            <CardTitle className="text-green-300">Vault Setup Complete</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <CardDescription className="text-green-200">
            Your FlowToken vault is now set up and ready to receive payments!
          </CardDescription>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-yellow-500/10 border border-yellow-500/20">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-yellow-400" />
          <CardTitle className="text-yellow-300">Wallet Setup Required</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <CardDescription className="text-yellow-200">
          Your account needs to be set up to receive FLOW tokens. This is a one-time setup that creates a secure vault for your tokens.
        </CardDescription>
        
        <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-lg p-3">
          <h4 className="font-medium text-yellow-100 mb-2">What this does:</h4>
          <ul className="text-sm text-yellow-200 space-y-1">
            <li>• Creates a secure FlowToken vault in your account</li>
            <li>• Sets up the ability to receive FLOW payments</li>
            <li>• Required for all FlowPay payment features</li>
            <li>• Takes about 10-30 seconds to complete</li>
          </ul>
        </div>

        <Button
          onClick={handleSetupVault}
          disabled={loading}
          className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-medium"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Setting up vault...
            </>
          ) : (
            <>
              <Wallet className="mr-2 h-4 w-4" />
              Setup FlowToken Vault
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
