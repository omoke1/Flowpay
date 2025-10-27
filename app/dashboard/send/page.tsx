"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useFlowMainnet } from "@/components/providers/flow-provider-mainnet";
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { getUserAddress } from "@/lib/utils";
import { 
  Send, 
  Link, 
  Mail, 
  Clock, 
  Info,
  Wallet,
  CreditCard,
  Loader2,
  RefreshCw
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNotification } from "@/components/providers/notification-provider";

export default function SendMoneyPage() {
  const router = useRouter();
  const { isConnected, user, disconnectWallet } = useFlowMainnet();
  const { success, error: showError } = useNotification();
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [activeTab, setActiveTab] = useState("link");
  
  // Form state
  const [amount, setAmount] = useState("");
  const [token, setToken] = useState("FLOW");
  const [recipientEmail, setRecipientEmail] = useState("");
  const [note, setNote] = useState("");
  
  // Balance state
  const [flowBalance, setFlowBalance] = useState(0);
  const [usdcBalance, setUsdcBalance] = useState(0);
  const [balanceError, setBalanceError] = useState<string | null>(null);

  const userAddress = getUserAddress(user);

  useEffect(() => {
    if (!isConnected) {
      router.push("/");
      return;
    }

    // Fetch actual balances from Flow blockchain
    const fetchBalances = async () => {
      try {
        if (!userAddress) {
          console.error("No user address found");
          setLoading(false);
          return;
        }

        // Import balance fetching functions
        const { getFlowBalance, getUSDCBalance } = await import('@/lib/flow-transactions');
        
        // FCL accounts have vaults pre-configured, so we can directly fetch balances
        // Fetch both balances in parallel
        const [flowBalance, usdcBalance] = await Promise.all([
          getFlowBalance(userAddress),
          getUSDCBalance(userAddress)
        ]);

        setFlowBalance(parseFloat(flowBalance) || 0);
        setUsdcBalance(parseFloat(usdcBalance) || 0);
        setBalanceError(null);
        
        console.log(`Balances fetched - FLOW: ${flowBalance}, USDC: ${usdcBalance}`);
      } catch (error) {
        console.error("Error fetching balances:", error);
        // Set to 0 on error to prevent UI issues
        setFlowBalance(0);
        setUsdcBalance(0);
        setBalanceError("Failed to fetch balances. Please try refreshing.");
      } finally {
        setLoading(false);
      }
    };

    fetchBalances();
  }, [isConnected, userAddress, router]);

  const refreshBalances = async () => {
    if (!userAddress) return;
    
    try {
      const { getFlowBalance, getUSDCBalance } = await import('@/lib/flow-transactions');
      
      // FCL accounts have vaults pre-configured, so we can directly fetch balances
      const [flowBalance, usdcBalance] = await Promise.all([
        getFlowBalance(userAddress),
        getUSDCBalance(userAddress)
      ]);

      setFlowBalance(parseFloat(flowBalance) || 0);
      setUsdcBalance(parseFloat(usdcBalance) || 0);
      setBalanceError(null);
    } catch (error) {
      console.error("Error refreshing balances:", error);
      setBalanceError("Failed to refresh balances. Please try again.");
    }
  };

  const handleSendTransfer = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      showError("Please enter a valid amount");
      return;
    }

    if (activeTab === "email" && !recipientEmail) {
      showError("Please enter recipient email");
      return;
    }

    // Check if user has sufficient balance
    const transferAmount = parseFloat(amount);
    const availableBalance = token === "FLOW" ? flowBalance : usdcBalance;
    
    if (transferAmount > availableBalance) {
      showError(`Insufficient ${token} balance. Available: ${availableBalance.toFixed(6)} ${token}`);
      return;
    }

    setSending(true);
    try {
      const response = await fetch('/api/transfers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: transferAmount,
          token,
          recipientEmail: activeTab === "email" ? recipientEmail : null,
          note: note || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create transfer');
      }

      success(`Transfer created successfully! ${activeTab === "email" ? "Email sent to recipient." : "Share the claim link with the recipient."}`);
      
      // Reset form
      setAmount("");
      setRecipientEmail("");
      setNote("");
      
      // Refresh balances after successful transfer
      await refreshBalances();
      
    } catch (err: any) {
      console.error('Transfer creation error:', err);
      showError(err.message || 'Failed to create transfer');
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-950 text-white">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black dark:bg-[#0A0A0A] text-gray-900 dark:text-gray-200 font-sans antialiased">
      {/* Mobile Sidebar Backdrop */}
      <div id="mobile-backdrop" className="fixed inset-0 z-30 hidden bg-black/60 backdrop-blur-sm lg:hidden"></div>

      {/* Sidebar */}
      <DashboardSidebar activeItem="send" onLogout={disconnectWallet} />

      {/* Main */}
      <div className="lg:pl-60">
        {/* Top Bar */}
        <DashboardHeader 
          title="Send Money" 
          onSearch={() => {}} 
          onCreatePaymentLink={() => router.push("/dashboard/create")}
          address={userAddress}
        />

        {/* Content Wrapper */}
        <main className="px-4 sm:px-6 lg:px-8 py-6 space-y-8">
          {/* Summary Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* FLOW Balance */}
            <div className="rounded-2xl bg-black dark:bg-[#111111] border border-zinc-100/10 dark:border-white/10 p-4 sm:p-5">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-500 dark:text-gray-400">FLOW Balance</div>
                <button
                  onClick={refreshBalances}
                  className="text-gray-400 hover:text-gray-300 transition-colors"
                  title="Refresh balance"
                >
                  <RefreshCw className="h-4 w-4" />
                </button>
              </div>
              <div className="mt-3 text-2xl tracking-tight font-semibold text-gray-100 dark:text-white">
                {flowBalance === 0 ? '$0' : flowBalance.toFixed(6)}
              </div>
              <div className="mt-2 text-[#97F11D] text-sm">available</div>
            </div>

            {/* USDC Balance */}
            <div className="rounded-2xl bg-black dark:bg-[#111111] border border-zinc-100/10 dark:border-white/10 p-4 sm:p-5">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-500 dark:text-gray-400">USDC Balance</div>
                <button
                  onClick={refreshBalances}
                  className="text-gray-400 hover:text-gray-300 transition-colors"
                  title="Refresh balance"
                >
                  <RefreshCw className="h-4 w-4" />
                </button>
              </div>
              <div className="mt-3 text-2xl tracking-tight font-semibold text-gray-100 dark:text-white">
                {usdcBalance === 0 ? '$0' : usdcBalance.toFixed(6)}
              </div>
              <div className="mt-2 text-[#97F11D] text-sm">available</div>
            </div>

            {/* Total Sent */}
            <div className="rounded-2xl bg-black dark:bg-[#111111] border border-zinc-100/10 dark:border-white/10 p-4 sm:p-5">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-500 dark:text-gray-400">Total Sent</div>
                <Send className="h-4 w-4 text-gray-600" />
              </div>
              <div className="mt-3 text-2xl tracking-tight font-semibold text-gray-100 dark:text-white">
                $0.00
              </div>
              <div className="mt-2 text-[#97F11D] text-sm">this month</div>
            </div>

            {/* Active Transfers */}
            <div className="rounded-2xl bg-black dark:bg-[#111111] border border-zinc-100/10 dark:border-white/10 p-4 sm:p-5">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-500 dark:text-gray-400">Active Transfers</div>
                <Clock className="h-4 w-4 text-gray-600" />
              </div>
              <div className="mt-3 text-2xl tracking-tight font-semibold text-gray-100 dark:text-white">
                0
              </div>
              <div className="mt-2 text-[#97F11D] text-sm">pending claims</div>
            </div>
          </div>

              {/* Note: FCL-created accounts have vaults pre-configured */}

          {/* Send Transfer Card */}
          <div className="rounded-2xl border border-zinc-100/10 dark:border-white/10 bg-black dark:bg-[#0D0D0D] overflow-hidden">
            <div className="px-4 sm:px-6 py-4 border-b border-zinc-100/10 dark:border-white/10">
              <div className="flex items-center gap-2">
                <Send className="h-5 w-5 text-[#97F11D]" />
                <h2 className="text-xl tracking-tight font-semibold text-gray-100 dark:text-white">Create Transfer</h2>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Send FLOW or USDC to anyone, anywhere</p>
            </div>
            
            <div className="p-4 sm:p-6">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2 bg-black dark:bg-white/5 border border-zinc-100/10 dark:border-white/10">
                  <TabsTrigger 
                    value="link" 
                    className="data-[state=active]:bg-[#97F11D] data-[state=active]:text-black text-gray-400"
                  >
                    <Link className="h-4 w-4 mr-2" />
                    Send via Link
                  </TabsTrigger>
                  <TabsTrigger 
                    value="email" 
                    className="data-[state=active]:bg-[#97F11D] data-[state=active]:text-black text-gray-400"
                  >
                    <Mail className="h-4 w-4 mr-2" />
                    Send via Email
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="link" className="mt-6 space-y-6">
                  <div className="rounded-lg bg-[#97F11D]/10 border border-[#97F11D]/20 p-4">
                    <div className="flex items-center gap-2 text-[#97F11D] text-sm">
                      <Link className="h-4 w-4" />
                      Share a secure link with anyone. They can claim funds without creating an account.
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-200 dark:text-gray-200 mb-2">
                          Amount
                        </label>
                        <div className="flex gap-2">
                          <Input
                            type="number"
                            placeholder="0.00"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            className="flex-1 bg-black dark:bg-white/5 border-zinc-100/10 dark:border-white/10 text-gray-100 dark:text-gray-200"
                          />
                          <Select value={token} onValueChange={setToken}>
                            <SelectTrigger className="w-24 bg-black dark:bg-white/5 border-zinc-100/10 dark:border-white/10 text-gray-100 dark:text-gray-200">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-gray-900 border-zinc-100/10 dark:border-white/10">
                              <SelectItem value="FLOW" className="text-gray-100">FLOW</SelectItem>
                              <SelectItem value="USDC" className="text-gray-100">USDC</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <p className="text-xs text-gray-400 mt-1">
                          Available: {token === "FLOW" ? (flowBalance === 0 ? '$0' : flowBalance.toFixed(6)) : (usdcBalance === 0 ? '$0' : usdcBalance.toFixed(6))} {token}
                        </p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-200 dark:text-gray-200 mb-2">
                          Personal Note (Optional)
                        </label>
                        <Textarea
                          placeholder="Add a personal message..."
                          value={note}
                          onChange={(e) => setNote(e.target.value)}
                          className="bg-black dark:bg-white/5 border-zinc-100/10 dark:border-white/10 text-gray-100 dark:text-gray-200"
                          rows={3}
                        />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="rounded-lg bg-white/5 border border-zinc-100/10 dark:border-white/10 p-4">
                        <h3 className="text-sm font-medium text-gray-200 dark:text-gray-200 mb-3">Transfer Details</h3>
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center gap-2 text-gray-400">
                            <Clock className="h-4 w-4" />
                            Expires in 7 days
                          </div>
                          <div className="flex items-center gap-2 text-gray-400">
                            <Info className="h-4 w-4" />
                            Recipients can claim to crypto wallet or bank account
                          </div>
                        </div>
                      </div>

                      <Button
                        onClick={handleSendTransfer}
                        disabled={sending || !amount || parseFloat(amount) <= 0 || balanceError}
                        className="w-full bg-[#97F11D] text-black hover:brightness-95 font-medium"
                      >
                        {sending ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Creating Transfer...
                          </>
                        ) : (
                          <>
                            <Send className="h-4 w-4 mr-2" />
                            SEND VIA LINK
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="email" className="mt-6 space-y-6">
                  <div className="rounded-lg bg-[#97F11D]/10 border border-[#97F11D]/20 p-4">
                    <div className="flex items-center gap-2 text-[#97F11D] text-sm">
                      <Mail className="h-4 w-4" />
                      Send funds directly to someone's email. They'll receive a claim email with instructions.
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-200 dark:text-gray-200 mb-2">
                          Amount
                        </label>
                        <div className="flex gap-2">
                          <Input
                            type="number"
                            placeholder="0.00"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            className="flex-1 bg-black dark:bg-white/5 border-zinc-100/10 dark:border-white/10 text-gray-100 dark:text-gray-200"
                          />
                          <Select value={token} onValueChange={setToken}>
                            <SelectTrigger className="w-24 bg-black dark:bg-white/5 border-zinc-100/10 dark:border-white/10 text-gray-100 dark:text-gray-200">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-gray-900 border-zinc-100/10 dark:border-white/10">
                              <SelectItem value="FLOW" className="text-gray-100">FLOW</SelectItem>
                              <SelectItem value="USDC" className="text-gray-100">USDC</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <p className="text-xs text-gray-400 mt-1">
                          Available: {token === "FLOW" ? (flowBalance === 0 ? '$0' : flowBalance.toFixed(6)) : (usdcBalance === 0 ? '$0' : usdcBalance.toFixed(6))} {token}
                        </p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-200 dark:text-gray-200 mb-2">
                          Recipient Email
                        </label>
                        <Input
                          type="email"
                          placeholder="recipient@example.com"
                          value={recipientEmail}
                          onChange={(e) => setRecipientEmail(e.target.value)}
                          className="bg-black dark:bg-white/5 border-zinc-100/10 dark:border-white/10 text-gray-100 dark:text-gray-200"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-200 dark:text-gray-200 mb-2">
                          Personal Note (Optional)
                        </label>
                        <Textarea
                          placeholder="Add a personal message..."
                          value={note}
                          onChange={(e) => setNote(e.target.value)}
                          className="bg-black dark:bg-white/5 border-zinc-100/10 dark:border-white/10 text-gray-100 dark:text-gray-200"
                          rows={3}
                        />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="rounded-lg bg-white/5 border border-zinc-100/10 dark:border-white/10 p-4">
                        <h3 className="text-sm font-medium text-gray-200 dark:text-gray-200 mb-3">Transfer Details</h3>
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center gap-2 text-gray-400">
                            <Clock className="h-4 w-4" />
                            Expires in 7 days
                          </div>
                          <div className="flex items-center gap-2 text-gray-400">
                            <Info className="h-4 w-4" />
                            Recipients can claim to crypto wallet or bank account
                          </div>
                        </div>
                      </div>

                      <Button
                        onClick={handleSendTransfer}
                        disabled={sending || !amount || parseFloat(amount) <= 0 || !recipientEmail}
                        className="w-full bg-[#97F11D] text-black hover:brightness-95 font-medium"
                      >
                        {sending ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Creating Transfer...
                          </>
                        ) : (
                          <>
                            <Mail className="h-4 w-4 mr-2" />
                            SEND VIA EMAIL
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}