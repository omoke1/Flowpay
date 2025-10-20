"use client";

import { CreditCard, Wallet } from "lucide-react";

interface PaymentMethodSelectorProps {
  acceptCrypto: boolean;
  acceptFiat: boolean;
  selectedMethod: 'crypto' | 'fiat' | null;
  onSelect: (method: 'crypto' | 'fiat') => void;
}

export function PaymentMethodSelector({
  acceptCrypto,
  acceptFiat,
  selectedMethod,
  onSelect,
}: PaymentMethodSelectorProps) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-semibold text-white mb-2">
          Choose Payment Method
        </h3>
        <p className="text-white/70 text-sm">
          Select how you'd like to pay for this purchase
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Show message if no payment methods are available */}
        {!acceptFiat && !acceptCrypto && (
          <div className="col-span-2 text-center py-12">
            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <p className="text-white/70">
              No payment methods are currently available for this link.
            </p>
          </div>
        )}
        
        {/* Card Payment Option */}
        {acceptFiat && (
          <button
            onClick={() => onSelect('fiat')}
            className={`relative p-6 rounded-2xl border transition-all duration-200 group ${
              selectedMethod === 'fiat'
                ? 'border-[#97F11D] bg-[#97F11D]/10 shadow-lg shadow-[#97F11D]/20'
                : 'border-white/20 bg-white/5 hover:border-white/30 hover:bg-white/10'
            }`}
          >
            <div className="flex flex-col items-center text-center space-y-4">
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-200 ${
                selectedMethod === 'fiat'
                  ? 'bg-[#97F11D] text-black shadow-lg'
                  : 'bg-blue-500/20 text-blue-400 group-hover:bg-blue-500/30'
              }`}>
                <CreditCard className="w-8 h-8" />
              </div>
              
              <div>
                <h4 className="font-semibold text-white mb-1">
                  Pay with Card
                </h4>
                <p className="text-sm text-white/70">
                  Visa, Mastercard, Apple Pay
                </p>
              </div>
              
              <div className="flex items-center gap-2 pt-2">
                <div className="px-3 py-1 rounded-full bg-white/10 text-xs font-medium text-white/80">
                  Visa
                </div>
                <div className="px-3 py-1 rounded-full bg-white/10 text-xs font-medium text-white/80">
                  Mastercard
                </div>
              </div>
            </div>
            
            {selectedMethod === 'fiat' && (
              <div className="absolute top-4 right-4">
                <div className="w-6 h-6 rounded-full bg-[#97F11D] flex items-center justify-center shadow-lg">
                  <svg className="w-4 h-4 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
            )}
          </button>
        )}

        {/* Crypto Payment Option */}
        {acceptCrypto && (
          <button
            onClick={() => onSelect('crypto')}
            className={`relative p-6 rounded-2xl border transition-all duration-200 group ${
              selectedMethod === 'crypto'
                ? 'border-[#97F11D] bg-[#97F11D]/10 shadow-lg shadow-[#97F11D]/20'
                : 'border-white/20 bg-white/5 hover:border-white/30 hover:bg-white/10'
            }`}
          >
            <div className="flex flex-col items-center text-center space-y-4">
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-200 ${
                selectedMethod === 'crypto'
                  ? 'bg-[#97F11D] text-black shadow-lg'
                  : 'bg-green-500/20 text-green-400 group-hover:bg-green-500/30'
              }`}>
                <Wallet className="w-8 h-8" />
              </div>
              
              <div>
                <h4 className="font-semibold text-white mb-1">
                  Pay with Crypto
                </h4>
                <p className="text-sm text-white/70">
                  FLOW, USDC.e
                </p>
              </div>
              
              <div className="flex items-center gap-2 pt-2">
                <div className="px-3 py-1 rounded-full bg-white/10 text-xs font-medium text-white/80">
                  Flow
                </div>
                <div className="px-3 py-1 rounded-full bg-white/10 text-xs font-medium text-white/80">
                  USDC.e
                </div>
              </div>
            </div>
            
            {selectedMethod === 'crypto' && (
              <div className="absolute top-4 right-4">
                <div className="w-6 h-6 rounded-full bg-[#97F11D] flex items-center justify-center shadow-lg">
                  <svg className="w-4 h-4 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
            )}
          </button>
        )}
      </div>
    </div>
  );
}

