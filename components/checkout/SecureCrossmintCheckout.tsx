'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CreditCard, Apple, Smartphone, ExternalLink } from 'lucide-react';

interface SecureCrossmintCheckoutProps {
  paymentLinkId: string;
  amount: number;
  currency: string;
  productName: string;
  onSuccess: (result: any) => void;
  onError: (error: string) => void;
}

export function SecureCrossmintCheckout({
  paymentLinkId,
  amount,
  currency,
  productName,
  onSuccess,
  onError
}: SecureCrossmintCheckoutProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleSecureCheckout = async () => {
    setIsLoading(true);
    
    try {
      // Call our API to create checkout session (server-side, no exposed keys)
      const response = await fetch('/api/crossmint/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          paymentLinkId,
          amount,
          currency
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout');
      }

      if (data.success && data.checkoutUrl) {
        // Open checkout in new tab (secure, no exposed keys)
        window.open(data.checkoutUrl, '_blank', 'noopener,noreferrer');
        
        // Don't call onSuccess immediately - wait for webhook confirmation
        // The webhook will handle the actual payment completion
        console.log('Checkout opened, waiting for payment completion via webhook...');
        
        // Show a message to the user that they need to complete payment
        onSuccess({
          status: 'checkout_opened',
          message: 'Please complete your payment in the new tab. You will be notified when payment is confirmed.',
          checkoutUrl: data.checkoutUrl
        });
      } else {
        throw new Error(data.error || 'No checkout URL received');
      }

    } catch (error) {
      console.error('Secure checkout error:', error);
      onError(error instanceof Error ? error.message : 'Checkout failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto bg-black border-[#97F11D]/30 shadow-[0_0_20px_rgba(151,241,29,0.1)]">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl text-white">Fiat Payment</CardTitle>
        <p className="text-gray-400">Pay with Credit Card, Apple Pay, Google Pay</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-300">Product:</span>
            <span className="text-sm text-white">{productName}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-300">Amount:</span>
            <span className="text-sm font-bold text-[#97F11D]">${amount} {currency}</span>
          </div>
        </div>

        <div className="space-y-2">
          <h4 className="text-sm font-medium text-white">Payment Methods:</h4>
          <div className="flex flex-wrap gap-2">
            <Badge className="bg-[#97F11D]/20 text-[#97F11D] border-[#97F11D]/30 flex items-center gap-1">
              <CreditCard className="h-3 w-3" />
              Credit Card
            </Badge>
            <Badge className="bg-[#97F11D]/20 text-[#97F11D] border-[#97F11D]/30 flex items-center gap-1">
              <Apple className="h-3 w-3" />
              Apple Pay
            </Badge>
            <Badge className="bg-[#97F11D]/20 text-[#97F11D] border-[#97F11D]/30 flex items-center gap-1">
              <Smartphone className="h-3 w-3" />
              Google Pay
            </Badge>
          </div>
        </div>

        <Button 
          onClick={handleSecureCheckout}
          disabled={isLoading}
          className="w-full bg-[#97F11D] hover:bg-[#97F11D]/90 text-black font-semibold"
          size="lg"
        >
          {isLoading ? (
            'Creating Checkout...'
          ) : (
            <>
              <ExternalLink className="h-4 w-4 mr-2" />
              Pay ${amount} {currency}
            </>
          )}
        </Button>

        <p className="text-xs text-gray-400 text-center">
          Secure payment powered by Crossmint
        </p>
      </CardContent>
    </Card>
  );
}