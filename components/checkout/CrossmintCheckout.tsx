'use client';

import React, { useEffect, useState } from 'react';
import { CrossmintProvider, CrossmintHostedCheckout } from '@crossmint/client-sdk-react-ui';

// Completely isolate from all other libraries
if (typeof window !== 'undefined') {
  // Disable all conflicting libraries
  (window as any).FCL = null;
  (window as any).fcl = null;
  (window as any).flow = null;
  (window as any).DD_LOGS = null;
  
  // Remove any existing Crossmint scripts
  document.querySelectorAll('script[src*="crossmint"]').forEach(script => script.remove());
}

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CreditCard, Apple, Smartphone } from 'lucide-react';

interface CrossmintCheckoutProps {
  paymentLinkId: string;
  amount: number;
  currency: string;
  productName: string;
  onSuccess: (result: any) => void;
  onError: (error: string) => void;
}

export function CrossmintCheckout({
  paymentLinkId,
  amount,
  currency,
  productName,
  onSuccess,
  onError
}: CrossmintCheckoutProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const clientApiKey = process.env.NEXT_PUBLIC_CROSSMINT_CLIENT_ID;

  if (!mounted) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="p-4">
          <div className="text-center">Loading...</div>
        </CardContent>
      </Card>
    );
  }

  if (!clientApiKey) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="p-4">
          <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            <h3 className="font-semibold">Configuration Error</h3>
            <p className="text-sm mt-1">
              Missing Crossmint Client ID. Please check your environment variables.
            </p>
            <ul className="text-xs mt-2 list-disc list-inside">
              <li>CLIENT_ID: {clientApiKey ? '✅ Set' : '❌ Missing'}</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Fiat Payment</CardTitle>
        <p className="text-gray-600">Pay with Credit Card, Apple Pay, Google Pay</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Product:</span>
            <span className="text-sm">{productName}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Amount:</span>
            <span className="text-sm font-bold">${amount} {currency}</span>
          </div>
        </div>

        <div className="space-y-2">
          <h4 className="text-sm font-medium">Payment Methods:</h4>
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary" className="flex items-center gap-1">
              <CreditCard className="h-3 w-3" />
              Credit Card
            </Badge>
            <Badge variant="secondary" className="flex items-center gap-1">
              <Apple className="h-3 w-3" />
              Apple Pay
            </Badge>
            <Badge variant="secondary" className="flex items-center gap-1">
              <Smartphone className="h-3 w-3" />
              Google Pay
            </Badge>
          </div>
        </div>

        <CrossmintProvider apiKey={clientApiKey}>
          <CrossmintHostedCheckout
            lineItems={[
              {
                productLocator: "url:https://flowpay.com/product/fiat-payment",
                callData: {
                  totalPrice: amount.toString(), // Use actual payment link amount
                  quantity: 1,
                },
              }
            ]}
            payment={{
              crypto: { enabled: false }, // Disable crypto for fiat-only payments
              fiat: { enabled: true },
            }}
            appearance={{
              display: "new-tab", // Open in a new tab
              overlay: {
                enabled: false, // Disable overlay
              },
              theme: {
                button: "dark", // Dark button theme
                checkout: "dark", // Dark checkout theme
              },
            }}
            recipient={{
              email: "buyer@example.com", // Digital assets will be delivered to this email's wallet
            }}
            locale="en-US" // Set interface language
          />
        </CrossmintProvider>

        <p className="text-xs text-gray-500 text-center">
          Secure payment powered by Crossmint
        </p>
      </CardContent>
    </Card>
  );
}