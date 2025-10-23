"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  RefreshCw,
  Wifi,
  WifiOff
} from 'lucide-react';

interface ServiceStatus {
  service: string;
  result: {
    status: number | string;
    ok: boolean;
    error?: string;
  };
}

export default function FlowStatusPage() {
  const [services, setServices] = useState<ServiceStatus[]>([]);
  const [loading, setLoading] = useState(false);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);

  const checkServices = async () => {
    setLoading(true);
    
    const flowServices = [
      'https://rest-testnet.onflow.org',
      'https://fcl-discovery.onflow.org/testnet/authn',
      'https://fcl-discovery.onflow.org/authn',
      'https://rest-mainnet.onflow.org'
    ];

    const results = await Promise.allSettled(
      flowServices.map(async (url) => {
        try {
          const response = await fetch(url, { 
            method: 'GET',
            mode: 'cors',
            cache: 'no-cache'
          });
          return {
            service: url,
            result: {
              status: response.status,
              ok: response.ok
            }
          };
        } catch (error) {
          return {
            service: url,
            result: {
              status: 'error',
              ok: false,
              error: error instanceof Error ? error.message : 'Unknown error'
            }
          };
        }
      })
    );

    const serviceStatus = results.map((result, index) => ({
      service: flowServices[index],
      result: result.status === 'fulfilled' ? result.value.result : { 
        status: 'error', 
        ok: false, 
        error: 'Failed to check' 
      }
    }));

    setServices(serviceStatus);
    setLastChecked(new Date());
    setLoading(false);
  };

  useEffect(() => {
    checkServices();
  }, []);

  const getStatusIcon = (ok: boolean) => {
    if (ok) {
      return <CheckCircle className="w-5 h-5 text-green-500" />;
    } else {
      return <XCircle className="w-5 h-5 text-red-500" />;
    }
  };

  const getStatusBadge = (ok: boolean) => {
    if (ok) {
      return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-500 border border-green-500/20">Healthy</span>;
    } else {
      return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-500/20 text-red-500 border border-red-500/20">Unhealthy</span>;
    }
  };

  const allHealthy = services.every(s => s.result.ok);
  const healthyCount = services.filter(s => s.result.ok).length;

  return (
    <div className="min-h-screen bg-black dark:bg-[#0D0D0D] p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-100 dark:text-white mb-2">
            Flow Network Status
          </h1>
          <p className="text-gray-100 dark:text-white/70">
            Check the health of Flow blockchain services
          </p>
        </div>

        {/* Overall Status */}
        <Card className="bg-black/[0.06] dark:bg-white/5 border-zinc-100/10 dark:border-white/10 mb-6">
          <CardHeader>
            <CardTitle className="text-gray-100 dark:text-white flex items-center space-x-2">
              {allHealthy ? (
                <Wifi className="w-6 h-6 text-green-500" />
              ) : (
                <WifiOff className="w-6 h-6 text-red-500" />
              )}
              <span>Overall Status</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-gray-100 dark:text-white">
                  {healthyCount} / {services.length} Services Healthy
                </p>
                <p className="text-sm text-gray-100 dark:text-white/70">
                  {allHealthy ? 'All services are responding' : 'Some services are experiencing issues'}
                </p>
              </div>
              <Button
                onClick={checkServices}
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {loading ? (
                  <RefreshCw className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <RefreshCw className="w-4 h-4 mr-2" />
                )}
                Refresh
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Service Status */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {services.map((service, index) => (
            <Card key={index} className="bg-black/[0.06] dark:bg-white/5 border-zinc-100/10 dark:border-white/10">
              <CardHeader>
                <CardTitle className="text-gray-100 dark:text-white flex items-center justify-between">
                  <span className="text-sm font-mono">{service.service}</span>
                  {getStatusIcon(service.result.ok)}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-100 dark:text-white/70">Status:</span>
                    {getStatusBadge(service.result.ok)}
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-100 dark:text-white/70">Response:</span>
                    <span className="text-sm font-mono text-gray-100 dark:text-white">
                      {service.result.status}
                    </span>
                  </div>
                  
                  {service.result.error && (
                    <div className="mt-2 p-2 bg-red-900/20 border border-red-500/20 rounded text-xs text-red-500">
                      {service.result.error}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Last Checked */}
        {lastChecked && (
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-100 dark:text-white/70">
              Last checked: {lastChecked.toLocaleString()}
            </p>
          </div>
        )}

        {/* Troubleshooting */}
        {!allHealthy && (
          <Card className="bg-yellow-900/20 border-yellow-500/20 mt-6">
            <CardHeader>
              <CardTitle className="text-yellow-500 flex items-center space-x-2">
                <AlertCircle className="w-5 h-5" />
                <span>Troubleshooting</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm text-yellow-500">
                <p>• Check your internet connection</p>
                <p>• Verify Flow services are not down</p>
                <p>• Try refreshing the page</p>
                <p>• Check browser console for detailed errors</p>
                <p>• Ensure CORS is not blocking requests</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
