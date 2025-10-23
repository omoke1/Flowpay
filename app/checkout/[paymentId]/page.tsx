"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useNotification } from "@/components/providers/notification-provider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PaymentMethodSelector } from "@/components/checkout/PaymentMethodSelector";
import { SimpleCryptoPay } from "@/components/checkout/SimpleCryptoPay";
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
  merchant_wallet_address?: string;
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
  const { success, error: showError } = useNotification();
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
      const link = data.paymentLink;
      
      // Validate that at least one payment method is available
      if (!link.accept_crypto && !link.accept_fiat) {
        throw new Error('No payment methods available for this link');
      }
      
      setPaymentData(link);
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
    
    // Show success notification
    success(
      "Payment Successful! 🎉",
      "Your payment has been processed successfully"
    );
  };

  const handlePaymentError = (errorMessage: string) => {
    setError(errorMessage);
    
    // Show error notification
    showError(
      "Payment Failed",
      errorMessage || "Something went wrong. Please try again."
    );
    
    // Stay on payment step to allow retry
  };

  const handleBackToSelect = () => {
    setStep('select');
    setSelectedMethod(null);
    setError(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center">
        <div className="text-center">
          <div className="glass p-8 rounded-2xl border border-white/10">
            <Loader2 className="w-12 h-12 text-[#97F11D] animate-spin mx-auto mb-4" />
            <p className="text-white/80">Loading payment details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error && !paymentData) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center p-4">
        <div className="glass max-w-md w-full p-8 rounded-2xl border border-white/10">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-white mb-2">Payment Link Not Found</h2>
            <p className="text-white/70 mb-6">
              The payment link you're looking for doesn't exist or has expired.
            </p>
            <Button 
              onClick={() => router.push('/')} 
              className="w-full bg-[#97F11D] hover:bg-[#97F11D]/90 text-black font-medium"
            >
              Return to Home
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!paymentData) {
    return null;
  }

  return (
    <div className="min-h-screen gradient-bg py-4 sm:py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
            {step !== 'select' && step !== 'confirmation' && (
              <button
                onClick={handleBackToSelect}
                className="p-2 sm:p-3 hover:bg-white/10 rounded-xl transition-all duration-200 backdrop-blur-sm border border-white/10"
              >
                <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 text-white/80" />
              </button>
            )}
            <div className="flex-1">
              <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1 sm:mb-2">
                FlowPay Checkout
              </h1>
                      <p className="text-gray-500 text-xs sm:text-sm">
                        Secure payment powered by Flow blockchain
                      </p>
            </div>
          </div>

          {/* Progress Indicator */}
          <div className="glass p-3 sm:p-4 rounded-xl border border-white/10">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className={`flex-1 h-1.5 sm:h-2 rounded-full transition-all duration-300 ${
                step === 'select' ? 'bg-[#97F11D] shadow-lg shadow-[#97F11D]/30' : 'bg-white/20'
              }`} />
              <div className={`flex-1 h-1.5 sm:h-2 rounded-full transition-all duration-300 ${
                step === 'payment' ? 'bg-[#97F11D] shadow-lg shadow-[#97F11D]/30' : 'bg-white/20'
              }`} />
              <div className={`flex-1 h-1.5 sm:h-2 rounded-full transition-all duration-300 ${
                step === 'confirmation' ? 'bg-[#97F11D] shadow-lg shadow-[#97F11D]/30' : 'bg-white/20'
              }`} />
            </div>
                    <div className="flex justify-between mt-2 sm:mt-3 text-xs text-gray-500">
              <span className={step === 'select' ? 'text-[#97F11D] font-medium' : ''}>Select Method</span>
              <span className={step === 'payment' ? 'text-[#97F11D] font-medium' : ''}>Payment</span>
              <span className={step === 'confirmation' ? 'text-[#97F11D] font-medium' : ''}>Complete</span>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="space-y-4 sm:space-y-6">
          {/* Product Summary Card */}
          <div className="glass p-4 sm:p-6 rounded-2xl border border-white/10 card-glow">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
              <div className="flex-1">
                <h2 className="text-lg sm:text-xl font-semibold text-white mb-2">
                  {paymentData.product_name}
                </h2>
                        {paymentData.description && (
                          <p className="text-gray-500 text-sm leading-relaxed">
                            {paymentData.description}
                          </p>
                        )}
              </div>
              <div className="text-left sm:text-right">
                <div className="text-2xl sm:text-3xl font-bold text-[#97F11D] mb-1">
                  ${paymentData.amount}
                </div>
                        <div className="text-gray-500 text-sm">USD</div>
              </div>
            </div>
            
            {paymentData.users?.display_name && (
              <div className="pt-4 border-t border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-[#97F11D]/20 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-[#97F11D]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <div>
                            <div className="text-gray-500 text-xs">Merchant</div>
                    <div className="text-white font-medium">
                      {paymentData.users.display_name}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Step Content */}
          <div className="glass p-4 sm:p-6 rounded-2xl border border-white/10">
            {step === 'select' && (
              <PaymentMethodSelector
                onSelectMethod={handleMethodSelect}
                productName={paymentData.product_name}
                amount={paymentData.amount}
              />
            )}

            {step === 'payment' && selectedMethod === 'fiat' && (
              <FiatPay
                paymentLinkId={paymentData.id}
                merchantAddress={paymentData.merchant_wallet_address || paymentData.users?.wallet_address || ''}
                amount={paymentData.amount}
                token={paymentData.token}
                productName={paymentData.product_name}
                onSuccess={handlePaymentSuccess}
                onError={handlePaymentError}
              />
            )}

            {step === 'payment' && selectedMethod === 'crypto' && (
                <SimpleCryptoPay
                paymentLinkId={paymentData.id}
                merchantAddress={paymentData.merchant_wallet_address || paymentData.users?.wallet_address || ''}
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
          </div>

          {/* Security Notice */}
          {step !== 'confirmation' && (
            <div className="glass p-3 sm:p-4 rounded-xl border border-white/10 text-center">
                      <div className="flex items-center justify-center gap-2 text-gray-500 text-xs sm:text-sm">
                <svg className="w-3 h-3 sm:w-4 sm:h-4 text-[#97F11D]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <span>Secured by Flow Blockchain & Transak</span>
              </div>
                      <p className="text-gray-500 text-xs mt-1">Your payment information is encrypted and secure</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

