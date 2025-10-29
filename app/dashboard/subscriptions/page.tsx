"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useFlowMainnet } from "@/components/providers/flow-provider-mainnet";
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { getUserAddress } from "@/lib/utils";
import { 
  Plus, 
  Users, 
  DollarSign, 
  TrendingUp, 
  Calendar,
  Settings,
  MoreVertical,
  Play,
  Pause,
  X
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNotification } from "@/components/providers/notification-provider";
import { SubscriptionPlan, Subscription } from "@/lib/subscription-service";
import { CreatePlanModal } from "@/components/subscriptions/create-plan-modal";

export default function SubscriptionsPage() {
  const router = useRouter();
  const { isConnected, user, disconnectWallet } = useFlowMainnet();
  const { success, error: showError } = useNotification();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("plans");
  const [showCreatePlan, setShowCreatePlan] = useState(false);
  
  // Data state
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);

  const userAddress = getUserAddress(user);

  useEffect(() => {
    if (!isConnected) {
      router.push("/");
      return;
    }

    if (userAddress) {
      fetchData();
    }
  }, [isConnected, userAddress, router]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch plans
      const plansResponse = await fetch(`/api/subscriptions/plans?merchantId=${userAddress}`);
      const plansData = await plansResponse.json();
      if (plansData.success) {
        setPlans(plansData.plans);
      }

      // Fetch subscriptions
      const subscriptionsResponse = await fetch(`/api/subscriptions?merchantId=${userAddress}`);
      const subscriptionsData = await subscriptionsResponse.json();
      if (subscriptionsData.success) {
        setSubscriptions(subscriptionsData.subscriptions);
      }

      // Fetch analytics
      const analyticsResponse = await fetch(`/api/subscriptions/analytics?merchantId=${userAddress}`);
      const analyticsData = await analyticsResponse.json();
      if (analyticsData.success) {
        setAnalytics(analyticsData.summary);
      }

    } catch (error) {
      console.error("Error fetching subscription data:", error);
      showError("Error", "Failed to load subscription data");
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePlan = () => {
    setShowCreatePlan(true);
  };

  const handleCancelSubscription = async (subscriptionId: string) => {
    try {
      const response = await fetch(`/api/subscriptions/${subscriptionId}/cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cancelAtPeriodEnd: true })
      });

      const data = await response.json();
      
      if (data.success) {
        success("Subscription cancelled", "The subscription will end at the current period");
        fetchData(); // Refresh data
      } else {
        showError("Failed to cancel subscription", data.error);
      }
    } catch (error) {
      console.error("Error cancelling subscription:", error);
      showError("Error", "Failed to cancel subscription");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'cancelled':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'past_due':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'unpaid':
        return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'paused':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency === 'USD' ? 'USD' : 'FLOW'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
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
      <DashboardSidebar activeItem="subscriptions" onLogout={disconnectWallet} />

      {/* Main */}
      <div className="lg:pl-60">
        {/* Top Bar */}
        <DashboardHeader 
          title="Subscriptions" 
          onSearch={() => {}} 
          onCreatePaymentLink={() => router.push("/dashboard/create")}
          onSendMoney={() => router.push("/dashboard/send")}
          onSubscriptions={() => router.push("/dashboard/subscriptions")}
          address={userAddress}
        />

        {/* Content Wrapper */}
        <main className="px-4 sm:px-6 lg:px-8 py-6 space-y-8">
          {/* Analytics Overview */}
          {analytics && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="rounded-2xl bg-black dark:bg-[#111111] border border-zinc-100/10 dark:border-white/10 p-4 sm:p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Monthly Recurring Revenue</div>
                    <div className="mt-3 text-2xl tracking-tight font-semibold text-gray-100 dark:text-white">
                      ${analytics.totalMRR}
                    </div>
                  </div>
                  <DollarSign className="h-8 w-8 text-[#97F11D]" />
                </div>
              </div>

              <div className="rounded-2xl bg-black dark:bg-[#111111] border border-zinc-100/10 dark:border-white/10 p-4 sm:p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Active Subscriptions</div>
                    <div className="mt-3 text-2xl tracking-tight font-semibold text-gray-100 dark:text-white">
                      {analytics.activeSubscriptions}
                    </div>
                  </div>
                  <Users className="h-8 w-8 text-[#97F11D]" />
                </div>
              </div>

              <div className="rounded-2xl bg-black dark:bg-[#111111] border border-zinc-100/10 dark:border-white/10 p-4 sm:p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">New This Month</div>
                    <div className="mt-3 text-2xl tracking-tight font-semibold text-gray-100 dark:text-white">
                      {analytics.newSubscriptions}
                    </div>
                  </div>
                  <TrendingUp className="h-8 w-8 text-[#97F11D]" />
                </div>
              </div>

              <div className="rounded-2xl bg-black dark:bg-[#111111] border border-zinc-100/10 dark:border-white/10 p-4 sm:p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Churn Rate</div>
                    <div className="mt-3 text-2xl tracking-tight font-semibold text-gray-100 dark:text-white">
                      {analytics.churnRate}%
                    </div>
                  </div>
                  <TrendingUp className="h-8 w-8 text-[#97F11D]" />
                </div>
              </div>
            </div>
          )}

          {/* Main Content */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <div className="flex items-center justify-between">
              <TabsList className="bg-black dark:bg-[#111111] border border-zinc-100/10 dark:border-white/10">
                <TabsTrigger 
                  value="plans" 
                  className="data-[state=active]:bg-[#97F11D] data-[state=active]:!text-black text-gray-300 dark:text-gray-300"
                >
                  <span className="data-[state=active]:!text-black">Subscription Plans</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="subscriptions" 
                  className="data-[state=active]:bg-[#97F11D] data-[state=active]:!text-black text-gray-300 dark:text-gray-300"
                >
                  <span className="data-[state=active]:!text-black">Active Subscriptions</span>
                </TabsTrigger>
              </TabsList>
              
              {activeTab === "plans" && (
                <Button
                  onClick={handleCreatePlan}
                  className="bg-[#97F11D] hover:bg-[#97F11D]/90 text-black font-semibold"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Plan
                </Button>
              )}
            </div>

            {/* Plans Tab */}
            <TabsContent value="plans" className="space-y-6">
              {plans.length === 0 ? (
                <div className="rounded-2xl bg-black dark:bg-[#111111] border border-zinc-100/10 dark:border-white/10 p-12 text-center">
                  <div className="text-gray-500 dark:text-gray-400 mb-4">No subscription plans yet</div>
                  <Button
                    onClick={handleCreatePlan}
                    className="bg-[#97F11D] hover:bg-[#97F11D]/90 text-black font-semibold"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create Your First Plan
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {plans.map((plan) => (
                    <div 
                      key={plan.id} 
                      className="rounded-2xl bg-black dark:bg-[#111111] border border-zinc-100/10 dark:border-white/10 p-6"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-100 dark:text-white">{plan.name}</h3>
                          {plan.description && (
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{plan.description}</p>
                          )}
                        </div>
                        <Badge className="bg-[#97F11D]/20 text-[#97F11D] border-[#97F11D]/30">
                          {plan.interval_type}
                        </Badge>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex justify-between items-baseline">
                          <span className="text-3xl font-bold text-gray-100 dark:text-white">
                            {formatCurrency(plan.amount, plan.currency)}
                          </span>
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            per {plan.interval_count} {plan.interval_type}
                            {plan.interval_count > 1 ? 's' : ''}
                          </span>
                        </div>
                        
                        {plan.trial_period_days > 0 && (
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {plan.trial_period_days} day trial
                          </div>
                        )}

                        {plan.setup_fee > 0 && (
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            ${plan.setup_fee} setup fee
                          </div>
                        )}

                        <div className="flex gap-2 pt-4 border-t border-zinc-100/10 dark:border-white/10">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1 bg-black dark:bg-[#111111] border-zinc-100/10 dark:border-white/10 text-gray-300 dark:text-gray-300 hover:bg-white/5"
                          >
                            <Settings className="h-4 w-4 mr-2" />
                            Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="bg-black dark:bg-[#111111] border-zinc-100/10 dark:border-white/10 text-gray-300 dark:text-gray-300 hover:bg-white/5"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Subscriptions Tab */}
            <TabsContent value="subscriptions" className="space-y-6">
              {subscriptions.length === 0 ? (
                <div className="rounded-2xl bg-black dark:bg-[#111111] border border-zinc-100/10 dark:border-white/10 p-12 text-center">
                  <div className="text-gray-500 dark:text-gray-400">No active subscriptions yet</div>
                </div>
              ) : (
                <div className="space-y-4">
                  {subscriptions.map((subscription) => (
                    <div 
                      key={subscription.id} 
                      className="rounded-2xl bg-black dark:bg-[#111111] border border-zinc-100/10 dark:border-white/10 p-6"
                    >
                      <div className="flex justify-between items-start">
                        <div className="space-y-2 flex-1">
                          <div className="flex items-center gap-3">
                            <h3 className="text-lg font-semibold text-gray-100 dark:text-white">
                              {subscription.customer_email || subscription.customer_id}
                            </h3>
                            <Badge className={getStatusColor(subscription.status)}>
                              {subscription.status}
                            </Badge>
                          </div>
                          
                          <div className="text-sm text-gray-500 dark:text-gray-400 space-y-1">
                            <p>Plan: {subscription.plan_id}</p>
                            <p>Current Period: {formatDate(subscription.current_period_start)} - {formatDate(subscription.current_period_end)}</p>
                            {subscription.trial_end && (
                              <p>Trial ends: {formatDate(subscription.trial_end)}</p>
                            )}
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="bg-black dark:bg-[#111111] border-zinc-100/10 dark:border-white/10 text-gray-300 dark:text-gray-300 hover:bg-white/5"
                          >
                            <Play className="h-4 w-4 mr-2" />
                            View
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleCancelSubscription(subscription.id)}
                            className="bg-black dark:bg-[#111111] border-red-500/30 text-red-400 hover:bg-red-500/10"
                          >
                            <X className="h-4 w-4 mr-2" />
                            Cancel
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>

          {/* Create Plan Modal */}
          <CreatePlanModal
            isOpen={showCreatePlan}
            onClose={() => setShowCreatePlan(false)}
            onPlanCreated={fetchData}
            merchantId={userAddress || ""}
          />
        </main>
      </div>
    </div>
  );
}
