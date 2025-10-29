"use client";

import { useState, useEffect } from "react";
import { Download, Receipt, Calendar, DollarSign, CheckCircle, XCircle, Clock } from "lucide-react";

interface BillingRecord {
  id: string;
  subscription_id: string;
  plan_name: string;
  amount: number;
  currency: string;
  status: string;
  payment_method: string;
  processed_at: string;
  invoice_url?: string;
  receipt_url?: string;
}

export default function CustomerBillingPage() {
  const [billingRecords, setBillingRecords] = useState<BillingRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'paid' | 'pending' | 'failed'>('all');

  useEffect(() => {
    fetchBillingHistory();
  }, []);

  const fetchBillingHistory = async () => {
    try {
      const customerToken = localStorage.getItem('customer_token');
      if (!customerToken) {
        window.location.href = '/customer-portal/login';
        return;
      }

      const response = await fetch('/api/customer-portal/billing', {
        headers: { 'Authorization': `Bearer ${customerToken}` }
      });

      if (response.ok) {
        const data = await response.json();
        setBillingRecords(data.billing_records || []);
      }
    } catch (error) {
      console.error('Error fetching billing history:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'pending':
      case 'processing':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/20';
      case 'failed':
        return 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/20';
      case 'pending':
      case 'processing':
        return 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/20';
      default:
        return 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-900/20';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase()
    }).format(amount);
  };

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case 'crypto':
        return '₿';
      case 'fiat':
        return '💳';
      case 'apple_pay':
        return '🍎';
      case 'google_pay':
        return 'G';
      default:
        return '💳';
    }
  };

  const filteredRecords = billingRecords.filter(record => {
    if (filter === 'all') return true;
    if (filter === 'paid') return record.status === 'completed';
    if (filter === 'pending') return record.status === 'pending' || record.status === 'processing';
    if (filter === 'failed') return record.status === 'failed';
    return true;
  });

  const downloadInvoice = async (recordId: string) => {
    try {
      const customerToken = localStorage.getItem('customer_token');
      const response = await fetch(`/api/customer-portal/billing/${recordId}/invoice`, {
        headers: { 'Authorization': `Bearer ${customerToken}` }
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `invoice-${recordId}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        alert('Invoice not available for this payment.');
      }
    } catch (error) {
      console.error('Error downloading invoice:', error);
      alert('Failed to download invoice.');
    }
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
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Billing History</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          View and download your payment history and invoices
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="flex flex-wrap gap-2">
          {[
            { key: 'all', label: 'All Payments' },
            { key: 'paid', label: 'Paid' },
            { key: 'pending', label: 'Pending' },
            { key: 'failed', label: 'Failed' }
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setFilter(key as any)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                filter === key
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Billing Records */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        {filteredRecords.length === 0 ? (
          <div className="px-6 py-8 text-center">
            <Receipt className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No billing records</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              You don't have any billing records yet.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {filteredRecords.map((record) => (
              <div key={record.id} className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        {getStatusIcon(record.status)}
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                          {record.plan_name}
                        </h3>
                        <div className="flex items-center space-x-4 mt-1">
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {formatDate(record.processed_at)}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {getPaymentMethodIcon(record.payment_method)} {record.payment_method}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className="text-lg font-semibold text-gray-900 dark:text-white">
                        {formatCurrency(record.amount, record.currency)}
                      </p>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(record.status)}`}>
                        {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                      </span>
                    </div>

                    <div className="flex space-x-2">
                      {record.invoice_url && (
                        <button
                          onClick={() => downloadInvoice(record.id)}
                          className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Invoice
                        </button>
                      )}
                      {record.receipt_url && (
                        <button
                          onClick={() => window.open(record.receipt_url, '_blank')}
                          className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
                        >
                          <Receipt className="w-4 h-4 mr-2" />
                          Receipt
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Summary Stats */}
      {billingRecords.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <DollarSign className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Paid</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                  {formatCurrency(
                    billingRecords
                      .filter(r => r.status === 'completed')
                      .reduce((sum, r) => sum + r.amount, 0),
                    'USD'
                  )}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Calendar className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Payments</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                  {billingRecords.filter(r => r.status === 'completed').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CheckCircle className="h-8 w-8 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Success Rate</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                  {billingRecords.length > 0 
                    ? Math.round((billingRecords.filter(r => r.status === 'completed').length / billingRecords.length) * 100)
                    : 0}%
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
