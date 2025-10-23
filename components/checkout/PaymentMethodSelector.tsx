"use client";

import { useState } from "react";
import { CreditCard, Coins, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface PaymentMethodSelectorProps {
  onSelectMethod: (method: 'crypto' | 'fiat') => void;
  productName: string;
  amount: string;
}

export function PaymentMethodSelector({ onSelectMethod, productName, amount }: PaymentMethodSelectorProps) {
  const [selectedMethod, setSelectedMethod] = useState<'crypto' | 'fiat' | null>(null);

  const handleMethodSelect = (method: 'crypto' | 'fiat') => {
    setSelectedMethod(method);
  };

  const handleContinue = () => {
    if (selectedMethod) {
      onSelectMethod(selectedMethod);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Choose Payment Method
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Select how you'd like to pay for {productName}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Crypto Payment Option */}
        <Card 
          className={`cursor-pointer transition-all duration-200 ${
            selectedMethod === 'crypto' 
              ? 'ring-2 ring-green-500 bg-green-50 dark:bg-green-900/20' 
              : 'hover:shadow-lg'
          }`}
          onClick={() => handleMethodSelect('crypto')}
        >
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
              <Coins className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <CardTitle className="text-lg">Crypto Payment</CardTitle>
            <CardDescription>
              Pay with FLOW or USDC tokens
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Amount:</span>
                <span className="font-medium">${amount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Speed:</span>
                <span className="font-medium text-green-600">Instant</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Fees:</span>
                <span className="font-medium">Low</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Fiat Payment Option */}
        <Card 
          className={`cursor-pointer transition-all duration-200 ${
            selectedMethod === 'fiat' 
              ? 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-900/20' 
              : 'hover:shadow-lg'
          }`}
          onClick={() => handleMethodSelect('fiat')}
        >
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
              <CreditCard className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <CardTitle className="text-lg">Fiat Payment</CardTitle>
            <CardDescription>
              Credit card or bank transfer
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Amount:</span>
                <span className="font-medium">${amount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Speed:</span>
                <span className="font-medium text-amber-600">1-3 days</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Status:</span>
                <span className="font-medium text-amber-600">Coming Soon</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Continue Button */}
      <div className="flex justify-center">
        <Button
          onClick={handleContinue}
          disabled={!selectedMethod}
          className="px-8 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Continue
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>

      {selectedMethod && (
        <div className="text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {selectedMethod === 'crypto' 
              ? 'You will be redirected to connect your Flow wallet'
              : 'Fiat payments are coming soon! You can still use crypto payment.'
            }
          </p>
        </div>
      )}
    </div>
  );
}
