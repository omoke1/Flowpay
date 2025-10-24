"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Mail, Key, AlertCircle, CheckCircle } from 'lucide-react';

interface EmailLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: any) => void;
}

export function EmailLoginModal({ isOpen, onClose, onSuccess }: EmailLoginModalProps) {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Please enter your email address');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/email-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSuccess(true);
        // Call onSuccess with user data
        onSuccess(data.user);
        // Close modal after a short delay
        setTimeout(() => {
          onClose();
          setSuccess(false);
          setEmail('');
        }, 2000);
      } else {
        setError(data.error || 'Login failed. Please try again.');
      }
    } catch (error) {
      console.error('Email login error:', error);
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setEmail('');
    setError('');
    setSuccess(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md bg-black dark:bg-[#0D0D0D] border border-zinc-100/10 dark:border-white/10">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-gray-100 dark:text-white flex items-center justify-center gap-2">
            <Mail className="h-5 w-5" />
            Login with Email
          </CardTitle>
          <CardDescription className="text-gray-100 dark:text-white/70">
            Enter your email address to access your FlowPay account
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          {success ? (
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <CheckCircle className="h-12 w-12 text-[#97F11D]" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-100 dark:text-white">Login Successful!</h3>
                <p className="text-sm text-gray-100 dark:text-white/70">
                  Welcome back! Redirecting to your dashboard...
                </p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleLogin} className="space-y-4">
              {error && (
                <Alert variant="destructive" className="bg-red-900/20 border-red-500/50 text-red-400">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="text-red-400">{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-100 dark:text-white mb-1">
                    Email Address
                  </label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading}
                    required
                    className="bg-black/50 border-zinc-100/10 dark:border-white/20 text-gray-100 dark:text-white placeholder-gray-400 focus:border-[#97F11D] focus:ring-[#97F11D]"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <Button 
                  type="submit" 
                  className="w-full bg-[#97F11D] hover:bg-[#97F11D]/90 text-black font-semibold" 
                  disabled={isLoading || !email.trim()}
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black mr-2" />
                      Logging in...
                    </>
                  ) : (
                    <>
                      <Key className="h-4 w-4 mr-2" />
                      Login
                    </>
                  )}
                </Button>
                
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={handleClose}
                  disabled={isLoading}
                  className="w-full border-zinc-100/10 dark:border-white/20 text-gray-100 dark:text-white hover:bg-black/[0.06] dark:hover:bg-white/10"
                >
                  Cancel
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
