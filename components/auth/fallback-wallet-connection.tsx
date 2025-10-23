"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Wallet, 
  AlertCircle, 
  CheckCircle,
  Loader2,
  ExternalLink
} from 'lucide-react';

interface FallbackWalletConnectionProps {
  onSuccess: (address: string) => void;
  onClose: () => void;
}

export function FallbackWalletConnection({ onSuccess, onClose }: FallbackWalletConnectionProps) {
  const [step, setStep] = useState<'select' | 'manual' | 'success'>('select');
  const [manualAddress, setManualAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleManualAddress = async () => {
    if (!manualAddress || !manualAddress.startsWith('0x')) {
      setError('Please enter a valid Flow address (starts with 0x)');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Simulate address validation
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // For now, just accept any valid-looking address
      if (manualAddress.length >= 8) {
        setStep('success');
        setTimeout(() => {
          onSuccess(manualAddress);
        }, 1000);
      } else {
        setError('Invalid Flow address format');
      }
    } catch (err) {
      setError('Failed to validate address');
    } finally {
      setLoading(false);
    }
  };

  const handleExternalWallet = () => {
    // Open Flow Port or other wallet
    window.open('https://port.onflow.org/', '_blank');
  };

  if (step === 'success') {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <Card className="w-full max-w-md bg-black dark:bg-[#0D0D0D] border border-zinc-100/10 dark:border-white/10">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-green-900/20 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="w-6 h-6 text-green-500" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-100 dark:text-white">
              Wallet Connected!
            </CardTitle>
            <CardDescription className="text-gray-100 dark:text-white/70">
              Your Flow wallet is now connected
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <p className="text-sm text-gray-100 dark:text-white/70 mb-4">
                Address: {manualAddress.slice(0, 6)}...{manualAddress.slice(-4)}
              </p>
              <Button
                onClick={onClose}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              >
                Continue
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md bg-black dark:bg-[#0D0D0D] border border-zinc-100/10 dark:border-white/10">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-yellow-900/20 rounded-full flex items-center justify-center mb-4">
            <AlertCircle className="w-6 h-6 text-yellow-500" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-100 dark:text-white">
            Flow Services Unavailable
          </CardTitle>
          <CardDescription className="text-gray-100 dark:text-white/70">
            Flow Discovery API is currently down. Use alternative connection methods.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {step === 'select' && (
            <>
              <div className="space-y-3">
                <Button
                  onClick={() => setStep('manual')}
                  variant="outline"
                  className="w-full border-zinc-100/10 dark:border-white/20 text-gray-100 dark:text-white hover:bg-black/[0.06] dark:hover:bg-white/10"
                >
                  <Wallet className="w-4 h-4 mr-2" />
                  Enter Wallet Address Manually
                </Button>
                
                <Button
                  onClick={handleExternalWallet}
                  variant="outline"
                  className="w-full border-zinc-100/10 dark:border-white/20 text-gray-100 dark:text-white hover:bg-black/[0.06] dark:hover:bg-white/10"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Open Flow Port Wallet
                </Button>
              </div>

              <div className="text-center">
                <Button
                  onClick={onClose}
                  variant="ghost"
                  className="text-gray-100 dark:text-white/70 hover:text-gray-100 dark:hover:text-white"
                >
                  Cancel
                </Button>
              </div>
            </>
          )}

          {step === 'manual' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-gray-100 dark:text-white">Flow Wallet Address</Label>
                <Input
                  value={manualAddress}
                  onChange={(e) => setManualAddress(e.target.value)}
                  placeholder="0x1234567890abcdef..."
                  className="bg-black/[0.06] dark:bg-white/5 border-zinc-100/10 dark:border-white/10 text-gray-100 dark:text-white"
                />
                <p className="text-xs text-gray-100 dark:text-white/70">
                  Enter your Flow wallet address (starts with 0x)
                </p>
              </div>

              {error && (
                <div className="flex items-center space-x-2 text-red-600">
                  <AlertCircle className="w-4 h-4" />
                  <span className="text-sm">{error}</span>
                </div>
              )}

              <div className="flex space-x-2">
                <Button
                  onClick={() => setStep('select')}
                  variant="outline"
                  className="flex-1 border-zinc-100/10 dark:border-white/20 text-gray-100 dark:text-white hover:bg-black/[0.06] dark:hover:bg-white/10"
                >
                  Back
                </Button>
                <Button
                  onClick={handleManualAddress}
                  disabled={!manualAddress || loading}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    'Connect'
                  )}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}


