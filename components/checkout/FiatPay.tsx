"use client";

import { useState, useEffect } from "react";
import { Loader2, CreditCard, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getTransakConfig } from "@/lib/transak";

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
      const TransakSDK = (await import('@transak/transak-sdk')).default;
      
      const transakConfig = getTransakConfig({
        walletAddress: merchantWalletAddress,
        fiatAmount: parseFloat(amount),
        fiatCurrency: 'USD',
        cryptoCurrency: 'USDC',
        redirectURL: `${window.location.origin}/checkout/success?ref=${data.orderReference}`,
        partnerOrderId: data.orderReference,
      });

      const transak = new TransakSDK(transakConfig);

      // Listen for Transak events
      transak.on(transak.ALL_EVENTS, (event: any) => {
        console.log('Transak event:', event);
      });

      transak.on(transak.EVENTS.TRANSAK_ORDER_SUCCESSFUL, (orderData: any) => {
        console.log('Order successful:', orderData);
        onSuccess({
          ...orderData,
          orderReference: data.orderReference,
        });
      });

      transak.on(transak.EVENTS.TRANSAK_ORDER_FAILED, (orderData: any) => {
        console.error('Order failed:', orderData);
        onError('Payment failed. Please try again.');
      });

      transak.on(transak.EVENTS.TRANSAK_WIDGET_CLOSE, () => {
        console.log('Widget closed');
        setLoading(false);
      });

      // Open Transak widget
      setLoading(true);
      transak.init();
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
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <CreditCard className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-medium text-blue-900 dark:text-blue-100">
              Card Payment via Transak
            </h4>
            <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
              Pay with your credit/debit card. Funds will be converted to USDC.e and sent directly to the merchant's wallet.
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
            <span className="font-semibold text-lg text-gray-900 dark:text-white">${amount} USD</span>
          </div>
          
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-600 dark:text-gray-400">Settlement</span>
            <span className="text-gray-700 dark:text-gray-300">USDC.e on Flow</span>
          </div>
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

      <Button
        onClick={handlePayWithCard}
        disabled={creating || loading}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-6 text-lg font-medium"
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

      <p className="text-xs text-center text-gray-500 dark:text-gray-400">
        Powered by Transak • Secure payment processing
      </p>
    </div>
  );
}

