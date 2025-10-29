"use client";

import { useState, useEffect } from "react";
import { CreditCard, Calendar, DollarSign, AlertCircle, CheckCircle, TrendingUp, Clock } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface Subscription {
  id: string;
  plan_name: string;
  status: string;
  current_period_end: string;
  amount: number;
  currency: string;
  next_billing_date: string;
}

interface CustomerStats {
  active_subscriptions: number;
  total_spent: number;
  next_payment: number;
  next_payment_date: string;
}

export default function CustomerPortalDashboard() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [stats, setStats] = useState<CustomerStats>({
    active_subscriptions: 0,
    total_spent: 0,
    next_payment: 0,
    next_payment_date: ""
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCustomerData();
  }, []);

  const fetchCustomerData = async () => {
    try {
      // Get customer token from localStorage
      const customerToken = localStorage.getItem('customer_token');
      if (!customerToken) {
        // Redirect to login if no token
        window.location.href = '/customer-portal/login';
        return;
      }

      // Fetch customer subscriptions and stats
      const [subscriptionsRes, statsRes] = await Promise.all([
        fetch('/api/customer-portal/subscriptions', {
          headers: { 'Authorization': `Bearer ${customerToken}` }
        }),
        fetch('/api/customer-portal/stats', {
          headers: { 'Authorization': `Bearer ${customerToken}` }
        })
      ]);

      if (subscriptionsRes.ok) {
        const subscriptionsData = await subscriptionsRes.json();
        setSubscriptions(subscriptionsData.subscriptions || []);
      }

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }
    } catch (error) {
      console.error('Error fetching customer data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/20';
      case 'cancelled':
        return 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/20';
      case 'past_due':
        return 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/20';
      default:
        return 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-900/20';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase()
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#97F11D]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-gray-400">Manage your subscriptions and billing</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="rounded-2xl bg-black dark:bg-[#111111] border border-zinc-100/10 dark:border-white/10">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-[#97F11D]/10 rounded-lg">
                <CreditCard className="h-5 w-5 text-[#97F11D]" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-400">Active Subscriptions</p>
                <p className="text-2xl font-bold text-white">
                  {stats.active_subscriptions}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl bg-black dark:bg-[#111111] border border-zinc-100/10 dark:border-white/10">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-[#97F11D]/10 rounded-lg">
                <DollarSign className="h-5 w-5 text-[#97F11D]" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-400">Total Spent</p>
                <p className="text-2xl font-bold text-white">
                  {formatCurrency(stats.total_spent, 'USD')}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl bg-black dark:bg-[#111111] border border-zinc-100/10 dark:border-white/10">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-[#97F11D]/10 rounded-lg">
                <Calendar className="h-5 w-5 text-[#97F11D]" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-400">Next Payment</p>
                <p className="text-2xl font-bold text-white">
                  {formatCurrency(stats.next_payment, 'USD')}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl bg-black dark:bg-[#111111] border border-zinc-100/10 dark:border-white/10">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-[#97F11D]/10 rounded-lg">
                <AlertCircle className="h-5 w-5 text-[#97F11D]" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-400">Next Billing Date</p>
                <p className="text-sm font-semibold text-white">
                  {stats.next_payment_date ? formatDate(stats.next_payment_date) : 'N/A'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Subscriptions */}
      <Card className="rounded-2xl bg-black dark:bg-[#111111] border border-zinc-100/10 dark:border-white/10">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold text-white">Recent Subscriptions</CardTitle>
          <CardDescription className="text-gray-400">Your latest subscription activity</CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          {subscriptions.length === 0 ? (
            <div className="text-center py-8">
              <CreditCard className="mx-auto h-12 w-12 text-gray-500 mb-4" />
              <h3 className="text-sm font-medium text-white mb-2">No subscriptions</h3>
              <p className="text-sm text-gray-400">
                You don't have any active subscriptions yet.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {subscriptions.slice(0, 5).map((subscription) => (
                <div key={subscription.id} className="flex items-center space-x-3 p-3 rounded-lg bg-white/5">
                  <div className="p-2 bg-[#97F11D]/10 rounded-lg">
                    {subscription.status === 'active' ? (
                      <CheckCircle className="h-4 w-4 text-[#97F11D]" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-[#97F11D]" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-medium text-white">
                      {subscription.plan_name}
                    </h3>
                    <p className="text-xs text-gray-400">
                      {formatCurrency(subscription.amount, subscription.currency)} • 
                      Next billing: {formatDate(subscription.next_billing_date)}
                    </p>
                  </div>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    subscription.status === 'active' 
                      ? 'bg-[#97F11D]/10 text-[#97F11D] border border-[#97F11D]/20' 
                      : 'bg-gray-500/10 text-gray-400 border border-gray-500/20'
                  }`}>
                    {subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1)}
                  </span>
                </div>
              ))}
            </div>
          )}
          {subscriptions.length > 5 && (
            <div className="mt-4 pt-4 border-t border-white/10 text-center">
              <a
                href="/customer-portal/subscriptions"
                className="text-sm font-medium text-[#97F11D] hover:text-[#97F11D]/80"
              >
                View all subscriptions
              </a>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
