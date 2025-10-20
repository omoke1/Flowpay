"use client";

import { useState, useEffect } from "react";
import { Loader2, CreditCard, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getTransakConfig } from "@/lib/transak";
// Dynamic import for Transak SDK

interface FiatPayProps {
  paymentLinkId: string;
  merchantWalletAddress: string;
  amount: string;
  productName: string;
  onSuccess: (orderData: any) => void;
  onError: (error: string) => void;
}

export function FiatPay({
  paymentLinkId,
  merchantWalletAddress,
  amount,
  productName,
  onSuccess,
  onError,
}: FiatPayProps) {
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [orderReference, setOrderReference] = useState<string | null>(null);

  const handlePayWithCard = async () => {
    try {
      setCreating(true);
      setError(null);

      // Check if Transak is configured
      console.log('Transak API Key:', process.env.NEXT_PUBLIC_TRANSAK_API_KEY ? 'Set' : 'Not set');
      if (!process.env.NEXT_PUBLIC_TRANSAK_API_KEY) {
        throw new Error('Card payments are not available. Transak is not configured.');
      }

      // Create order reference in our database
      const response = await fetch('/api/transak/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentLinkId,
          merchantWalletAddress,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create order');
      }

      const data = await response.json();
      setOrderReference(data.orderReference);

      // Initialize Transak SDK
      const transakConfig = getTransakConfig({
        walletAddress: merchantWalletAddress,
        fiatAmount: parseFloat(amount),
        fiatCurrency: 'USD',
        cryptoCurrency: 'USDC',
        redirectURL: `${window.location.origin}/checkout/success?ref=${data.orderReference}`,
        partnerOrderId: data.orderReference,
      });

      // Dynamic import with proper error handling
      const TransakModule = await import('@transak/transak-sdk');
      
      // The Transak SDK exports a 'Transak' property, not a default export
      if (!TransakModule.Transak) {
        throw new Error('Transak SDK not properly loaded');
      }

      console.log('Transak config being used:', JSON.stringify(transakConfig, null, 2));
      
      const transak = new TransakModule.Transak(transakConfig);

      // Open Transak widget
      setLoading(true);
      transak.init();
      
      // For now, we'll handle success/failure through webhooks
      // The Transak widget will redirect to the success URL on completion
      console.log('Transak widget initialized successfully');
    } catch (err: any) {
      console.error('Error initializing Transak:', err);
      setError(err.message || 'Failed to initialize payment. Please try again.');
      onError(err.message || 'Failed to initialize payment');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-16 h-16 bg-blue-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <CreditCard className="w-8 h-8 text-blue-400" />
        </div>
        <h3 className="text-xl font-semibold text-white mb-2">
          Card Payment via Transak
        </h3>
        <p className="text-white/70 text-sm leading-relaxed">
          Pay with your credit/debit card. Funds will be converted to USDC.e and sent directly to the merchant's wallet.
        </p>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-xl p-6 space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-white/70">Product</span>
          <span className="font-medium text-white">{productName}</span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-white/70">Amount</span>
          <span className="font-bold text-[#97F11D] text-lg">${amount} USD</span>
        </div>
        
        <div className="flex justify-between items-center text-sm">
          <span className="text-white/70">Settlement</span>
          <span className="text-white/60">USDC.e on Flow</span>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-red-500/20 rounded-full flex items-center justify-center flex-shrink-0">
              <AlertCircle className="w-4 h-4 text-red-400" />
            </div>
            <div>
              <p className="text-red-300 font-medium text-sm">Payment Error</p>
              <p className="text-red-200 text-sm mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}

      <Button
        onClick={handlePayWithCard}
        disabled={creating || loading}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 font-medium"
      >
        {creating ? (
          <>
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            Preparing Payment...
          </>
        ) : loading ? (
          <>
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            Complete Payment in Transak Window
          </>
        ) : (
          <>
            <CreditCard className="w-5 h-5 mr-2" />
            Pay ${amount} with Card
          </>
        )}
      </Button>

      <p className="text-xs text-center text-white/50">
        Powered by Transak • Secure payment processing
      </p>
    </div>
  );
}

