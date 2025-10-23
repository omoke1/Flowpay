"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useFlowMinimal } from '@/components/providers/flow-provider-minimal';
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

export default function CreateUserPage() {
  const { user, isConnected } = useFlowMinimal();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const createUser = async () => {
    if (!user?.addr) {
      setError('No wallet connected');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/auth/create-user-manual', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          address: user.addr,
          name: `User ${user.addr.slice(0, 6)}...${user.addr.slice(-4)}`,
          email: null
        })
      });

      const data = await response.json();

      if (response.ok) {
        setResult(data);
      } else {
        setError(data.error || 'Failed to create user');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black dark:bg-[#0D0D0D] p-6">
      <div className="max-w-2xl mx-auto">
        <Card className="bg-black dark:bg-[#0D0D0D] border border-zinc-100/10 dark:border-white/10">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-gray-100 dark:text-white">
              Create User Record
            </CardTitle>
            <CardDescription className="text-gray-100 dark:text-white/70">
              Manually create a user record for the connected wallet
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!isConnected ? (
              <div className="flex items-center space-x-2 text-yellow-500">
                <AlertCircle className="w-4 h-4" />
                <span>Please connect your wallet first</span>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <Label className="text-gray-100 dark:text-white">Wallet Address</Label>
                  <Input
                    value={user.addr}
                    readOnly
                    className="bg-black/[0.06] dark:bg-white/5 border-zinc-100/10 dark:border-white/10 text-gray-100 dark:text-white"
                  />
                </div>

                <Button
                  onClick={createUser}
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    'Create User Record'
                  )}
                </Button>

                {result && (
                  <div className="flex items-center space-x-2 text-green-500">
                    <CheckCircle className="w-4 h-4" />
                    <span>User created successfully!</span>
                  </div>
                )}

                {error && (
                  <div className="flex items-center space-x-2 text-red-500">
                    <AlertCircle className="w-4 h-4" />
                    <span>{error}</span>
                  </div>
                )}

                {result && (
                  <div className="bg-black/[0.06] dark:bg-white/5 p-4 rounded-lg">
                    <h4 className="text-sm font-medium text-gray-100 dark:text-white mb-2">
                      User Details:
                    </h4>
                    <pre className="text-xs text-gray-100 dark:text-white/70 overflow-auto">
                      {JSON.stringify(result.user, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
