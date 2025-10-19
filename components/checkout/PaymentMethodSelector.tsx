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
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
        Choose Payment Method
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Card Payment Option */}
        {acceptFiat && (
          <button
            onClick={() => onSelect('fiat')}
            className={`relative p-6 rounded-xl border-2 transition-all ${
              selectedMethod === 'fiat'
                ? 'border-[#97F11D] bg-[#97F11D]/5'
                : 'border-gray-200 dark:border-gray-700 hover:border-[#97F11D]/50'
            }`}
          >
            <div className="flex flex-col items-center text-center space-y-3">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
                selectedMethod === 'fiat'
                  ? 'bg-[#97F11D] text-black'
                  : 'bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
              }`}>
                <CreditCard className="w-8 h-8" />
              </div>
              
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white">
                  Pay with Card
                </h4>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Visa, Mastercard, Apple Pay
                </p>
              </div>
              
              <div className="flex items-center gap-2 pt-2">
                <img 
                  src="https://upload.wikimedia.org/wikipedia/commons/0/04/Visa.svg" 
                  alt="Visa" 
                  className="h-6"
                />
                <img 
                  src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" 
                  alt="Mastercard" 
                  className="h-6"
                />
              </div>
            </div>
            
            {selectedMethod === 'fiat' && (
              <div className="absolute top-3 right-3">
                <div className="w-6 h-6 rounded-full bg-[#97F11D] flex items-center justify-center">
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
            className={`relative p-6 rounded-xl border-2 transition-all ${
              selectedMethod === 'crypto'
                ? 'border-[#97F11D] bg-[#97F11D]/5'
                : 'border-gray-200 dark:border-gray-700 hover:border-[#97F11D]/50'
            }`}
          >
            <div className="flex flex-col items-center text-center space-y-3">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
                selectedMethod === 'crypto'
                  ? 'bg-[#97F11D] text-black'
                  : 'bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400'
              }`}>
                <Wallet className="w-8 h-8" />
              </div>
              
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white">
                  Pay with Crypto
                </h4>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  FLOW, USDC.e
                </p>
              </div>
              
              <div className="flex items-center gap-2 pt-2">
                <div className="px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-xs font-medium text-gray-700 dark:text-gray-300">
                  Flow
                </div>
                <div className="px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-xs font-medium text-gray-700 dark:text-gray-300">
                  USDC.e
                </div>
              </div>
            </div>
            
            {selectedMethod === 'crypto' && (
              <div className="absolute top-3 right-3">
                <div className="w-6 h-6 rounded-full bg-[#97F11D] flex items-center justify-center">
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

