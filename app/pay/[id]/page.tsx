"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function CheckoutPage() {
  const params = useParams();
  const linkId = params.id as string;
  
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [paymentData, setPaymentData] = useState<any>(null);
  const [walletConnected, setWalletConnected] = useState(false);

  useEffect(() => {
    const fetchPaymentLink = async () => {
      try {
        const response = await fetch(`/api/payment-links/${linkId}`);
        
        if (!response.ok) {
          setPaymentData(null);
          setLoading(false);
          return;
        }

        const data = await response.json();
        const link = data.paymentLink;
        
        setPaymentData({
          id: link.id,
          productName: link.product_name,
          description: link.description,
          amount: link.amount,
          token: link.token,
          merchantAddress: link.merchant_id,
        });
      } catch (error) {
        console.error("Error fetching payment link:", error);
        setPaymentData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchPaymentLink();
  }, [linkId]);

  const handleConnectWallet = async () => {
    try {
      const { fcl } = await import("@/lib/flow-config");
      await fcl.authenticate();
      setWalletConnected(true);
    } catch (error) {
      console.error("Error connecting wallet:", error);
      alert("Failed to connect wallet. Please try again.");
    }
  };

  const handlePayment = async () => {
    setPaying(true);
    try {
      const { sendFlowTokens } = await import("@/lib/flow-transactions");
      const { fcl } = await import("@/lib/flow-config");
      
      // Get current user
      const user = await fcl.currentUser.snapshot();
      if (!user.loggedIn) {
        throw new Error("Wallet not connected");
      }

      // Execute payment transaction
      const txId = await sendFlowTokens(
        paymentData.merchantAddress,
        paymentData.amount
      );

      // Wait for transaction to be sealed
      const transaction = await fcl.tx(txId).onceSealed();
      console.log("Transaction sealed:", transaction);

      // Record payment in database
      const response = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          linkId: linkId,
          payerAddress: user.addr,
          amount: paymentData.amount,
          token: paymentData.token,
          txHash: txId,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to record payment");
      }

      const data = await response.json();
      
      // Show success and redirect if needed
      alert("Payment successful! 🎉");
      
      if (data.redirectUrl) {
        window.location.href = data.redirectUrl;
      }
    } catch (error: any) {
      console.error("Payment error:", error);
      alert(`Payment failed: ${error.message || "Please try again."}`);
    } finally {
      setPaying(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-flow-dark flex items-center justify-center">
        <p className="text-white">Loading...</p>
      </div>
    );
  }

  if (!paymentData) {
    return (
      <div className="min-h-screen bg-flow-dark flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Payment Link Not Found</CardTitle>
            <CardDescription>
              This payment link doesn't exist or has been removed.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-flow-dark flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Logo */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-flow-green">FlowPay</h1>
          <p className="text-text-secondary text-sm mt-1">Secure payment on Flow</p>
        </div>

        {/* Payment Card */}
        <Card>
          <CardHeader>
            <CardTitle>{paymentData.productName}</CardTitle>
            {paymentData.description && (
              <CardDescription>{paymentData.description}</CardDescription>
            )}
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Amount Display */}
            <div className="text-center py-6 border-y border-flow-gray">
              <p className="text-sm text-text-muted mb-2">Amount</p>
              <p className="text-4xl font-bold text-flow-green">
                {paymentData.amount} {paymentData.token}
              </p>
            </div>

            {/* Merchant Info */}
            <div className="space-y-2">
              <p className="text-sm text-text-muted">Paying to</p>
              <p className="text-sm font-mono text-white bg-flow-dark px-3 py-2 rounded">
                {paymentData.merchantAddress}
              </p>
            </div>

            {/* Payment Button */}
            {!walletConnected ? (
              <Button
                onClick={handleConnectWallet}
                size="lg"
                className="w-full"
              >
                Connect Wallet
              </Button>
            ) : (
              <Button
                onClick={handlePayment}
                size="lg"
                className="w-full"
                disabled={paying}
              >
                {paying ? "Processing..." : `Pay ${paymentData.amount} ${paymentData.token}`}
              </Button>
            )}

            {/* Security Notice */}
            <p className="text-xs text-center text-text-muted">
              🔒 Secured by Flow blockchain
            </p>
          </CardContent>
        </Card>

        {/* Powered By */}
        <p className="text-center text-sm text-text-muted">
          Powered by <span className="text-flow-green font-semibold">FlowPay</span>
        </p>
      </div>
    </div>
  );
}

