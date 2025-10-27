'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CreditCard, Smartphone, Wallet, Apple, Zap } from 'lucide-react';
import { SecureCrossmintCheckout } from './SecureCrossmintCheckout';
import { SimpleCryptoPay } from './SimpleCryptoPay';

interface EnhancedPaymentMethodSelectorProps {
  paymentLinkId: string;
  merchantAddress: string;
  amount: number;
  token: 'FLOW' | 'USDC';
  productName: string;
  onPaymentSuccess: (result: any) => void;
  onPaymentError: (error: string) => void;
}

type PaymentMethod = 'crypto' | 'fiat' | 'apple_pay' | 'google_pay';

export function EnhancedPaymentMethodSelector({
  paymentLinkId,
  merchantAddress,
  amount,
  token,
  productName,
  onPaymentSuccess,
  onPaymentError
}: EnhancedPaymentMethodSelectorProps) {
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
  const [availableMethods, setAvailableMethods] = useState<PaymentMethod[]>(['crypto', 'fiat']);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Load available payment methods for this payment link
    loadPaymentMethods();
  }, [paymentLinkId]);

  const loadPaymentMethods = async () => {
    try {
      const response = await fetch(`/api/crossmint/payment-methods?paymentLinkId=${paymentLinkId}`);
      const data = await response.json();

      if (data.success && data.methods.length > 0) {
        const enabledMethods = data.methods
          .filter((method: any) => method.enabled)
          .map((method: any) => method.method_type);
        setAvailableMethods(enabledMethods);
      }
    } catch (error) {
      console.error('Failed to load payment methods:', error);
    }
  };

  const handleMethodSelect = (method: PaymentMethod) => {
    setSelectedMethod(method);
  };

  const handlePaymentSuccess = (result: any) => {
    onPaymentSuccess(result);
  };

  const handlePaymentError = (error: string) => {
    onPaymentError(error);
  };

  const getMethodIcon = (method: PaymentMethod) => {
    switch (method) {
      case 'crypto':
        return <Wallet className="h-5 w-5 text-[#97F11D]" />;
      case 'fiat':
        return <CreditCard className="h-5 w-5 text-[#97F11D]" />;
      case 'apple_pay':
        return <Apple className="h-5 w-5 text-[#97F11D]" />;
      case 'google_pay':
        return <Smartphone className="h-5 w-5 text-[#97F11D]" />;
      default:
        return <Zap className="h-5 w-5 text-[#97F11D]" />;
    }
  };

  const getMethodTitle = (method: PaymentMethod) => {
    switch (method) {
      case 'crypto':
        return 'Crypto Wallet';
      case 'fiat':
        return 'Credit Card';
      case 'apple_pay':
        return 'Apple Pay';
      case 'google_pay':
        return 'Google Pay';
      default:
        return 'Payment';
    }
  };

  const getMethodDescription = (method: PaymentMethod) => {
    switch (method) {
      case 'crypto':
        return `Pay with ${token} tokens`;
      case 'fiat':
        return 'Credit card, Apple Pay, Google Pay, and 40+ cryptocurrencies';
      case 'apple_pay':
        return 'Pay with Apple Pay';
      case 'google_pay':
        return 'Pay with Google Pay';
      default:
        return 'Select a payment method';
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      {/* Payment Method Selection */}
      {!selectedMethod && (
        <Card className="bg-black border-[#97F11D]/30 shadow-[0_0_20px_rgba(151,241,29,0.1)]">
          <CardHeader>
            <CardTitle className="text-center text-white">Choose Payment Method</CardTitle>
            <p className="text-center text-gray-400">
              Select how you'd like to pay for {productName}
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {availableMethods.map((method) => (
                <Button
                  key={method}
                  variant="outline"
                  className="h-auto p-4 flex flex-col items-center space-y-2 bg-black border-[#97F11D]/30 text-white hover:bg-[#97F11D]/10 hover:border-[#97F11D]/60 transition-all duration-200"
                  onClick={() => handleMethodSelect(method)}
                >
                  {getMethodIcon(method)}
                  <div className="text-center">
                    <div className="font-medium text-white">{getMethodTitle(method)}</div>
                    <div className="text-sm text-gray-400">
                      {getMethodDescription(method)}
                    </div>
                  </div>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Crypto Payment */}
      {selectedMethod === 'crypto' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => setSelectedMethod(null)}
              className="flex items-center space-x-2 text-gray-400 hover:text-white hover:bg-white/10"
            >
              <Wallet className="h-4 w-4" />
              <span>Back to payment methods</span>
            </Button>
            <Badge className="bg-[#97F11D]/20 text-[#97F11D] border-[#97F11D]/30">Crypto Payment</Badge>
          </div>
          
          <SimpleCryptoPay
            paymentLinkId={paymentLinkId}
            merchantAddress={merchantAddress}
            amount={amount.toString()}
            token={token}
            productName={productName}
            onSuccess={handlePaymentSuccess}
            onError={handlePaymentError}
          />
        </div>
      )}

      {/* Fiat Payment (Crossmint) */}
      {selectedMethod === 'fiat' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => setSelectedMethod(null)}
              className="flex items-center space-x-2 text-gray-400 hover:text-white hover:bg-white/10"
            >
              <CreditCard className="h-4 w-4" />
              <span>Back to payment methods</span>
            </Button>
            <Badge className="bg-[#97F11D]/20 text-[#97F11D] border-[#97F11D]/30">Fiat Payment</Badge>
          </div>
          
          <SecureCrossmintCheckout
            paymentLinkId={paymentLinkId}
            amount={amount}
            currency="USD"
            productName={productName}
            onSuccess={handlePaymentSuccess}
            onError={handlePaymentError}
          />
        </div>
      )}

      {/* Apple Pay */}
      {selectedMethod === 'apple_pay' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => setSelectedMethod(null)}
              className="flex items-center space-x-2 text-gray-400 hover:text-white hover:bg-white/10"
            >
              <Apple className="h-4 w-4" />
              <span>Back to payment methods</span>
            </Button>
            <Badge className="bg-[#97F11D]/20 text-[#97F11D] border-[#97F11D]/30">Apple Pay</Badge>
          </div>
          
          <SecureCrossmintCheckout
            paymentLinkId={paymentLinkId}
            amount={amount}
            currency="USD"
            productName={productName}
            onSuccess={handlePaymentSuccess}
            onError={handlePaymentError}
          />
        </div>
      )}

      {/* Google Pay */}
      {selectedMethod === 'google_pay' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => setSelectedMethod(null)}
              className="flex items-center space-x-2 text-gray-400 hover:text-white hover:bg-white/10"
            >
              <Smartphone className="h-4 w-4" />
              <span>Back to payment methods</span>
            </Button>
            <Badge className="bg-[#97F11D]/20 text-[#97F11D] border-[#97F11D]/30">Google Pay</Badge>
          </div>
          
          <SecureCrossmintCheckout
            paymentLinkId={paymentLinkId}
            amount={amount}
            currency="USD"
            productName={productName}
            onSuccess={handlePaymentSuccess}
            onError={handlePaymentError}
          />
        </div>
      )}
    </div>
  );
}
