"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  Settings, 
  Users, 
  DollarSign, 
  Activity,
  AlertCircle,
  CheckCircle,
  Loader2
} from 'lucide-react';

interface AdminStats {
  totalUsers: number;
  totalTransactions: number;
  platformFeesCollected: number;
  accountsCreated: number;
}

interface AdminConfig {
  adminPayerAddress: string;
  platformFeeRecipient: string;
  platformFeeRate: number;
  accountCreationCost: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [config, setConfig] = useState<AdminConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      
      // Fetch admin statistics
      const statsResponse = await fetch('/api/admin/stats');
      const statsData = await statsResponse.json();
      
      // Fetch admin configuration
      const configResponse = await fetch('/api/admin/config');
      const configData = await configResponse.json();
      
      setStats(statsData);
      setConfig(configData);
    } catch (err) {
      setError('Failed to load admin data');
      console.error('Admin data fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateConfig = async (newConfig: Partial<AdminConfig>) => {
    try {
      const response = await fetch('/api/admin/config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newConfig)
      });
      
      if (response.ok) {
        setConfig(prev => prev ? { ...prev, ...newConfig } : null);
      }
    } catch (err) {
      setError('Failed to update configuration');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black dark:bg-[#0D0D0D] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black dark:bg-[#0D0D0D] p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-100 dark:text-white mb-2">
            Admin Dashboard
          </h1>
          <p className="text-gray-100 dark:text-white/70">
            Manage platform settings, monitor transactions, and configure admin accounts
          </p>
        </div>

        {/* Error State */}
        {error && (
          <div className="mb-6 p-4 bg-red-900/20 border border-red-500/20 rounded-lg flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 text-red-500" />
            <span className="text-red-500">{error}</span>
          </div>
        )}

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="bg-black/[0.06] dark:bg-white/5 border-zinc-100/10 dark:border-white/10">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-100 dark:text-white">
                  Total Users
                </CardTitle>
                <Users className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-100 dark:text-white">
                  {stats.totalUsers}
                </div>
                <p className="text-xs text-gray-100 dark:text-white/70">
                  Email + Wallet users
                </p>
              </CardContent>
            </Card>

            <Card className="bg-black/[0.06] dark:bg-white/5 border-zinc-100/10 dark:border-white/10">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-100 dark:text-white">
                  Total Transactions
                </CardTitle>
                <Activity className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-100 dark:text-white">
                  {stats.totalTransactions}
                </div>
                <p className="text-xs text-gray-100 dark:text-white/70">
                  All time payments
                </p>
              </CardContent>
            </Card>

            <Card className="bg-black/[0.06] dark:bg-white/5 border-zinc-100/10 dark:border-white/10">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-100 dark:text-white">
                  Platform Fees
                </CardTitle>
                <DollarSign className="h-4 w-4 text-yellow-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-100 dark:text-white">
                  {stats.platformFeesCollected.toFixed(4)} FLOW
                </div>
                <p className="text-xs text-gray-100 dark:text-white/70">
                  0.5% of all transactions
                </p>
              </CardContent>
            </Card>

            <Card className="bg-black/[0.06] dark:bg-white/5 border-zinc-100/10 dark:border-white/10">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-100 dark:text-white">
                  Accounts Created
                </CardTitle>
                <CheckCircle className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-100 dark:text-white">
                  {stats.accountsCreated}
                </div>
                <p className="text-xs text-gray-100 dark:text-white/70">
                  Email-based accounts
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Admin Configuration */}
        <div className="space-y-6">
          <Card className="bg-black/[0.06] dark:bg-white/5 border-zinc-100/10 dark:border-white/10">
            <CardHeader>
              <CardTitle className="text-gray-100 dark:text-white">Admin Configuration</CardTitle>
              <CardDescription className="text-gray-100 dark:text-white/70">
                Configure admin payer account and platform settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {config && (
                <>
                  <div className="space-y-2">
                    <Label className="text-gray-100 dark:text-white">Admin Payer Address</Label>
                    <Input
                      value={config.adminPayerAddress}
                      onChange={(e) => updateConfig({ adminPayerAddress: e.target.value })}
                      className="bg-black/[0.06] dark:bg-white/5 border-zinc-100/10 dark:border-white/10 text-gray-100 dark:text-white"
                      placeholder="0x..."
                    />
                    <p className="text-xs text-gray-100 dark:text-white/70">
                      Flow address that funds new email accounts
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-gray-100 dark:text-white">Platform Fee Recipient</Label>
                    <Input
                      value={config.platformFeeRecipient}
                      onChange={(e) => updateConfig({ platformFeeRecipient: e.target.value })}
                      className="bg-black/[0.06] dark:bg-white/5 border-zinc-100/10 dark:border-white/10 text-gray-100 dark:text-white"
                      placeholder="0x..."
                    />
                    <p className="text-xs text-gray-100 dark:text-white/70">
                      Address where 0.5% platform fees are sent
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-gray-100 dark:text-white">Platform Fee Rate</Label>
                    <Input
                      value={config.platformFeeRate}
                      onChange={(e) => updateConfig({ platformFeeRate: parseFloat(e.target.value) })}
                      className="bg-black/[0.06] dark:bg-white/5 border-zinc-100/10 dark:border-white/10 text-gray-100 dark:text-white"
                      type="number"
                      step="0.001"
                      min="0"
                      max="1"
                    />
                    <p className="text-xs text-gray-100 dark:text-white/70">
                      Current: {config.platformFeeRate * 100}% of all transactions
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-gray-100 dark:text-white">Account Creation Cost</Label>
                    <Input
                      value={config.accountCreationCost}
                      onChange={(e) => updateConfig({ accountCreationCost: parseFloat(e.target.value) })}
                      className="bg-black/[0.06] dark:bg-white/5 border-zinc-100/10 dark:border-white/10 text-gray-100 dark:text-white"
                      type="number"
                      step="0.001"
                      min="0"
                    />
                    <p className="text-xs text-gray-100 dark:text-white/70">
                      FLOW cost per new email account (0.011 FLOW recommended)
                    </p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Account Management */}
          <Card className="bg-black/[0.06] dark:bg-white/5 border-zinc-100/10 dark:border-white/10">
            <CardHeader>
              <CardTitle className="text-gray-100 dark:text-white">Account Management</CardTitle>
              <CardDescription className="text-gray-100 dark:text-white/70">
                Monitor and manage user accounts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Users className="w-12 h-12 mx-auto text-gray-100 dark:text-white/50 mb-4" />
                <p className="text-gray-100 dark:text-white/70">
                  Account management features coming soon
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Fee Management */}
          <Card className="bg-black/[0.06] dark:bg-white/5 border-zinc-100/10 dark:border-white/10">
            <CardHeader>
              <CardTitle className="text-gray-100 dark:text-white">Fee Management</CardTitle>
              <CardDescription className="text-gray-100 dark:text-white/70">
                Monitor platform fee collection and distribution
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <DollarSign className="w-12 h-12 mx-auto text-gray-100 dark:text-white/50 mb-4" />
                <p className="text-gray-100 dark:text-white/70">
                  Fee management features coming soon
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
