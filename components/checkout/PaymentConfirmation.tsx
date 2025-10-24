"use client";

import { useEffect, useState } from "react";
import { CheckCircle, ExternalLink, Download, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PaymentConfirmationProps {
  paymentMethod: 'crypto' | 'fiat';
  transactionReference: string;
  amount: string;
  productName: string;
  merchantName?: string;
  redirectUrl?: string;
}

export function PaymentConfirmation({
  paymentMethod,
  transactionReference,
  amount,
  productName,
  merchantName,
  redirectUrl,
}: PaymentConfirmationProps) {
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    if (redirectUrl && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (redirectUrl && countdown === 0) {
      window.location.href = redirectUrl;
    }
  }, [countdown, redirectUrl]);

  const getExplorerUrl = () => {
    if (paymentMethod === 'crypto') {
      return `https://flowscan.org/transaction/${transactionReference}`;
    }
    return null;
  };

  const explorerUrl = getExplorerUrl();

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in">
      {/* Success Animation */}
      <div className="flex flex-col items-center text-center space-y-4">
        <div className="relative">
          {/* Professional Checkmark with glassmorphic design */}
          <div className="w-20 h-20 sm:w-24 sm:h-24 bg-[#97F11D]/20 backdrop-blur-sm rounded-full flex items-center justify-center animate-scale-in border border-[#97F11D]/30">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-[#97F11D] rounded-full flex items-center justify-center shadow-lg shadow-[#97F11D]/30">
              <svg className="w-6 h-6 sm:w-8 sm:h-8 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
          <div className="absolute inset-0 bg-[#97F11D]/10 rounded-full animate-ping"></div>
        </div>
        
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white">
            Payment Successful!
          </h2>
                  <p className="text-gray-500 mt-2 text-sm sm:text-base">
                    Your payment has been processed successfully
                  </p>
        </div>
      </div>

      {/* Payment Details Card - Glassmorphic Design */}
      <div className="glass p-4 sm:p-6 rounded-2xl border border-white/10 card-glow space-y-4">
        <h3 className="font-semibold text-white text-lg sm:text-xl">Payment Details</h3>
        
        <div className="space-y-3">
                  <div className="flex justify-between items-center py-2 border-b border-white/10">
                    <span className="text-gray-500 text-sm sm:text-base">Product</span>
                    <span className="font-medium text-white text-sm sm:text-base">{productName}</span>
                  </div>
          
          <div className="flex justify-between items-center py-2 border-b border-white/10">
            <span className="text-gray-500 text-sm sm:text-base">Amount</span>
            <span className="font-semibold text-[#97F11D] text-sm sm:text-base">{amount}</span>
          </div>
          
          <div className="flex justify-between items-center py-2 border-b border-white/10">
            <span className="text-gray-500 text-sm sm:text-base">Payment Method</span>
            <span className="font-medium text-white text-sm sm:text-base">
              {paymentMethod === 'crypto' ? 'Crypto (Flow)' : 'Card (Transak)'}
            </span>
          </div>
          
          {merchantName && (
            <div className="flex justify-between items-center py-2 border-b border-white/10">
              <span className="text-gray-500 text-sm sm:text-base">Merchant</span>
              <span className="font-medium text-white text-sm sm:text-base">{merchantName}</span>
            </div>
          )}
          
          <div className="flex justify-between items-start py-2">
            <span className="text-gray-500 text-sm sm:text-base">Transaction ID</span>
            <div className="flex flex-col items-end gap-1">
              <span className="font-mono text-xs sm:text-sm text-white">
                {transactionReference.slice(0, 8)}...{transactionReference.slice(-8)}
              </span>
              {explorerUrl && (
                <a
                  href={explorerUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-[#97F11D] hover:underline flex items-center gap-1"
                >
                  View on Explorer
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Email Confirmation Notice - Glassmorphic Design */}
      <div className="glass p-4 rounded-xl border border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center flex-shrink-0">
            <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
                  <p className="text-sm text-gray-500">
                    A confirmation email has been sent to you and the merchant with the payment details.
                  </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Button
          onClick={() => window.print()}
          variant="outline"
          className="flex-1 bg-white/10 border-white/20 text-white hover:bg-white/20"
        >
          <Download className="w-4 h-4 mr-2" />
          Download Receipt
        </Button>
        
        {redirectUrl ? (
          <Button
            onClick={() => window.location.href = redirectUrl}
            className="flex-1 bg-[#97F11D] hover:bg-[#97F11D]/90 text-black font-medium"
          >
            Return to Merchant {countdown > 0 && `(${countdown}s)`}
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        ) : (
          <Button
            onClick={() => window.location.href = '/'}
            className="flex-1 bg-[#97F11D] hover:bg-[#97F11D]/90 text-black font-medium"
          >
            Return to Home
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        )}
      </div>
    </div>
  );
}

