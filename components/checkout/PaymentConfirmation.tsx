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
      return `https://testnet.flowscan.org/transaction/${transactionReference}`;
    }
    return null;
  };

  const explorerUrl = getExplorerUrl();

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Success Animation */}
      <div className="flex flex-col items-center text-center space-y-4">
        <div className="relative">
          <div className="w-24 h-24 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center animate-scale-in">
            <CheckCircle className="w-16 h-16 text-green-600 dark:text-green-400" />
          </div>
          <div className="absolute inset-0 bg-green-400/20 rounded-full animate-ping"></div>
        </div>
        
        <div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
            Payment Successful!
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Your payment has been processed successfully
          </p>
        </div>
      </div>

      {/* Payment Details Card */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 space-y-4">
        <h3 className="font-semibold text-gray-900 dark:text-white">Payment Details</h3>
        
        <div className="space-y-3">
          <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
            <span className="text-gray-600 dark:text-gray-400">Product</span>
            <span className="font-medium text-gray-900 dark:text-white">{productName}</span>
          </div>
          
          <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
            <span className="text-gray-600 dark:text-gray-400">Amount</span>
            <span className="font-semibold text-gray-900 dark:text-white">{amount}</span>
          </div>
          
          <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
            <span className="text-gray-600 dark:text-gray-400">Payment Method</span>
            <span className="font-medium text-gray-900 dark:text-white">
              {paymentMethod === 'crypto' ? 'Crypto (Flow)' : 'Card (Transak)'}
            </span>
          </div>
          
          {merchantName && (
            <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
              <span className="text-gray-600 dark:text-gray-400">Merchant</span>
              <span className="font-medium text-gray-900 dark:text-white">{merchantName}</span>
            </div>
          )}
          
          <div className="flex justify-between items-start py-2">
            <span className="text-gray-600 dark:text-gray-400">Transaction ID</span>
            <div className="flex flex-col items-end gap-1">
              <span className="font-mono text-sm text-gray-900 dark:text-white">
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

      {/* Email Confirmation Notice */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <p className="text-sm text-blue-900 dark:text-blue-100">
          📧 A confirmation email has been sent to you and the merchant with the payment details.
        </p>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Button
          onClick={() => window.print()}
          variant="outline"
          className="flex-1"
        >
          <Download className="w-4 h-4 mr-2" />
          Download Receipt
        </Button>
        
        {redirectUrl ? (
          <Button
            onClick={() => window.location.href = redirectUrl}
            className="flex-1 bg-[#97F11D] hover:bg-[#97F11D]/90 text-black"
          >
            Return to Merchant {countdown > 0 && `(${countdown}s)`}
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        ) : (
          <Button
            onClick={() => window.location.href = '/'}
            className="flex-1 bg-[#97F11D] hover:bg-[#97F11D]/90 text-black"
          >
            Return to Home
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        )}
      </div>
    </div>
  );
}

