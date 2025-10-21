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
  const { logIn, loading, error, loggedIn, address, setUserDirectly } = useFlowUser();
  const [selectedMethod, setSelectedMethod] = useState<'external' | 'flowport' | null>(null);
  const [step, setStep] = useState<'select' | 'email-form' | 'authenticating' | 'success'>('select');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [registrationError, setRegistrationError] = useState<string | null>(null);
  const [authMode, setAuthMode] = useState<'signup' | 'signin'>('signup');

  if (!isOpen) return null;

  const handleAuthentication = async (method: 'external' | 'flowport') => {
    setSelectedMethod(method);
    
    if (method === 'flowport') {
      // Show email registration form
      setStep('email-form');
    } else {
      // Direct wallet connection
      setStep('authenticating');
      
      try {
        await logIn(method);
        
        // Check if authentication was successful
        if (loggedIn && address) {
          setStep('success');
          
          // Auto-close after success
          setTimeout(() => {
            onSuccess?.();
            onClose();
            setStep('select');
            setSelectedMethod(null);
          }, 2000);
        } else {
          // Authentication didn't complete successfully
          setStep('select');
          setSelectedMethod(null);
        }
      } catch (err) {
        console.error("Authentication failed:", err);
        setStep('select');
        setSelectedMethod(null);
      }
    }
  };

  const handleEmailSignIn = async () => {
    if (!email || !password) {
      setRegistrationError('Please enter both email and password');
      return;
    }

    setRegistrationError(null);
    setStep('authenticating');
    
    try {
      // Simulate sign-in process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Authenticate user with email and password
      const { WalletService } = await import("@/lib/wallet-service");
      const dbUser = await WalletService.authenticateUser(email, password);

      console.log("Database user signed in:", dbUser);

      if (dbUser) {
        // Set the user directly in the Flow provider
        console.log("Setting user directly:", dbUser);
        setUserDirectly(dbUser);
        
        setStep('success');
        
        // Auto-close after success
        setTimeout(() => {
          onSuccess?.();
          onClose();
          setStep('select');
          setSelectedMethod(null);
          setEmail('');
          setName('');
          setPassword('');
        }, 2000);
      } else {
        throw new Error('Invalid email or password. Please check your credentials or sign up for a new account.');
      }
    } catch (err: any) {
      console.error("Email sign-in failed:", err);
      setRegistrationError(err.message || 'Sign-in failed. Please try again.');
      setStep('email-form');
    }
  };

  const handleEmailRegistration = async () => {
    if (!email || !name || !password) {
      setRegistrationError('Please fill in all fields');
      return;
    }

    setRegistrationError(null);
    setStep('authenticating');
    
    try {
      // Generate a more realistic Flow address format
      const generateFlowAddress = () => {
        const chars = '0123456789abcdef';
        let address = '0x';
        for (let i = 0; i < 16; i++) {
          address += chars[Math.floor(Math.random() * chars.length)];
        }
        return address;
      };

      const mockUser = {
        address: generateFlowAddress(),
        email: email,
        name: name,
        wallet_type: 'managed' as const,
        verified: false
      };

      console.log("Creating mock user:", mockUser);

      // Simulate registration process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Create user in database
      const { WalletService } = await import("@/lib/wallet-service");
      const dbUser = await WalletService.getOrCreateUser(mockUser.address, {
        email: mockUser.email,
        wallet_type: mockUser.wallet_type,
        display_name: mockUser.name,
        is_verified: mockUser.verified,
        password: password
      });

      console.log("Database user created:", dbUser);

      if (dbUser) {
        // Set the user directly in the Flow provider
        console.log("Setting user directly:", dbUser);
        setUserDirectly(dbUser);
        
        setStep('success');
        
        // Auto-close after success
        setTimeout(() => {
          onSuccess?.();
          onClose();
          setStep('select');
          setSelectedMethod(null);
          setEmail('');
          setName('');
        }, 2000);
      } else {
        throw new Error('Failed to create user account in database');
      }
    } catch (err: any) {
      console.error("Email registration failed:", err);
      setRegistrationError(err.message || 'Registration failed. Please try again.');
      setStep('email-form');
    }
  };

  const handleClose = () => {
    if (step !== 'authenticating') {
      onClose();
      setStep('select');
      setSelectedMethod(null);
      setEmail('');
      setName('');
      setPassword('');
      setRegistrationError(null);
      setAuthMode('signup');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-black dark:bg-[#0D0D0D] w-full max-w-lg rounded-2xl border border-zinc-100/10 dark:border-white/10">
        <div className="relative p-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-100 dark:text-gray-100 dark:text-white mb-2">
                {step === 'select' && 'Connect to FlowPay'}
                {step === 'email-form' && (authMode === 'signup' ? 'Create Your Account' : 'Sign In to Your Account')}
                {step === 'authenticating' && 'Connecting...'}
                {step === 'success' && 'Welcome to FlowPay!'}
              </h2>
              <p className="text-gray-100 dark:text-white/70 text-sm">
                {step === 'select' && 'Choose how you want to connect your wallet'}
                {step === 'email-form' && (authMode === 'signup' ? 'Enter your details to create a managed wallet' : 'Enter your email to sign in to your account')}
                {step === 'authenticating' && 'Please complete the authentication process'}
                {step === 'success' && 'You are now connected and ready to use FlowPay'}
              </p>
            </div>
            {step !== 'authenticating' && (
              <button 
                onClick={handleClose}
                className="p-2 hover:bg-white/10 rounded-xl transition-all duration-200 backdrop-blur-sm border border-white/10"
              >
                <svg className="w-5 h-5 text-gray-100 dark:text-white/80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
          
          {/* Error Display */}
          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-red-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <AlertCircle className="w-4 h-4 text-red-400" />
                </div>
                <div>
                  <p className="text-red-300 font-medium text-sm">Connection Error</p>
                  <p className="text-red-200 text-sm mt-1">{error}</p>
                </div>
              </div>
            </div>
          )}
          
          {step === 'select' && (
            <div className="space-y-6">
              {/* Flow Port Option */}
              <div className="bg-black/[0.03] dark:bg-white/5 border border-zinc-100/10 dark:border-white/10 rounded-2xl p-6 hover:border-zinc-100/20 dark:hover:border-white/20 transition-all duration-200 group">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-blue-500/20 rounded-2xl flex items-center justify-center group-hover:bg-blue-500/30 transition-all duration-200">
                    <Mail className="w-6 h-6 text-blue-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-100 dark:text-white mb-2">Email Registration</h3>
                    <p className="text-gray-100 dark:text-white/70 text-sm leading-relaxed mb-4">
                      Create a managed wallet with your email address. Perfect for beginners.
                    </p>
                    <Button
                      onClick={() => handleAuthentication('flowport')}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-gray-100 dark:text-white py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 font-medium"
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

              {/* External Wallet Option */}
              <div className="bg-black/[0.03] dark:bg-white/5 border border-zinc-100/10 dark:border-white/10 rounded-2xl p-6 hover:border-zinc-100/20 dark:hover:border-white/20 transition-all duration-200 group">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-[#97F11D]/20 rounded-2xl flex items-center justify-center group-hover:bg-[#97F11D]/30 transition-all duration-200">
                    <Wallet className="w-6 h-6 text-[#97F11D]" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-100 dark:text-white mb-2">External Wallet</h3>
                    <p className="text-gray-100 dark:text-white/70 text-sm leading-relaxed mb-4">
                      Connect your existing Flow wallet (Blocto, Ledger, etc.)
                    </p>
                    <Button
                      onClick={() => handleAuthentication('external')}
                      className="w-full bg-[#97F11D] hover:bg-[#97F11D]/90 text-black py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 font-medium"
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

              {/* Error Display */}
              {error && (
                <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 flex-shrink-0" />
                  <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
                </div>
              )}
            </div>
          )}

          {step === 'email-form' && (
            <div className="space-y-6">
              {/* Auth Mode Toggle */}
              <div className="flex bg-black/[0.03] dark:bg-white/5 border border-zinc-100/10 dark:border-white/10 rounded-xl p-1">
                <button
                  onClick={() => setAuthMode('signup')}
                  className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all duration-200 ${
                    authMode === 'signup'
                      ? 'bg-[#97F11D] text-black'
                      : 'text-gray-100 dark:text-white/70 hover:text-gray-100 dark:hover:text-white'
                  }`}
                >
                  Sign Up
                </button>
                <button
                  onClick={() => setAuthMode('signin')}
                  className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all duration-200 ${
                    authMode === 'signin'
                      ? 'bg-[#97F11D] text-black'
                      : 'text-gray-100 dark:text-white/70 hover:text-gray-100 dark:hover:text-white'
                  }`}
                >
                  Sign In
                </button>
              </div>

              {/* Registration Error Display */}
              {registrationError && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-red-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                      <AlertCircle className="w-4 h-4 text-red-400" />
                    </div>
                    <div>
                      <p className="text-red-300 font-medium text-sm">{authMode === 'signup' ? 'Registration Error' : 'Sign-in Error'}</p>
                      <p className="text-red-200 text-sm mt-1">{registrationError}</p>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="bg-black/[0.03] dark:bg-white/5 border border-zinc-100/10 dark:border-white/10 rounded-2xl p-6">
                <div className="space-y-4">
                  {authMode === 'signup' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-100 dark:text-white mb-2">
                        Full Name
                      </label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Enter your full name"
                        className="w-full px-4 py-3 bg-black/[0.03] dark:bg-white/10 border border-zinc-100/10 dark:border-white/20 rounded-xl text-gray-100 dark:text-white placeholder-gray-400 dark:placeholder-white/50 focus:outline-none focus:border-[#97F11D] focus:bg-black/[0.06] dark:focus:bg-white/15 transition-all duration-200"
                      />
                    </div>
                  )}
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-100 dark:text-white mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email address"
                      className="w-full px-4 py-3 bg-black/[0.03] dark:bg-white/10 border border-zinc-100/10 dark:border-white/20 rounded-xl text-gray-100 dark:text-white placeholder-gray-400 dark:placeholder-white/50 focus:outline-none focus:border-[#97F11D] focus:bg-black/[0.06] dark:focus:bg-white/15 transition-all duration-200"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-100 dark:text-white mb-2">
                      Password
                    </label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder={authMode === 'signup' ? "Create a secure password" : "Enter your password"}
                      className="w-full px-4 py-3 bg-black/[0.03] dark:bg-white/10 border border-zinc-100/10 dark:border-white/20 rounded-xl text-gray-100 dark:text-white placeholder-gray-400 dark:placeholder-white/50 focus:outline-none focus:border-[#97F11D] focus:bg-black/[0.06] dark:focus:bg-white/15 transition-all duration-200"
                    />
                  </div>
                  
                  <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-blue-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <svg className="w-3 h-3 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-blue-300 font-medium text-sm">Managed Wallet</p>
                        <p className="text-blue-200 text-sm mt-1">
                          {authMode === 'signup' 
                            ? "We'll create a secure managed wallet for you. You can always connect an external wallet later."
                            : "Sign in to access your existing managed wallet and dashboard."
                          }
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-3">
                    <Button
                      onClick={() => {
                        setStep('select');
                        setRegistrationError(null);
                      }}
                      variant="outline"
                      className="flex-1 bg-white/10 border-white/20 text-gray-100 dark:text-white hover:bg-white/20"
                    >
                      Back
                    </Button>
                    <Button
                      onClick={authMode === 'signup' ? handleEmailRegistration : handleEmailSignIn}
                      disabled={!email || !password || (authMode === 'signup' && !name) || loading}
                      className="flex-1 bg-[#97F11D] hover:bg-[#97F11D]/90 text-black font-medium"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          {authMode === 'signup' ? 'Creating Account...' : 'Signing In...'}
                        </>
                      ) : (
                        authMode === 'signup' ? 'Create Account' : 'Sign In'
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 'authenticating' && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-[#97F11D]/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Loader2 className="w-8 h-8 text-[#97F11D] animate-spin" />
              </div>
              <h3 className="font-semibold text-gray-100 dark:text-white mb-3 text-lg">
                {selectedMethod === 'flowport' ? 'Creating your account...' : 'Connecting to your wallet...'}
              </h3>
              <p className="text-gray-100 dark:text-white/70 text-sm leading-relaxed">
                {selectedMethod === 'flowport' 
                  ? 'Setting up your managed wallet and account'
                  : 'Please approve the connection in your wallet'
                }
              </p>
            </div>
          )}

          {step === 'success' && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-green-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-8 h-8 text-green-400" />
              </div>
              <h3 className="font-semibold text-gray-100 dark:text-white mb-3 text-lg">
                Successfully Connected!
              </h3>
              <p className="text-gray-100 dark:text-white/70 text-sm leading-relaxed">
                You can now access your FlowPay dashboard
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
