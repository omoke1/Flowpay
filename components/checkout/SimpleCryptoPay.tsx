"use client";

import { useState } from "react";
import { Loader2, Wallet, AlertCircle, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useFlowOfficial } from "@/components/providers/flow-provider-official";

interface SimpleCryptoPayProps {
  paymentLinkId: string;
  merchantAddress: string;
  amount: string;
  token: string;
  productName: string;
  onSuccess: (txHash: string) => void;
  onError: (error: string) => void;
}

export function SimpleCryptoPay({
  paymentLinkId,
  merchantAddress,
  amount,
  token,
  productName,
  onSuccess,
  onError,
}: SimpleCryptoPayProps) {
  const { isConnected, user, connectWallet } = useFlowOfficial();
  const [loading, setLoading] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);

  const handlePayment = async () => {
    if (!isConnected || !user || !user.addr) {
      await connectWallet();
      return;
    }

    setLoading(true);
    
    try {
      console.log(`Processing real payment: ${amount} ${token} to ${merchantAddress}`);
      
      // Import Flow transaction functions
      const { sendFlowTokens, sendUSDCTokens } = await import("@/lib/flow-transactions");
      
      // Execute real blockchain transaction
      let txHash: string;
      if (token === 'USDC') {
        txHash = await sendUSDCTokens(merchantAddress, amount);
      } else {
        // Default to Flow Token for 'FLOW' or any other token
        txHash = await sendFlowTokens(merchantAddress, amount);
      }
      
      console.log(`Real transaction submitted: ${txHash}`);
      setTxHash(txHash);
      
      // Record payment in database with real transaction hash
      const response = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          linkId: paymentLinkId,
          payerAddress: user?.addr,
          amount: amount,
          token: token,
          txHash: txHash,
          payment_method: 'crypto',
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to record payment");
      }

      console.log(`Payment recorded successfully with transaction: ${txHash}`);
      onSuccess(txHash);
    } catch (error) {
      console.error("Payment failed:", error);
      onError(error instanceof Error ? error.message : "Payment failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (txHash) {
    return (
      <div className="text-center space-y-4">
        <CheckCircle className="w-12 h-12 text-green-600 mx-auto" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Payment Successful!
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Transaction Hash: {txHash.slice(0, 8)}...{txHash.slice(-8)}
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-500">
          View on Flowscan: <a 
            href={`https://testnet.flowscan.org/transaction/${txHash}`} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-500 hover:text-blue-400 underline"
          >
            {txHash}
          </a>
        </p>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          You will be redirected shortly...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          Pay with Flow
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {amount} {token} for {productName}
        </p>
      </div>

      {!isConnected ? (
        <Button
          onClick={connectWallet}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          disabled={loading}
        >
          <Wallet className="w-4 h-4 mr-2" />
          Connect Flow Wallet
        </Button>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <span className="text-sm text-gray-600 dark:text-gray-400">From:</span>
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              {user?.addr ? `${user.addr.slice(0, 6)}...${user.addr.slice(-4)}` : 'Not connected'}
            </span>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <span className="text-sm text-gray-600 dark:text-gray-400">To:</span>
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              {merchantAddress.slice(0, 6)}...{merchantAddress.slice(-4)}
            </span>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <span className="text-sm text-gray-600 dark:text-gray-400">Amount:</span>
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              {amount} {token}
            </span>
          </div>

          <Button
            onClick={handlePayment}
            className="w-full bg-green-600 hover:bg-green-700 text-white"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Processing Payment...
              </>
            ) : (
              <>
                <Wallet className="w-4 h-4 mr-2" />
                Pay {amount} {token}
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
