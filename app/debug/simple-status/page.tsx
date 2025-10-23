"use client";

import { useState, useEffect } from 'react';
import { NetworkSwitcher } from '@/components/debug/network-switcher';

export default function SimpleStatusPage() {
  const [status, setStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkFlowServices();
  }, []);

  const checkFlowServices = async () => {
    setLoading(true);
    
    const services = [
      'https://rest-testnet.onflow.org',
      'https://fcl-discovery.onflow.org/testnet/authn',
      'https://fcl-discovery.onflow.org/authn'
    ];

    const results = await Promise.allSettled(
      services.map(async (url) => {
        try {
          const response = await fetch(url, { 
            method: 'GET',
            mode: 'cors',
            cache: 'no-cache'
          });
          return {
            url,
            status: response.status,
            ok: response.ok
          };
        } catch (error) {
          return {
            url,
            status: 'error',
            ok: false,
            error: error instanceof Error ? error.message : 'Unknown error'
          };
        }
      })
    );

    const serviceStatus = results.map((result, index) => ({
      service: services[index],
      result: result.status === 'fulfilled' ? result.value : { 
        status: 'error', 
        ok: false, 
        error: 'Failed to check' 
      }
    }));

    setStatus(serviceStatus);
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black dark:bg-[#0D0D0D] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-100 dark:text-white">Checking Flow services...</p>
        </div>
      </div>
    );
  }

  const allHealthy = status?.every((s: any) => s.result.ok) || false;
  const healthyCount = status?.filter((s: any) => s.result.ok).length || 0;

  return (
    <div className="min-h-screen bg-black dark:bg-[#0D0D0D] p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-100 dark:text-white mb-8">
          Flow Network Status
        </h1>

        {/* Network Switcher */}
        <div className="mb-6">
          <NetworkSwitcher />
        </div>

        {/* Overall Status */}
        <div className="bg-black/[0.06] dark:bg-white/5 border border-zinc-100/10 dark:border-white/10 rounded-lg p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-100 dark:text-white mb-2">
                Overall Status
              </h2>
              <p className="text-2xl font-bold text-gray-100 dark:text-white">
                {healthyCount} / {status?.length || 0} Services Healthy
              </p>
              <p className="text-sm text-gray-100 dark:text-white/70">
                {allHealthy ? 'All services are responding' : 'Some services are experiencing issues'}
              </p>
            </div>
            <button
              onClick={checkFlowServices}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
            >
              Refresh
            </button>
          </div>
        </div>

        {/* Service Status */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {status?.map((service: any, index: number) => (
            <div key={index} className="bg-black/[0.06] dark:bg-white/5 border border-zinc-100/10 dark:border-white/10 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-mono text-gray-100 dark:text-white">
                  {service.service}
                </span>
                {service.result.ok ? (
                  <span className="text-green-500">✓</span>
                ) : (
                  <span className="text-red-500">✗</span>
                )}
              </div>
              
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-100 dark:text-white/70">Status:</span>
                  <span className={`text-sm px-2 py-1 rounded ${
                    service.result.ok 
                      ? 'bg-green-500/20 text-green-500' 
                      : 'bg-red-500/20 text-red-500'
                  }`}>
                    {service.result.ok ? 'Healthy' : 'Unhealthy'}
                  </span>
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
            </div>
          ))}
        </div>

        {/* Troubleshooting */}
        {!allHealthy && (
          <div className="bg-yellow-900/20 border border-yellow-500/20 rounded-lg p-4 mt-6">
            <h3 className="text-yellow-500 font-semibold mb-2">Troubleshooting</h3>
            <div className="space-y-1 text-sm text-yellow-500">
              <p>• Check your internet connection</p>
              <p>• Verify Flow services are not down</p>
              <p>• Try refreshing the page</p>
              <p>• Check browser console for detailed errors</p>
              <p>• Ensure CORS is not blocking requests</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


