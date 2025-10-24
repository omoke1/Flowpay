"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useFlowMainnet } from "@/components/providers/flow-provider-mainnet";
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Copy, Download, Eye, EyeOff, AlertTriangle, CheckCircle, Key, Shield, Download as DownloadIcon } from "lucide-react";
import { WalletRecoveryModal } from "@/components/auth/wallet-recovery-modal";
import { getUserAddress } from "@/lib/utils";

export default function WalletSettingsPage() {
  const router = useRouter();
  const { user, isConnected, disconnectWallet } = useFlowMainnet();
  const [recoveryInfo, setRecoveryInfo] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [showRecoveryModal, setShowRecoveryModal] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  // Get user address using utility function
  const userAddress = getUserAddress(user);

  // Load recovery information
  useEffect(() => {
    if (isConnected && user?.addr) {
      loadRecoveryInfo();
    }
  }, [isConnected, user]);

  const loadRecoveryInfo = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/user/recovery-info?address=${user.addr}`);
      const data = await response.json();
      
      if (response.ok && data.success) {
        setRecoveryInfo(data.recoveryInfo);
      } else {
        // Handle the case where recovery info is not stored
        console.log("Recovery info response:", data.message);
        setRecoveryInfo(null);
      }
    } catch (error) {
      console.error("Failed to load recovery info:", error);
      setRecoveryInfo(null);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(type);
      setTimeout(() => setCopied(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const downloadRecoveryInfo = () => {
    if (!recoveryInfo) return;
    
    const data = {
      ...recoveryInfo,
      exportedAt: new Date().toISOString(),
      warning: "⚠️ IMPORTANT: Save this information securely! You cannot recover your wallet without it."
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `flowpay-recovery-${recoveryInfo.address?.slice(0, 8) || 'wallet'}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-black dark:bg-[#0A0A0A] text-gray-900 dark:text-gray-200 font-sans antialiased">
        {/* Mobile Sidebar Backdrop */}
        <div id="mobile-backdrop" className="fixed inset-0 z-30 hidden bg-black/60 backdrop-blur-sm lg:hidden"></div>

        {/* Sidebar */}
        <DashboardSidebar activeItem="settings" onLogout={disconnectWallet} />

        {/* Main */}
        <div className="lg:pl-60">
          {/* Top Bar */}
          <DashboardHeader 
            title="Wallet Settings" 
            onSearch={() => {}} 
            onCreatePaymentLink={() => router.push("/dashboard/create")}
            address={userAddress}
            onLogout={disconnectWallet}
          />

          {/* Content Wrapper */}
          <main className="px-4 sm:px-6 lg:px-8 py-6">
            <Card className="bg-black border-white/10">
              <CardContent className="p-8 text-center">
                <AlertTriangle className="w-12 h-12 mx-auto text-yellow-500 mb-4" />
                <h2 className="text-xl font-semibold mb-2">Wallet Not Connected</h2>
                <p className="text-gray-400">Please connect your wallet to access wallet settings.</p>
              </CardContent>
            </Card>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black dark:bg-[#0A0A0A] text-gray-900 dark:text-gray-200 font-sans antialiased">
      {/* Mobile Sidebar Backdrop */}
      <div id="mobile-backdrop" className="fixed inset-0 z-30 hidden bg-black/60 backdrop-blur-sm lg:hidden"></div>

      {/* Sidebar */}
      <DashboardSidebar activeItem="settings" onLogout={disconnectWallet} />

      {/* Main */}
      <div className="lg:pl-60">
        {/* Top Bar */}
        <DashboardHeader 
          title="Wallet Settings" 
          onSearch={() => {}} 
          onCreatePaymentLink={() => router.push("/dashboard/create")}
          address={userAddress}
          onLogout={disconnectWallet}
        />

        {/* Content Wrapper */}
        <main className="px-4 sm:px-6 lg:px-8 py-6 space-y-6">
          <div>
            <h2 className="text-xl tracking-tight font-semibold text-gray-900 dark:text-white">Wallet Settings</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">Manage your Flow wallet and recovery information</p>
          </div>

          {/* Wallet Overview */}
          <Card className="bg-black dark:bg-[#111111] border border-zinc-100/10 dark:border-white/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                <Key className="w-5 h-5 text-[#97F11D]" />
                Wallet Overview
              </CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-400">
                Your Flow wallet information and security settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Wallet Address</label>
                  <div className="flex items-center space-x-2 mt-1">
                    <code className="flex-1 bg-black/[0.03] dark:bg-white/5 text-green-400 p-2 rounded border border-zinc-100/10 dark:border-white/10 text-sm font-mono break-all">
                      {user?.addr || 'Not available'}
                    </code>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyToClipboard(user?.addr || '', 'address')}
                      className="border-zinc-100/10 dark:border-white/10"
                    >
                      {copied === 'address' ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Account Type</label>
                  <div className="mt-1">
                    <Badge className="bg-[#97F11D]/20 text-[#97F11D] border-[#97F11D]/30">
                      Flow Account
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
        </Card>

          {/* Recovery Information */}
          <Card className="bg-black dark:bg-[#111111] border border-zinc-100/10 dark:border-white/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                <Shield className="w-5 h-5 text-blue-500" />
                Recovery Information
              </CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-400">
                Access your wallet recovery information securely
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin w-8 h-8 border-2 border-[#97F11D] border-t-transparent rounded-full mx-auto mb-4"></div>
                  <p className="text-gray-600 dark:text-gray-400">Loading recovery information...</p>
                </div>
              ) : recoveryInfo ? (
                <div className="space-y-4">
                  <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                      <AlertTriangle className="w-5 h-5 text-blue-400 mt-0.5" />
                      <div>
                        <h3 className="font-semibold text-blue-400 mb-2">Recovery Information Available</h3>
                        <p className="text-blue-300 text-sm">
                          Your wallet recovery information is securely stored. You can view and download it when needed.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button
                      onClick={() => setShowRecoveryModal(true)}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      View Recovery Information
                    </Button>
                    
                    <Button
                      onClick={downloadRecoveryInfo}
                      className="flex-1 bg-[#97F11D] hover:bg-[#97F11D]/80 text-black"
                    >
                      <DownloadIcon className="w-4 h-4 mr-2" />
                      Download Backup
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <AlertTriangle className="w-12 h-12 mx-auto text-yellow-500 mb-4" />
                  <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">Recovery Information Not Stored</h3>
                  <div className="space-y-3 text-left max-w-md mx-auto">
                    <p className="text-gray-600 dark:text-gray-400">
                      For security reasons, recovery information is not stored in the database for email-registered accounts.
                    </p>
                    <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
                      <p className="text-blue-300 text-sm">
                        <strong>Security Note:</strong> Recovery information was generated during account creation but is not stored to protect your data.
                      </p>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      If you need to recover your wallet, please contact support or use the account recovery process.
                    </p>
                  </div>
                  <Button
                    onClick={loadRecoveryInfo}
                    variant="outline"
                    className="border-zinc-100/10 dark:border-white/10 mt-4"
                  >
                    Check Again
                  </Button>
                </div>
              )}
            </CardContent>
        </Card>

          {/* Security Tips */}
          <Card className="bg-black dark:bg-[#111111] border border-zinc-100/10 dark:border-white/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                <Shield className="w-5 h-5 text-green-500" />
                Security Best Practices
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">Save Recovery Information Securely</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Store your seed phrase and private key in a secure location.</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">Never Share Private Information</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Never share your seed phrase or private key with anyone.</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">Use Hardware Wallets</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Consider using hardware wallets for enhanced security.</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>

      {/* Recovery Modal */}
      {showRecoveryModal && recoveryInfo && (
        <WalletRecoveryModal
          recoveryInfo={recoveryInfo}
          onClose={() => setShowRecoveryModal(false)}
          onConfirm={() => setShowRecoveryModal(false)}
        />
      )}
    </div>
  );
}
