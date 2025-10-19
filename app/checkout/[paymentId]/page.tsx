"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PaymentMethodSelector } from "@/components/checkout/PaymentMethodSelector";
import { CryptoPay } from "@/components/checkout/CryptoPay";
import { FiatPay } from "@/components/checkout/FiatPay";
import { PaymentConfirmation } from "@/components/checkout/PaymentConfirmation";

type CheckoutStep = 'select' | 'payment' | 'confirmation';
type PaymentMethod = 'crypto' | 'fiat' | null;

interface PaymentLinkData {
  id: string;
  product_name: string;
  description: string;
  amount: string;
  token: string;
  merchant_id: string;
  accept_crypto: boolean;
  accept_fiat: boolean;
  redirect_url?: string;
  users?: {
    wallet_address: string;
    display_name?: string;
  };
}

export default function CheckoutPage() {
  const params = useParams();
  const router = useRouter();
  const paymentId = params.paymentId as string;

  const [step, setStep] = useState<CheckoutStep>('select');
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>(null);
  const [loading, setLoading] = useState(true);
  const [paymentData, setPaymentData] = useState<PaymentLinkData | null>(null);
  const [transactionReference, setTransactionReference] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPaymentLink();
  }, [paymentId]);

  const fetchPaymentLink = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/payment-links/${paymentId}`);

      if (!response.ok) {
        throw new Error('Payment link not found');
      }

      const data = await response.json();
      setPaymentData(data.paymentLink);
    } catch (err: any) {
      console.error('Error fetching payment link:', err);
      setError(err.message || 'Failed to load payment link');
    } finally {
      setLoading(false);
    }
  };

  const handleMethodSelect = (method: 'crypto' | 'fiat') => {
    setSelectedMethod(method);
    setStep('payment');
  };

  const handlePaymentSuccess = (reference: string) => {
    setTransactionReference(reference);
    setStep('confirmation');
  };

  const handlePaymentError = (errorMessage: string) => {
    setError(errorMessage);
    // Stay on payment step to allow retry
  };

  const handleBackToSelect = () => {
    setStep('select');
    setSelectedMethod(null);
    setError(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#0A0A0A] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-[#97F11D] animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading payment details...</p>
        </div>
      </div>
    );
  }

  if (error && !paymentData) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#0A0A0A] flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle className="text-red-600 dark:text-red-400">Payment Link Not Found</CardTitle>
            <CardDescription>
              The payment link you're looking for doesn't exist or has expired.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push('/')} className="w-full">
              Return to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!paymentData) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0A0A0A] py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            {step !== 'select' && step !== 'confirmation' && (
              <button
                onClick={handleBackToSelect}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
            )}
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                FlowPay Checkout
              </h1>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Secure payment powered by Flow blockchain
              </p>
            </div>
          </div>

          {/* Progress Indicator */}
          <div className="flex items-center gap-2">
            <div className={`flex-1 h-1 rounded-full ${
              step === 'select' ? 'bg-[#97F11D]' : 'bg-gray-300 dark:bg-gray-700'
            }`} />
            <div className={`flex-1 h-1 rounded-full ${
              step === 'payment' ? 'bg-[#97F11D]' : 'bg-gray-300 dark:bg-gray-700'
            }`} />
            <div className={`flex-1 h-1 rounded-full ${
              step === 'confirmation' ? 'bg-[#97F11D]' : 'bg-gray-300 dark:bg-gray-700'
            }`} />
          </div>
        </div>

        {/* Main Content */}
        <div className="space-y-6">
          {/* Product Summary Card */}
          <Card>
            <CardHeader>
              <CardTitle>{paymentData.product_name}</CardTitle>
              {paymentData.description && (
                <CardDescription>{paymentData.description}</CardDescription>
              )}
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">Amount</span>
                <span className="text-2xl font-bold text-gray-900 dark:text-white">
                  ${paymentData.amount} USD
                </span>
              </div>
              {paymentData.users?.display_name && (
                <div className="flex justify-between items-center mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Merchant</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {paymentData.users.display_name}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Step Content */}
          <Card>
            <CardContent className="pt-6">
              {step === 'select' && (
                <PaymentMethodSelector
                  acceptCrypto={paymentData.accept_crypto}
                  acceptFiat={paymentData.accept_fiat}
                  selectedMethod={selectedMethod}
                  onSelect={handleMethodSelect}
                />
              )}

              {step === 'payment' && selectedMethod === 'fiat' && (
                <FiatPay
                  paymentLinkId={paymentData.id}
                  merchantWalletAddress={paymentData.users?.wallet_address || ''}
                  amount={paymentData.amount}
                  productName={paymentData.product_name}
                  onSuccess={(orderData) => handlePaymentSuccess(orderData.status?.id || orderData.orderReference)}
                  onError={handlePaymentError}
                />
              )}

              {step === 'payment' && selectedMethod === 'crypto' && (
                <CryptoPay
                  paymentLinkId={paymentData.id}
                  merchantAddress={paymentData.users?.wallet_address || ''}
                  amount={paymentData.amount}
                  token={paymentData.token}
                  productName={paymentData.product_name}
                  onSuccess={handlePaymentSuccess}
                  onError={handlePaymentError}
                />
              )}

              {step === 'confirmation' && (
                <PaymentConfirmation
                  paymentMethod={selectedMethod || 'crypto'}
                  transactionReference={transactionReference}
                  amount={`$${paymentData.amount} USD`}
                  productName={paymentData.product_name}
                  merchantName={paymentData.users?.display_name}
                  redirectUrl={paymentData.redirect_url}
                />
              )}
            </CardContent>
          </Card>

          {/* Security Notice */}
          {step !== 'confirmation' && (
            <div className="text-center text-xs text-gray-500 dark:text-gray-400">
              <p>🔒 Secured by Flow Blockchain & Transak</p>
              <p className="mt-1">Your payment information is encrypted and secure</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

