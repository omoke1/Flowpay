"use client";

import { useState } from "react";
import { X, DollarSign, Calendar, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useNotification } from "@/components/providers/notification-provider";

interface CreatePlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPlanCreated: () => void;
  merchantId: string;
}

export function CreatePlanModal({ isOpen, onClose, onPlanCreated, merchantId }: CreatePlanModalProps) {
  const { success, error: showError } = useNotification();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    amount: "",
    currency: "USD",
    intervalType: "month",
    intervalCount: "1",
    trialPeriodDays: "0",
    setupFee: "0"
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/subscriptions/plans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          merchantId,
          ...formData,
          amount: parseFloat(formData.amount),
          intervalCount: parseInt(formData.intervalCount),
          trialPeriodDays: parseInt(formData.trialPeriodDays),
          setupFee: parseFloat(formData.setupFee)
        })
      });

      const data = await response.json();

      if (data.success) {
        success("Plan Created!", "Your subscription plan has been created successfully");
        onPlanCreated();
        onClose();
        setFormData({
          name: "",
          description: "",
          amount: "",
          currency: "USD",
          intervalType: "month",
          intervalCount: "1",
          trialPeriodDays: "0",
          setupFee: "0"
        });
      } else {
        showError("Failed to create plan", data.error);
      }
    } catch (error) {
      console.error("Error creating plan:", error);
      showError("Error", "Failed to create plan");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="w-full max-w-lg rounded-none bg-black border border-white/10 shadow-xl">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-white/10">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-[#97F11D] flex items-center justify-center">
              <Settings className="h-3 w-3 text-black" />
            </div>
            <h2 className="text-lg font-bold text-white">Create Subscription Plan</h2>
          </div>
          <Button
            onClick={onClose}
            variant="ghost"
            size="sm"
            className="text-gray-400 hover:text-white p-1"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Plan Details */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <Settings className="h-4 w-4 text-[#97F11D]" />
                Plan Details
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="name" className="text-white text-sm">Plan Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Pro Plan"
                    required
                    className="bg-black border-white/10 text-white placeholder:text-gray-400 h-9"
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="currency" className="text-white text-sm">Currency</Label>
                  <Select
                    value={formData.currency}
                    onValueChange={(value) => setFormData({ ...formData, currency: value })}
                  >
                    <SelectTrigger className="bg-black border-white/10 text-white h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD</SelectItem>
                      <SelectItem value="FLOW">FLOW</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-1">
                <Label htmlFor="description" className="text-white text-sm">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe what this plan includes..."
                  className="bg-black border-white/10 text-white placeholder:text-gray-400 h-16"
                />
              </div>
            </div>

            {/* Pricing */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-[#97F11D]" />
                Pricing
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="amount" className="text-white text-sm">Amount</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    placeholder="99.99"
                    required
                    className="bg-black border-white/10 text-white placeholder:text-gray-400 h-9"
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="intervalType" className="text-white text-sm">Billing Interval</Label>
                  <Select
                    value={formData.intervalType}
                    onValueChange={(value) => setFormData({ ...formData, intervalType: value })}
                  >
                    <SelectTrigger className="bg-black border-white/10 text-white h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="day">Daily</SelectItem>
                      <SelectItem value="week">Weekly</SelectItem>
                      <SelectItem value="month">Monthly</SelectItem>
                      <SelectItem value="year">Yearly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  <Label htmlFor="intervalCount" className="text-white text-sm">Interval Count</Label>
                  <Input
                    id="intervalCount"
                    type="number"
                    min="1"
                    value={formData.intervalCount}
                    onChange={(e) => setFormData({ ...formData, intervalCount: e.target.value })}
                    placeholder="1"
                    required
                    className="bg-black border-white/10 text-white placeholder:text-gray-400 h-9"
                  />
                </div>
              </div>
            </div>

            {/* Trial & Setup */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <Calendar className="h-4 w-4 text-[#97F11D]" />
                Trial & Setup
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="trialPeriodDays" className="text-white text-sm">Trial Period (Days)</Label>
                  <Input
                    id="trialPeriodDays"
                    type="number"
                    min="0"
                    value={formData.trialPeriodDays}
                    onChange={(e) => setFormData({ ...formData, trialPeriodDays: e.target.value })}
                    placeholder="0"
                    className="bg-black border-white/10 text-white placeholder:text-gray-400 h-9"
                  />
                  <p className="text-xs text-gray-400">0 = No trial period</p>
                </div>

                <div className="space-y-1">
                  <Label htmlFor="setupFee" className="text-white text-sm">Setup Fee</Label>
                  <Input
                    id="setupFee"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.setupFee}
                    onChange={(e) => setFormData({ ...formData, setupFee: e.target.value })}
                    placeholder="0.00"
                    className="bg-black border-white/10 text-white placeholder:text-gray-400 h-9"
                  />
                  <p className="text-xs text-gray-400">One-time fee charged at signup</p>
                </div>
              </div>
            </div>

            {/* Preview */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-white">Plan Preview</h3>
              <div className="rounded-none bg-black border border-white/10 p-3">
                <div className="flex justify-between items-center mb-1">
                  <h4 className="text-white font-semibold text-sm">{formData.name || "Plan Name"}</h4>
                  <span className="text-[#97F11D] font-bold text-sm">
                    ${formData.amount || "0.00"} {formData.currency}
                  </span>
                </div>
                <p className="text-gray-400 text-xs mb-1">
                  per {formData.intervalCount} {formData.intervalType}
                  {parseInt(formData.intervalCount) > 1 ? 's' : ''}
                </p>
                {formData.description && (
                  <p className="text-gray-300 text-xs">{formData.description}</p>
                )}
                {parseInt(formData.trialPeriodDays) > 0 && (
                  <p className="text-blue-400 text-xs mt-1">
                    {formData.trialPeriodDays} day free trial
                  </p>
                )}
                {parseFloat(formData.setupFee) > 0 && (
                  <p className="text-orange-400 text-xs">
                    ${formData.setupFee} setup fee
                  </p>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-3 border-t border-white/10">
              <Button
                type="button"
                onClick={onClose}
                variant="outline"
                className="bg-black border-white/10 text-white hover:bg-white/5 h-9 px-4"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="bg-[#97F11D] hover:bg-[#97F11D]/90 text-black font-semibold h-9 px-4"
              >
                {loading ? "Creating..." : "Create Plan"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
