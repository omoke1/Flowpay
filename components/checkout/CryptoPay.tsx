"use client";

import { useState } from "react";
import { Loader2, Wallet, AlertCircle, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useFlowUser } from "@/components/providers/flow-provider";

interface CryptoPayProps {
  paymentLinkId: string;
  merchantAddress: string;
  amount: string;
  token: string;
  productName: string;
  onSuccess: (txHash: string) => void;
  onError: (error: string) => void;
}

export function CryptoPay({
  paymentLinkId,
  merchantAddress,
  amount,
  token,
  productName,
  onSuccess,
  onError,
}: CryptoPayProps) {
  const { loggedIn, address, logIn } = useFlowUser();
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConnectWallet = async () => {
    try {
      await logIn();
    } catch (err: any) {
      console.error("Error connecting wallet:", err);
      setError("Failed to connect wallet. Please try again.");
    }
  };

  const handlePayment = async () => {
    if (!loggedIn || !address) {
      setError("Please connect your wallet first");
      return;
    }

    setPaying(true);
    setError(null);

    try {
      const { sendFlowTokens, sendUSDCTokens } = await import("@/lib/flow-transactions");
      const { fcl } = await import("@/lib/flow-config");

      // Execute payment transaction based on selected token
      let txId: string;
      if (token === 'USDC') {
        txId = await sendUSDCTokens(merchantAddress, amount);
      } else {
        // Default to Flow Token for 'FLOW' or any other token
        txId = await sendFlowTokens(merchantAddress, amount);
      }

      // Wait for transaction to be sealed
      const transaction = await fcl.tx(txId).onceSealed();
      console.log("Transaction sealed:", transaction);

      // Record payment in database
      const response = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          linkId: paymentLinkId,
          payerAddress: address,
          amount: amount,
          token: token,
          txHash: txId,
          payment_method: 'crypto',
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to record payment");
      }

      onSuccess(txId);
    } catch (err: any) {
      console.error("Payment error:", err);
      const errorMessage = err.message || "Payment failed. Please try again.";
      setError(errorMessage);
      onError(errorMessage);
    } finally {
      setPaying(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Wallet className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-medium text-green-900 dark:text-green-100">
              Crypto Payment via Flow
            </h4>
            <p className="text-sm text-green-700 dark:text-green-300 mt-1">
              Pay directly from your Flow wallet. Transaction will be recorded on the Flow blockchain.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-gray-600 dark:text-gray-400">Product</span>
            <span className="font-medium text-gray-900 dark:text-white">{productName}</span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-gray-600 dark:text-gray-400">Amount</span>
            <span className="font-semibold text-lg text-gray-900 dark:text-white">
              {amount} {token}
            </span>
          </div>
          
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-600 dark:text-gray-400">Network</span>
            <span className="text-gray-700 dark:text-gray-300">Flow Blockchain</span>
          </div>

          {loggedIn && address && (
            <div className="flex justify-between items-center text-sm pt-2 border-t border-gray-200 dark:border-gray-700">
              <span className="text-gray-600 dark:text-gray-400">Your Wallet</span>
              <span className="font-mono text-gray-700 dark:text-gray-300">
                {address.slice(0, 6)}...{address.slice(-4)}
              </span>
            </div>
          )}
        </div>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-medium text-red-900 dark:text-red-100">Payment Error</h4>
              <p className="text-sm text-red-700 dark:text-red-300 mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}

      {!loggedIn ? (
        <Button
          onClick={handleConnectWallet}
          className="w-full bg-[#97F11D] hover:bg-[#97F11D]/90 text-black py-6 text-lg font-medium"
        >
          <Wallet className="w-5 h-5 mr-2" />
          Connect Flow Wallet
        </Button>
      ) : (
        <Button
          onClick={handlePayment}
          disabled={paying}
          className="w-full bg-[#97F11D] hover:bg-[#97F11D]/90 text-black py-6 text-lg font-medium"
        >
          {paying ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Processing Payment...
            </>
          ) : (
            <>
              <Wallet className="w-5 h-5 mr-2" />
              Pay {amount} {token}
            </>
          )}
        </Button>
      )}

      <p className="text-xs text-center text-gray-500 dark:text-gray-400">
        Secured by Flow Blockchain • Transaction will be recorded on-chain
      </p>
    </div>
  );
}

