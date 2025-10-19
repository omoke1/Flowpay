"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useFlowUser } from "@/components/providers/flow-provider";
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

export default function CreatePaymentLinkPage() {
  const router = useRouter();
  const { loggedIn, address, logOut } = useFlowUser();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    productName: "",
    description: "",
    amount: "100",
    token: "USDC",
    redirectUrl: "",
  });

  if (!loggedIn) {
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
      // Create payment link via API
      const response = await fetch("/api/payment-links", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          merchantId: address,
          productName: formData.productName,
          description: formData.description,
          amount: formData.amount,
          token: formData.token,
          redirectUrl: formData.redirectUrl,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create payment link");
      }

      const data = await response.json();
      console.log("Payment link created:", data);

      // Show success message with the link
      alert(`Payment link created! Share this URL:\n${data.checkoutUrl}`);
      
      // Redirect back to dashboard
      router.push("/dashboard");
    } catch (error: any) {
      console.error("Error creating payment link:", error);
      alert(`Failed to create payment link: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#0A0A0A] text-gray-900 dark:text-gray-200 font-sans antialiased">
      {/* Mobile Sidebar Backdrop */}
      <div id="mobile-backdrop" className="fixed inset-0 z-30 hidden bg-black/60 backdrop-blur-sm lg:hidden"></div>

      {/* Sidebar */}
      <DashboardSidebar activeItem="links" onLogout={logOut} />

      {/* Main */}
      <div className="lg:pl-60">
        {/* Top Bar */}
        <DashboardHeader 
          title="Create Payment Link" 
          onSearch={() => {}} 
          onCreatePaymentLink={() => {}}
          address={address}
          onLogout={logOut}
        />

        {/* Modal Backdrop */}
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 flex items-center justify-center p-4">
          <div className="w-full max-w-md">
            <Card className="bg-white dark:bg-[#111111] border-gray-200 dark:border-gray-800">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">Create payment link</CardTitle>
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
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="productName" className="text-sm font-medium text-gray-900 dark:text-white">Link name</Label>
                    <Input
                      id="productName"
                      placeholder="e.g. Design Service"
                      value={formData.productName}
                      onChange={(e) =>
                        setFormData({ ...formData, productName: e.target.value })
                      }
                      required
                      className="bg-white dark:bg-[#0D0D0D] border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white h-10"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="amount" className="text-sm font-medium text-gray-900 dark:text-white">Price (USD)</Label>
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
                      className="bg-white dark:bg-[#0D0D0D] border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white h-10"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="token" className="text-sm font-medium text-gray-900 dark:text-white">Token</Label>
                    <Select
                      id="token"
                      value={formData.token}
                      onChange={(e) =>
                        setFormData({ ...formData, token: e.target.value })
                      }
                      className="bg-white dark:bg-[#0D0D0D] border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white h-10"
                    >
                      <option value="USDC">USDC.e</option>
                      <option value="FLOW">FLOW</option>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description" className="text-sm font-medium text-gray-900 dark:text-white">Description</Label>
                    <Textarea
                      id="description"
                      placeholder="What is this link for?"
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({ ...formData, description: e.target.value })
                      }
                      className="bg-white dark:bg-[#0D0D0D] border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white min-h-[80px]"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="redirectUrl" className="text-sm font-medium text-gray-900 dark:text-white">Redirect URL (Optional)</Label>
                    <Input
                      id="redirectUrl"
                      type="url"
                      placeholder="https://example.com/thank-you"
                      value={formData.redirectUrl}
                      onChange={(e) =>
                        setFormData({ ...formData, redirectUrl: e.target.value })
                      }
                      className="bg-white dark:bg-[#0D0D0D] border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white h-10"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Where to redirect customers after successful payment
                    </p>
                  </div>

                  <div className="flex justify-end gap-3 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => router.push("/dashboard")}
                      className="px-4 py-2 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800"
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={loading} 
                      className="px-4 py-2 bg-[#97F11D] hover:bg-[#97F11D]/90 text-black font-medium flex items-center gap-2"
                    >
                      {loading ? "Creating..." : (
                        <>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Create
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

