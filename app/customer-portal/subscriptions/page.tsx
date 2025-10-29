"use client";

import { useState, useEffect } from "react";
import { CreditCard, Calendar, DollarSign, AlertCircle, CheckCircle, X, Settings } from "lucide-react";

interface Subscription {
  id: string;
  plan_name: string;
  description: string;
  status: string;
  current_period_start: string;
  current_period_end: string;
  amount: number;
  currency: string;
  interval_type: string;
  interval_count: number;
  next_billing_date: string;
  cancel_at_period_end: boolean;
  trial_end?: string;
}

export default function CustomerSubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const fetchSubscriptions = async () => {
    try {
      const customerToken = localStorage.getItem('customer_token');
      if (!customerToken) {
        window.location.href = '/customer-portal/login';
        return;
      }

      const response = await fetch('/api/customer-portal/subscriptions', {
        headers: { 'Authorization': `Bearer ${customerToken}` }
      });

      if (response.ok) {
        const data = await response.json();
        setSubscriptions(data.subscriptions || []);
      }
    } catch (error) {
      console.error('Error fetching subscriptions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelSubscription = async (subscriptionId: string) => {
    if (!confirm('Are you sure you want to cancel this subscription? You will continue to have access until the end of your current billing period.')) {
      return;
    }

    setCancellingId(subscriptionId);
    try {
      const customerToken = localStorage.getItem('customer_token');
      const response = await fetch(`/api/customer-portal/subscriptions/${subscriptionId}/cancel`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${customerToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        // Refresh subscriptions
        await fetchSubscriptions();
        alert('Subscription cancelled successfully. You will continue to have access until the end of your current billing period.');
      } else {
        alert('Failed to cancel subscription. Please try again.');
      }
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      alert('An error occurred while cancelling the subscription.');
    } finally {
      setCancellingId(null);
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
      case 'paused':
        return 'text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/20';
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

  const getIntervalText = (intervalType: string, intervalCount: number) => {
    if (intervalCount === 1) {
      return intervalType;
    }
    return `${intervalCount} ${intervalType}s`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Subscriptions</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Manage your active subscriptions and billing
        </p>
      </div>

      {/* Subscriptions List */}
      <div className="space-y-6">
        {subscriptions.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-8 text-center">
            <CreditCard className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No subscriptions</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              You don't have any subscriptions yet.
            </p>
          </div>
        ) : (
          subscriptions.map((subscription) => (
            <div key={subscription.id} className="bg-white dark:bg-gray-800 rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                      {subscription.plan_name}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {subscription.description}
                    </p>
                  </div>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(subscription.status)}`}>
                    {subscription.status === 'active' ? (
                      <CheckCircle className="w-4 h-4 mr-1" />
                    ) : (
                      <AlertCircle className="w-4 h-4 mr-1" />
                    )}
                    {subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1)}
                  </span>
                </div>
              </div>

              <div className="px-6 py-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Billing Amount</h4>
                    <p className="mt-1 text-lg font-semibold text-gray-900 dark:text-white">
                      {formatCurrency(subscription.amount, subscription.currency)}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      per {getIntervalText(subscription.interval_type, subscription.interval_count)}
                    </p>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Current Period</h4>
                    <p className="mt-1 text-sm text-gray-900 dark:text-white">
                      {formatDate(subscription.current_period_start)} - {formatDate(subscription.current_period_end)}
                    </p>
                    {subscription.trial_end && new Date(subscription.trial_end) > new Date() && (
                      <p className="text-sm text-blue-600 dark:text-blue-400">
                        Trial ends {formatDate(subscription.trial_end)}
                      </p>
                    )}
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Next Billing</h4>
                    <p className="mt-1 text-sm text-gray-900 dark:text-white">
                      {formatDate(subscription.next_billing_date)}
                    </p>
                    {subscription.cancel_at_period_end && (
                      <p className="text-sm text-red-600 dark:text-red-400">
                        Will cancel at period end
                      </p>
                    )}
                  </div>
                </div>

                <div className="mt-6 flex items-center justify-between">
                  <div className="flex space-x-3">
                    <button className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                      <Settings className="w-4 h-4 mr-2" />
                      Manage Payment
                    </button>
                  </div>

                  {subscription.status === 'active' && !subscription.cancel_at_period_end && (
                    <button
                      onClick={() => handleCancelSubscription(subscription.id)}
                      disabled={cancellingId === subscription.id}
                      className="inline-flex items-center px-3 py-2 border border-red-300 dark:border-red-600 rounded-md text-sm font-medium text-red-700 dark:text-red-300 bg-white dark:bg-gray-700 hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-50"
                    >
                      {cancellingId === subscription.id ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600 mr-2"></div>
                      ) : (
                        <X className="w-4 h-4 mr-2" />
                      )}
                      Cancel Subscription
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
