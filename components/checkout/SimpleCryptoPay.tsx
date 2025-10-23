"use client";

import { useState, useEffect } from "react";
import { Loader2, Wallet, AlertCircle, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useFlowMinimal } from "@/components/providers/flow-provider-minimal";

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
  const { isConnected, user, connectWallet } = useFlowMinimal();
  const [loading, setLoading] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [walletBalance, setWalletBalance] = useState<string | null>(null);
  const [balanceLoading, setBalanceLoading] = useState(false);

  // Load wallet balance when user connects
  useEffect(() => {
    const loadBalance = async () => {
      if (isConnected && user?.addr) {
        setBalanceLoading(true);
        try {
          const { getFlowBalance, getUSDCBalance } = await import("@/lib/flow-transactions");
          const balance = token === 'USDC' 
            ? await getUSDCBalance(user.addr)
            : await getFlowBalance(user.addr);
          setWalletBalance(balance);
        } catch (error) {
          console.error('Error loading wallet balance:', error);
        } finally {
          setBalanceLoading(false);
        }
      }
    };

    loadBalance();
  }, [isConnected, user?.addr, token]);

  const handlePayment = async () => {
    if (!isConnected || !user || !user.addr) {
      await connectWallet();
      return;
    }

    setLoading(true);
    
    try {
      console.log(`Processing real payment: ${amount} ${token} to ${merchantAddress}`);
      
      // Import Flow transaction functions
      const { sendFlowTokens, sendUSDCTokens, getFlowBalance, getUSDCBalance, verifyMainnetConnection } = await import("@/lib/flow-transactions");
      
      // CRITICAL: Verify we're on mainnet before processing
      console.log(`Verifying mainnet connection...`);
      const isMainnet = await verifyMainnetConnection();
      if (!isMainnet) {
        throw new Error('CRITICAL SECURITY ERROR: Not connected to Flow mainnet! Transactions are disabled for security.');
      }
      
      // CRITICAL: Check wallet balance before attempting transaction
      console.log(`Checking wallet balance for ${user.addr}...`);
      
      let walletBalance: string;
      let requiredAmount: number;
      
      if (token === 'USDC') {
        walletBalance = await getUSDCBalance(user.addr);
        requiredAmount = parseFloat(amount);
        console.log(`USDC Balance: ${walletBalance}, Required: ${requiredAmount}`);
      } else {
        walletBalance = await getFlowBalance(user.addr);
        requiredAmount = parseFloat(amount);
        console.log(`FLOW Balance: ${walletBalance}, Required: ${requiredAmount}`);
      }
      
      // Validate sufficient balance
      if (parseFloat(walletBalance) < requiredAmount) {
        throw new Error(`Insufficient ${token} balance. You have ${walletBalance} ${token}, but need ${requiredAmount} ${token}.`);
      }
      
      console.log(`✅ Sufficient balance confirmed: ${walletBalance} ${token} >= ${requiredAmount} ${token}`);
      
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
        <CheckCircle className="w-12 h-12 text-[#97F11D] mx-auto" />
        <h3 className="text-lg font-semibold text-white">
          FlowPay Payment Successful!
        </h3>
        <p className="text-sm text-gray-400">
          Transaction Hash: {txHash.slice(0, 8)}...{txHash.slice(-8)}
        </p>
        <p className="text-xs text-gray-500">
          View on Flowscan: <a 
            href={`https://flowscan.org/transaction/${txHash}`} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-[#97F11D] hover:text-[#97F11D]/80 underline"
          >
            {txHash}
          </a>
        </p>
        <p className="text-sm text-gray-400">
          You will be redirected shortly...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-white mb-2">
          Pay with FlowPay
        </h3>
        <p className="text-sm text-gray-400">
          {amount} {token} for {productName}
        </p>
      </div>

      {!isConnected ? (
        <Button
          onClick={connectWallet}
          className="w-full bg-[#97F11D] hover:bg-[#97F11D]/90 text-black font-semibold"
          disabled={loading}
        >
          <Wallet className="w-4 h-4 mr-2" />
          Connect FlowPay Wallet
        </Button>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-black/50 border border-white/10 rounded-lg">
            <span className="text-sm text-gray-400">From:</span>
            <span className="text-sm font-medium text-white">
              {user?.addr ? `${user.addr.slice(0, 6)}...${user.addr.slice(-4)}` : 'Not connected'}
            </span>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-black/50 border border-white/10 rounded-lg">
            <span className="text-sm text-gray-400">To:</span>
            <span className="text-sm font-medium text-white">
              {merchantAddress.slice(0, 6)}...{merchantAddress.slice(-4)}
            </span>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-black/50 border border-white/10 rounded-lg">
            <span className="text-sm text-gray-400">Amount:</span>
            <span className="text-sm font-medium text-[#97F11D]">
              {amount} {token}
            </span>
          </div>
          
          {/* Wallet Balance Display */}
          <div className="flex items-center justify-between p-3 bg-black/50 border border-white/10 rounded-lg">
            <span className="text-sm text-gray-400">Your Balance:</span>
            <span className="text-sm font-medium text-white">
              {balanceLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : walletBalance !== null ? (
                `${walletBalance} ${token}`
              ) : (
                'Loading...'
              )}
            </span>
          </div>

          <Button
            onClick={handlePayment}
            className="w-full bg-[#97F11D] hover:bg-[#97F11D]/90 text-black font-semibold"
            disabled={loading || (walletBalance !== null && parseFloat(walletBalance) < parseFloat(amount))}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Processing Payment...
              </>
            ) : (walletBalance !== null && parseFloat(walletBalance) < parseFloat(amount)) ? (
              <>
                <AlertCircle className="w-4 h-4 mr-2" />
                Insufficient {token} Balance
              </>
            ) : (
              <>
                <Wallet className="w-4 h-4 mr-2" />
                PAY {amount} {token}
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
