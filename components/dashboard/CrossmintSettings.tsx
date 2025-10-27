'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { CreditCard, Smartphone, Wallet, Apple, Settings, CheckCircle, XCircle } from 'lucide-react';

interface CrossmintSettingsProps {
  paymentLinkId: string;
}

interface PaymentMethodConfig {
  crypto: boolean;
  fiat: boolean;
  apple_pay: boolean;
  google_pay: boolean;
}

export function CrossmintSettings({ paymentLinkId }: CrossmintSettingsProps) {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [methods, setMethods] = useState<PaymentMethodConfig>({
    crypto: true,
    fiat: false,
    apple_pay: false,
    google_pay: false
  });
  const [orders, setOrders] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalOrders: 0,
    completedOrders: 0,
    totalRevenue: 0
  });

  useEffect(() => {
    loadSettings();
    loadOrders();
  }, [paymentLinkId]);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/crossmint/payment-methods?paymentLinkId=${paymentLinkId}`);
      const data = await response.json();

      if (data.success && data.methods.length > 0) {
        const methodConfig: PaymentMethodConfig = {
          crypto: false,
          fiat: false,
          apple_pay: false,
          google_pay: false
        };

        data.methods.forEach((method: any) => {
          if (method.enabled) {
            methodConfig[method.method_type as keyof PaymentMethodConfig] = true;
          }
        });

        setMethods(methodConfig);
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadOrders = async () => {
    try {
      const response = await fetch(`/api/crossmint/checkout?paymentLinkId=${paymentLinkId}`);
      const data = await response.json();

      if (data.success) {
        setOrders(data.orders || []);
        
        // Calculate stats
        const completed = data.orders.filter((order: any) => order.status === 'completed');
        const totalRevenue = completed.reduce((sum: number, order: any) => sum + (order.fiat_amount || 0), 0);
        
        setStats({
          totalOrders: data.orders.length,
          completedOrders: completed.length,
          totalRevenue
        });
      }
    } catch (error) {
      console.error('Failed to load orders:', error);
    }
  };

  const handleMethodToggle = (method: keyof PaymentMethodConfig) => {
    setMethods(prev => ({
      ...prev,
      [method]: !prev[method]
    }));
  };

  const handleSaveSettings = async () => {
    try {
      setSaving(true);
      const response = await fetch('/api/crossmint/payment-methods', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          paymentLinkId,
          methods
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save settings');
      }

      // Reload settings
      await loadSettings();
      
    } catch (error) {
      console.error('Failed to save settings:', error);
    } finally {
      setSaving(false);
    }
  };

  const getMethodIcon = (method: keyof PaymentMethodConfig) => {
    switch (method) {
      case 'crypto':
        return <Wallet className="h-4 w-4 text-purple-600" />;
      case 'fiat':
        return <CreditCard className="h-4 w-4 text-blue-600" />;
      case 'apple_pay':
        return <Apple className="h-4 w-4 text-gray-600" />;
      case 'google_pay':
        return <Smartphone className="h-4 w-4 text-green-600" />;
      default:
        return <Settings className="h-4 w-4 text-gray-600" />;
    }
  };

  const getMethodTitle = (method: keyof PaymentMethodConfig) => {
    switch (method) {
      case 'crypto':
        return 'Crypto Wallet';
      case 'fiat':
        return 'Credit Card';
      case 'apple_pay':
        return 'Apple Pay';
      case 'google_pay':
        return 'Google Pay';
      default:
        return 'Payment Method';
    }
  };

  const getMethodDescription = (method: keyof PaymentMethodConfig) => {
    switch (method) {
      case 'crypto':
        return 'Accept FLOW and USDC payments';
      case 'fiat':
        return 'Credit card, Apple Pay, Google Pay, and 40+ cryptocurrencies';
      case 'apple_pay':
        return 'Apple Pay mobile payments';
      case 'google_pay':
        return 'Google Pay mobile payments';
      default:
        return 'Payment method description';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#97F11D]"></div>
            <span className="ml-2">Loading settings...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Orders</p>
                <p className="text-2xl font-bold">{stats.totalOrders}</p>
              </div>
              <div className="h-8 w-8 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                <CreditCard className="h-4 w-4 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold text-green-600">{stats.completedOrders}</p>
              </div>
              <div className="h-8 w-8 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
                <CheckCircle className="h-4 w-4 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Revenue</p>
                <p className="text-2xl font-bold text-[#97F11D]">${stats.totalRevenue.toFixed(2)}</p>
              </div>
              <div className="h-8 w-8 bg-[#97F11D]/20 rounded-full flex items-center justify-center">
                <span className="text-[#97F11D] font-bold">$</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payment Methods Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Settings className="h-5 w-5" />
            <span>Payment Methods</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {Object.entries(methods).map(([method, enabled]) => (
            <div key={method} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center space-x-3">
                {getMethodIcon(method as keyof PaymentMethodConfig)}
                <div>
                  <div className="font-medium">{getMethodTitle(method as keyof PaymentMethodConfig)}</div>
                  <div className="text-sm text-muted-foreground">
                    {getMethodDescription(method as keyof PaymentMethodConfig)}
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  checked={enabled}
                  onCheckedChange={() => handleMethodToggle(method as keyof PaymentMethodConfig)}
                />
                <Badge variant={enabled ? "default" : "secondary"}>
                  {enabled ? "Enabled" : "Disabled"}
                </Badge>
              </div>
            </div>
          ))}

          <div className="pt-4 border-t">
            <Button
              onClick={handleSaveSettings}
              disabled={saving}
              className="w-full"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Saving Settings...
                </>
              ) : (
                'Save Settings'
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent Orders */}
      {orders.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Crossmint Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {orders.slice(0, 5).map((order) => (
                <div key={order.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={`h-2 w-2 rounded-full ${
                      order.status === 'completed' ? 'bg-green-500' :
                      order.status === 'failed' ? 'bg-red-500' :
                      'bg-yellow-500'
                    }`}></div>
                    <div>
                      <div className="font-medium">Order #{order.crossmint_order_id.slice(-8)}</div>
                      <div className="text-sm text-muted-foreground">
                        {order.fiat_amount} {order.currency}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant={
                      order.status === 'completed' ? 'default' :
                      order.status === 'failed' ? 'destructive' :
                      'secondary'
                    }>
                      {order.status}
                    </Badge>
                    <div className="text-xs text-muted-foreground mt-1">
                      {new Date(order.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

