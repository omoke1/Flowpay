"use client";

import { useState } from "react";
import { useFlowUser } from "@/components/providers/flow-provider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, Wallet, Loader2, CheckCircle, AlertCircle } from "lucide-react";

interface RegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function RegistrationModal({ isOpen, onClose, onSuccess }: RegistrationModalProps) {
  const { logIn, loading, error } = useFlowUser();
  const [selectedMethod, setSelectedMethod] = useState<'external' | 'flowport' | null>(null);
  const [step, setStep] = useState<'select' | 'authenticating' | 'success'>('select');

  if (!isOpen) return null;

  const handleAuthentication = async (method: 'external' | 'flowport') => {
    setSelectedMethod(method);
    setStep('authenticating');
    
    try {
      await logIn(method);
      setStep('success');
      
      // Auto-close after success
      setTimeout(() => {
        onSuccess?.();
        onClose();
        setStep('select');
        setSelectedMethod(null);
      }, 2000);
    } catch (err) {
      setStep('select');
      setSelectedMethod(null);
    }
  };

  const handleClose = () => {
    if (step !== 'authenticating') {
      onClose();
      setStep('select');
      setSelectedMethod(null);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-white dark:bg-[#111111] border-gray-200 dark:border-gray-800">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
                {step === 'select' && 'Connect to FlowPay'}
                {step === 'authenticating' && 'Connecting...'}
                {step === 'success' && 'Welcome to FlowPay!'}
              </CardTitle>
              <CardDescription className="text-sm text-gray-500 dark:text-gray-400">
                {step === 'select' && 'Choose how you want to connect your wallet'}
                {step === 'authenticating' && 'Please complete the authentication process'}
                {step === 'success' && 'You are now connected and ready to use FlowPay'}
              </CardDescription>
            </div>
            {step !== 'authenticating' && (
              <button 
                onClick={handleClose}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </CardHeader>
        
        <CardContent>
          {step === 'select' && (
            <div className="space-y-4">
              {/* Flow Port Option */}
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:border-[#97F11D] dark:hover:border-[#97F11D] transition-colors">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                    <Mail className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900 dark:text-white">Email Registration</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      Create a managed wallet with your email address. Perfect for beginners.
                    </p>
                    <div className="mt-3">
                      <Button
                        onClick={() => handleAuthentication('flowport')}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                        disabled={loading}
                      >
                        {loading && selectedMethod === 'flowport' ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Creating Account...
                          </>
                        ) : (
                          <>
                            <Mail className="w-4 h-4 mr-2" />
                            Sign up with Email
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* External Wallet Option */}
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:border-[#97F11D] dark:hover:border-[#97F11D] transition-colors">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-10 h-10 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                    <Wallet className="w-5 h-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900 dark:text-white">External Wallet</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      Connect your existing Flow wallet (Blocto, Ledger, etc.)
                    </p>
                    <div className="mt-3">
                      <Button
                        onClick={() => handleAuthentication('external')}
                        className="w-full bg-[#97F11D] hover:bg-[#97F11D]/90 text-black font-medium"
                        disabled={loading}
                      >
                        {loading && selectedMethod === 'external' ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Connecting...
                          </>
                        ) : (
                          <>
                            <Wallet className="w-4 h-4 mr-2" />
                            Connect Wallet
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Error Display */}
              {error && (
                <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 flex-shrink-0" />
                  <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
                </div>
              )}
            </div>
          )}

          {step === 'authenticating' && (
            <div className="text-center py-8">
              <Loader2 className="w-12 h-12 text-[#97F11D] animate-spin mx-auto mb-4" />
              <h3 className="font-medium text-gray-900 dark:text-white mb-2">
                {selectedMethod === 'flowport' ? 'Creating your managed wallet...' : 'Connecting to your wallet...'}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {selectedMethod === 'flowport' 
                  ? 'Please complete the email verification process'
                  : 'Please approve the connection in your wallet'
                }
              </p>
            </div>
          )}

          {step === 'success' && (
            <div className="text-center py-8">
              <CheckCircle className="w-12 h-12 text-green-600 dark:text-green-400 mx-auto mb-4" />
              <h3 className="font-medium text-gray-900 dark:text-white mb-2">
                Successfully Connected!
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                You can now access your FlowPay dashboard
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
