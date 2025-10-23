"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useFlowProduction } from "@/components/providers/flow-provider-production";
import { useNotification } from "@/components/providers/notification-provider";
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { getUserAddress } from "@/lib/utils";

export default function CreatePaymentLinkPage() {
  const router = useRouter();
  const { isConnected, user, disconnectWallet } = useFlowProduction();
  const { success, error } = useNotification();
  const [loading, setLoading] = useState(false);

  // Get user address using utility function
  const userAddress = getUserAddress(user);
  const [formData, setFormData] = useState({
    productName: "",
    description: "",
    amount: "100",
    token: "USDC",
    redirectUrl: "",
    acceptCrypto: true,
    acceptFiat: true,
  });

  if (!isConnected) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Please connect your wallet</h1>
          <p className="text-gray-400">You need to connect your Flow wallet to create payment links.</p>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate at least one payment method is selected
      if (!formData.acceptCrypto && !formData.acceptFiat) {
        error(
          "Payment Method Required",
          "Please enable at least one payment method (crypto or card)"
        );
        setLoading(false);
        return;
      }

      // Use the wallet address as merchant ID
      const merchantId = userAddress; // Use the connected wallet address

      console.log("Creating payment link with merchantId:", merchantId);

      // Create payment link via API
      const response = await fetch("/api/payment-links", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          merchantId: merchantId,
          productName: formData.productName,
          description: formData.description,
          amount: formData.amount,
          token: formData.token,
          redirectUrl: formData.redirectUrl,
          acceptCrypto: formData.acceptCrypto,
          acceptFiat: formData.acceptFiat,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create payment link");
      }

      const data = await response.json();
      console.log("Payment link created:", data);

      // Show success notification
      success(
        "Payment Link Created! 🎉",
        `Your payment link is ready to share`,
        {
          duration: 6000,
          action: {
            label: "Copy Link",
            onClick: () => {
              navigator.clipboard.writeText(data.checkoutUrl);
              success("Link Copied!", "Payment link copied to clipboard");
            }
          }
        }
      );
      
      // Redirect back to dashboard after a short delay
      setTimeout(() => {
        router.push("/dashboard");
      }, 2000);
    } catch (error: any) {
      console.error("Error creating payment link:", error);
      showError(
        "Failed to Create Link",
        error.message || "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black dark:bg-[#0A0A0A] text-gray-900 dark:text-gray-200 font-sans antialiased">
      {/* Mobile Sidebar Backdrop */}
      <div id="mobile-backdrop" className="fixed inset-0 z-30 hidden bg-black/60 backdrop-blur-sm lg:hidden"></div>

      {/* Sidebar */}
      <DashboardSidebar activeItem="links" onLogout={disconnectWallet} />

      {/* Main */}
      <div className="lg:pl-60">
        {/* Top Bar */}
        <DashboardHeader 
          title="Create Payment Link" 
          onSearch={() => {}} 
          onCreatePaymentLink={() => {}}
          address={userAddress}
          onLogout={disconnectWallet}
        />

        {/* Modal Backdrop */}
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-lg my-8">
            <Card className="bg-black dark:bg-[#0D0D0D] border border-zinc-100/10 dark:border-white/10 max-h-[90vh] overflow-y-auto">
              <CardHeader className="pb-3 sticky top-0 bg-black dark:bg-[#0D0D0D] z-10 border-b border-zinc-100/10 dark:border-white/10">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base sm:text-lg font-semibold text-gray-100 dark:text-white">Create payment link</CardTitle>
                  <button 
                    onClick={() => router.push("/dashboard")}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </CardHeader>
              <CardContent className="pt-4">
                <form onSubmit={handleSubmit} className="space-y-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="productName" className="text-xs sm:text-sm font-medium text-gray-100 dark:text-white">Link name</Label>
                    <Input
                      id="productName"
                      placeholder="e.g. Design Service"
                      value={formData.productName}
                      onChange={(e) =>
                        setFormData({ ...formData, productName: e.target.value })
                      }
                      required
                      className="bg-black/[0.03] dark:bg-white/5 border border-zinc-100/10 dark:border-white/10 text-gray-100 dark:text-white h-9 text-sm"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label htmlFor="amount" className="text-xs sm:text-sm font-medium text-gray-100 dark:text-white">Price (USD)</Label>
                      <Input
                        id="amount"
                        type="number"
                        step="0.01"
                        placeholder="100"
                        value={formData.amount}
                        onChange={(e) =>
                          setFormData({ ...formData, amount: e.target.value })
                        }
                        required
                        className="bg-black/[0.03] dark:bg-white/5 border border-zinc-100/10 dark:border-white/10 text-gray-100 dark:text-white h-9 text-sm"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="token" className="text-xs sm:text-sm font-medium text-gray-100 dark:text-white">Token</Label>
                      <Select
                        id="token"
                        value={formData.token}
                        onChange={(e) =>
                          setFormData({ ...formData, token: e.target.value })
                        }
                        className="bg-black/[0.03] dark:bg-white/5 border border-zinc-100/10 dark:border-white/10 text-gray-100 dark:text-white h-9 text-sm"
                      >
                        <option value="USDC">USDC.e</option>
                        <option value="FLOW">FLOW</option>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="description" className="text-xs sm:text-sm font-medium text-gray-100 dark:text-white">Description (Optional)</Label>
                    <Textarea
                      id="description"
                      placeholder="What is this link for?"
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({ ...formData, description: e.target.value })
                      }
                      className="bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700 text-gray-100 dark:text-white min-h-[60px] text-sm resize-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="redirectUrl" className="text-xs sm:text-sm font-medium text-gray-100 dark:text-white">Redirect URL (Optional)</Label>
                    <Input
                      id="redirectUrl"
                      type="url"
                      placeholder="https://your-domain.com/thank-you"
                      value={formData.redirectUrl}
                      onChange={(e) =>
                        setFormData({ ...formData, redirectUrl: e.target.value })
                      }
                      className="bg-black/[0.03] dark:bg-white/5 border border-zinc-100/10 dark:border-white/10 text-gray-100 dark:text-white h-9 text-sm"
                    />
                  </div>

                  <div className="space-y-2 pt-1">
                    <Label className="text-xs sm:text-sm font-medium text-gray-100 dark:text-white">Payment Methods</Label>
                    <div className="space-y-1.5 bg-gray-50 dark:bg-gray-950 p-3 rounded-lg border border-gray-200 dark:border-gray-800">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.acceptCrypto}
                          onChange={(e) =>
                            setFormData({ ...formData, acceptCrypto: e.target.checked })
                          }
                          className="w-3.5 h-3.5 text-[#97F11D] bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700 rounded focus:ring-[#97F11D]"
                        />
                        <span className="text-xs sm:text-sm text-gray-100 dark:text-white">Crypto (FLOW, USDC.e)</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.acceptFiat}
                          onChange={(e) =>
                            setFormData({ ...formData, acceptFiat: e.target.checked })
                          }
                          className="w-3.5 h-3.5 text-[#97F11D] bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700 rounded focus:ring-[#97F11D]"
                        />
                        <span className="text-xs sm:text-sm text-gray-100 dark:text-white">Card (via Transak)</span>
                      </label>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-3 border-t border-gray-200 dark:border-gray-800 mt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => router.push("/dashboard")}
                      className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm border-gray-300 dark:border-gray-700 text-gray-100 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800"
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={loading} 
                      className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm bg-[#97F11D] hover:bg-[#97F11D]/90 text-black font-medium flex items-center gap-1.5"
                    >
                      {loading ? "Creating..." : (
                        <>
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Create Link
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

