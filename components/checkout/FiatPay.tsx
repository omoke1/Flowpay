"use client";

import { useState } from "react";
import { Loader2, CreditCard, AlertCircle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface FiatPayProps {
  paymentLinkId: string;
  merchantAddress: string;
  amount: string;
  token: string;
  productName: string;
  onSuccess: (txHash: string) => void;
  onError: (error: string) => void;
}

export function FiatPay({
  paymentLinkId,
  merchantAddress,
  amount,
  token,
  productName,
  onSuccess,
  onError,
}: FiatPayProps) {
  const [loading, setLoading] = useState(false);

  const handleFiatPayment = async () => {
    setLoading(true);
    
    try {
      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Show coming soon message
      onError("Fiat payments are coming soon! Please use crypto payment for now.");
    } catch (error) {
      onError("Fiat payments are coming soon! Please use crypto payment for now.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
          <CreditCard className="h-6 w-6 text-blue-600 dark:text-blue-400" />
        </div>
        <CardTitle className="text-xl">Fiat Payment</CardTitle>
        <CardDescription>
          Pay with credit card or bank transfer
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Coming Soon Banner */}
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <Clock className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            <div>
              <h3 className="font-medium text-amber-800 dark:text-amber-200">Coming Soon</h3>
              <p className="text-sm text-amber-700 dark:text-amber-300">
                Fiat payments are being developed. Use crypto payment for now.
              </p>
            </div>
          </div>
        </div>

        {/* Payment Details */}
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">Product:</span>
            <span className="font-medium">{productName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">Amount:</span>
            <span className="font-medium">${amount} USD</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">Method:</span>
            <span className="font-medium">Credit Card / Bank Transfer</span>
          </div>
        </div>

        {/* Coming Soon Button */}
        <Button
          onClick={handleFiatPayment}
          disabled={true}
          className="w-full bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 cursor-not-allowed"
        >
          <Clock className="mr-2 h-4 w-4" />
          Coming Soon
        </Button>

        <div className="text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Use crypto payment for instant processing
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
