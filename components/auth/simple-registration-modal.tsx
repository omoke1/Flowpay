"use client";

import { useState, useEffect } from "react";
import { useFlowMinimal } from "@/components/providers/flow-provider-minimal";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, Wallet, Loader2, CheckCircle, AlertCircle } from "lucide-react";

interface RegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function SimpleRegistrationModal({ isOpen, onClose, onSuccess }: RegistrationModalProps) {
  const { connectWallet, isLoading, error, isConnected, user } = useFlowMinimal();
  const [step, setStep] = useState<'select' | 'email-form' | 'authenticating' | 'success'>('select');
  const [selectedMethod, setSelectedMethod] = useState<'external' | 'email' | null>(null);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [registrationError, setRegistrationError] = useState<string | null>(null);

  // Watch for connection changes
  useEffect(() => {
    console.log("Modal state:", { isConnected, user, step, selectedMethod });
    if (isConnected && user && step === 'authenticating') {
      console.log("Connection successful, moving to success step");
      setStep('success');
      
      // Auto-close after success
      setTimeout(() => {
        onSuccess?.();
        onClose();
        setStep('select');
        setSelectedMethod(null);
      }, 2000);
    }
  }, [isConnected, user, step, onSuccess, onClose]);

  if (!isOpen) return null;

  const handleConnectWallet = async () => {
    setSelectedMethod('external');
    setStep('authenticating');
    
    try {
      await connectWallet();
    } catch (err) {
      console.error("Wallet connection failed:", err);
      setStep('select');
    }
  };

  const handleEmailRegistration = async () => {
    setSelectedMethod('email');
    setStep('authenticating');
    
    try {
      // Show email form for real account creation
      setStep('email-form');
    } catch (err) {
      console.error("Email registration failed:", err);
      setStep('select');
    }
  };

  const handleEmailFormSubmit = async (email: string, name: string) => {
    setStep('authenticating');
    
    try {
      console.log("Creating Flow account with email:", email);
      
      // Call the account creation API
      const response = await fetch('/api/auth/create-account', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, name }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create account');
      }

      console.log("Account created successfully:", result.account);

      // Set the user in the Flow provider
      if (result.account) {
        // Create a user object that matches the Flow provider format
        const flowUser = {
          addr: result.account.address,
          loggedIn: true,
          email: result.account.email,
          name: result.account.name,
          balance: result.account.balance
        };

        // Set user directly in the provider (we'll need to add this method)
        // For now, we'll trigger a re-authentication
        await connectWallet();
      }

      setStep('success');
      
      // Auto-close after success
      setTimeout(() => {
        onSuccess?.();
        onClose();
        setStep('select');
        setSelectedMethod(null);
      }, 2000);
    } catch (err) {
      console.error("Email registration failed:", err);
      setStep('select');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md bg-black dark:bg-[#0D0D0D] border border-zinc-100/10 dark:border-white/10">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-gray-100 dark:text-white">
            Connect to FlowPay
          </CardTitle>
          <CardDescription className="text-gray-100 dark:text-white/70">
            Choose how you'd like to connect your wallet
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {step === 'select' && (
            <>
              <Button
                onClick={handleConnectWallet}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                disabled={isLoading}
              >
                <Wallet className="w-4 h-4 mr-2" />
                Connect External Wallet
              </Button>
              
              <Button
                onClick={handleEmailRegistration}
                variant="outline"
                className="w-full border-zinc-100/10 dark:border-white/20 text-gray-100 dark:text-white hover:bg-black/[0.06] dark:hover:bg-white/10"
                disabled={isLoading}
              >
                <Mail className="w-4 h-4 mr-2" />
                Create Email Wallet
              </Button>
            </>
          )}

          {step === 'email-form' && (
            <div className="space-y-4">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-100 dark:text-white mb-2">
                  Create Email Wallet
                </h3>
                <p className="text-sm text-gray-100 dark:text-white/70">
                  We'll create a real Flow account for you
                </p>
              </div>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-100 dark:text-white mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 bg-black/[0.06] dark:bg-white/5 border border-zinc-100/10 dark:border-white/10 rounded-md text-gray-100 dark:text-white placeholder-gray-100/50 dark:placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-600"
                    placeholder="your@email.com"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-100 dark:text-white mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 bg-black/[0.06] dark:bg-white/5 border border-zinc-100/10 dark:border-white/10 rounded-md text-gray-100 dark:text-white placeholder-gray-100/50 dark:placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-600"
                    placeholder="Your Name"
                    required
                  />
                </div>
              </div>

              {registrationError && (
                <div className="flex items-center space-x-2 text-red-600">
                  <AlertCircle className="w-4 h-4" />
                  <span className="text-sm">{registrationError}</span>
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
                  onClick={() => handleEmailFormSubmit(email, name)}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                  disabled={!email || !name || isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    'Create Account'
                  )}
                </Button>
              </div>
            </div>
          )}

          {step === 'authenticating' && (
            <div className="text-center space-y-4">
              <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-600" />
              <p className="text-gray-100 dark:text-white">
                {selectedMethod === 'external' ? 'Connecting wallet...' : 'Creating Flow account...'}
              </p>
              {selectedMethod === 'email' && (
                <p className="text-sm text-gray-100 dark:text-white/70">
                  This may take a few moments
                </p>
              )}
            </div>
          )}

          {step === 'success' && (
            <div className="text-center space-y-4">
              <CheckCircle className="w-8 h-8 mx-auto text-green-600" />
              <p className="text-gray-100 dark:text-white">
                {selectedMethod === 'external' ? 'Wallet connected successfully!' : 'Wallet created successfully!'}
              </p>
              {user && user.address && (
                <p className="text-sm text-gray-100 dark:text-white/70">
                  Address: {user.address.slice(0, 6)}...{user.address.slice(-4)}
                </p>
              )}
            </div>
          )}

          {error && (
            <div className="flex items-center space-x-2 text-red-600">
              <AlertCircle className="w-4 h-4" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          <Button
            onClick={onClose}
            variant="ghost"
            className="w-full text-gray-100 dark:text-white/70 hover:bg-black/[0.06] dark:hover:bg-white/10"
          >
            Cancel
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
