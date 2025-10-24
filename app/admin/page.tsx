"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Wallet, DollarSign, Users, AlertTriangle, CheckCircle, Loader2 } from "lucide-react";

interface AdminStats {
  balance: string;
  sufficient: boolean;
  estimatedCost: number;
  accountCount: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadAdminStats = async () => {
    try {
      setLoading(true);
      setError(null);

      // Check admin balance
      const balanceResponse = await fetch('/api/admin/balance');
      const balanceData = await balanceResponse.json();

      if (!balanceResponse.ok) {
        throw new Error(balanceData.error || 'Failed to load admin stats');
      }

      setStats(balanceData);
    } catch (err) {
      console.error('Error loading admin stats:', err);
      setError(err instanceof Error ? err.message : 'Failed to load admin stats');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminStats();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-[#97F11D] mb-4" />
          <p className="text-white">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Card className="w-full max-w-md bg-black border-white/10">
          <CardContent className="p-6 text-center">
            <AlertTriangle className="w-12 h-12 mx-auto text-red-500 mb-4" />
            <h2 className="text-xl font-semibold text-white mb-2">Admin Dashboard Error</h2>
            <p className="text-gray-400 mb-4">{error}</p>
            <Button onClick={loadAdminStats} className="bg-[#97F11D] hover:bg-[#97F11D]/80 text-black">
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Admin Dashboard</h1>
          <p className="text-gray-400">Monitor admin wallet and account creation</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Admin Balance */}
          <Card className="bg-black border-white/10">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Admin Balance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <Wallet className="w-4 h-4 text-[#97F11D]" />
                <span className="text-2xl font-bold text-white">
                  {stats?.balance || '0'} FLOW
                </span>
              </div>
              <div className="mt-2">
                {stats?.sufficient ? (
                  <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Sufficient
                  </Badge>
                ) : (
                  <Badge className="bg-red-500/20 text-red-400 border-red-500/30">
                    <AlertTriangle className="w-3 h-3 mr-1" />
                    Insufficient
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Cost per Account */}
          <Card className="bg-black border-white/10">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Cost per Account</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <DollarSign className="w-4 h-4 text-[#97F11D]" />
                <span className="text-2xl font-bold text-white">
                  {stats?.estimatedCost || '0.002'} FLOW
                </span>
              </div>
              <p className="text-xs text-gray-400 mt-1">
                Storage + Transaction
              </p>
            </CardContent>
          </Card>

          {/* Accounts Created */}
          <Card className="bg-black border-white/10">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Accounts Created</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <Users className="w-4 h-4 text-[#97F11D]" />
                <span className="text-2xl font-bold text-white">
                  {stats?.accountCount || '0'}
                </span>
              </div>
              <p className="text-xs text-gray-400 mt-1">
                Total accounts
              </p>
            </CardContent>
          </Card>

          {/* Status */}
          <Card className="bg-black border-white/10">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">System Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                {stats?.sufficient ? (
                  <>
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <span className="text-lg font-semibold text-green-400">Ready</span>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-4 h-4 text-red-400" />
                    <span className="text-lg font-semibold text-red-400">Needs Funding</span>
                  </>
                )}
              </div>
              <p className="text-xs text-gray-400 mt-1">
                Account creation
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="bg-black border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Admin Wallet Info</CardTitle>
              <CardDescription className="text-gray-400">
                Current admin wallet status and configuration
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Balance:</span>
                <span className="text-white font-mono">{stats?.balance || '0'} FLOW</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Status:</span>
                {stats?.sufficient ? (
                  <Badge className="bg-green-500/20 text-green-400">Ready</Badge>
                ) : (
                  <Badge className="bg-red-500/20 text-red-400">Needs Funding</Badge>
                )}
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Cost per Account:</span>
                <span className="text-white font-mono">{stats?.estimatedCost || '0.002'} FLOW</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-black border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Quick Actions</CardTitle>
              <CardDescription className="text-gray-400">
                Manage admin wallet and system
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                onClick={loadAdminStats}
                className="w-full bg-[#97F11D] hover:bg-[#97F11D]/80 text-black"
              >
                Refresh Stats
              </Button>
              <Button 
                variant="outline"
                className="w-full border-white/20 text-white hover:bg-white/10"
                onClick={() => window.open('https://flowscan.io', '_blank')}
              >
                View on Flowscan
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Warning for insufficient balance */}
        {stats && !stats.sufficient && (
          <Card className="bg-red-500/10 border-red-500/30 mt-6">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <AlertTriangle className="w-6 h-6 text-red-400" />
                <div>
                  <h3 className="text-lg font-semibold text-red-400">Admin Wallet Needs Funding</h3>
                  <p className="text-red-300 mt-1">
                    Current balance: {stats.balance} FLOW. Minimum required: 0.1 FLOW.
                    Please fund the admin wallet to enable account creation.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}