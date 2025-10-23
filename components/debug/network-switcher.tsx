"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  RefreshCw,
  Network
} from 'lucide-react';

export function NetworkSwitcher() {
  const [currentNetwork, setCurrentNetwork] = useState<string>('');
  const [networkStatus, setNetworkStatus] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Get current network from environment
    setCurrentNetwork(process.env.NEXT_PUBLIC_FLOW_NETWORK || 'mainnet');
  }, []);

  const checkNetworkStatus = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/debug/flow-status');
      const data = await response.json();
      setNetworkStatus(data);
    } catch (error) {
      console.error('Failed to check network status:', error);
    } finally {
      setLoading(false);
    }
  };

  const switchToMainnet = () => {
    // This would require a page refresh to take effect
    window.location.href = window.location.href + '?network=mainnet';
  };

  const switchToTestnet = () => {
    // This would require a page refresh to take effect
    window.location.href = window.location.href + '?network=testnet';
  };

  return (
    <Card className="w-full max-w-2xl bg-black dark:bg-[#0D0D0D] border border-zinc-100/10 dark:border-white/10">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2 text-gray-100 dark:text-white">
          <Network className="w-5 h-5" />
          <span>Flow Network Status</span>
        </CardTitle>
        <CardDescription className="text-gray-100 dark:text-white/70">
          Check Flow service health and switch networks
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-100 dark:text-white">
              Current Network: <Badge variant="outline" className="ml-2">{currentNetwork}</Badge>
            </p>
          </div>
          <Button
            onClick={checkNetworkStatus}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {loading ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4" />
            )}
            Check Status
          </Button>
        </div>

        {networkStatus && (
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-100 dark:text-white">Overall Status:</span>
              {networkStatus.allHealthy ? (
                <Badge className="bg-green-600 text-white">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  All Healthy
                </Badge>
              ) : (
                <Badge className="bg-red-600 text-white">
                  <XCircle className="w-3 h-3 mr-1" />
                  Issues Detected
                </Badge>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {networkStatus.services?.map((service: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-3 bg-black/[0.06] dark:bg-white/5 rounded-lg">
                  <div className="flex items-center space-x-2">
                    {service.result.ok ? (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-500" />
                    )}
                    <span className="text-sm text-gray-100 dark:text-white">
                      {service.service.includes('mainnet') ? 'Mainnet' : 
                       service.service.includes('testnet') ? 'Testnet' : 'Service'}
                    </span>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {service.result.ok ? 'OK' : 'FAIL'}
                  </Badge>
                </div>
              ))}
            </div>

            {networkStatus.recommendations && networkStatus.recommendations.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-gray-100 dark:text-white">Recommendations:</h4>
                {networkStatus.recommendations.map((rec: string, index: number) => (
                  <div key={index} className="flex items-start space-x-2 text-sm">
                    <AlertCircle className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-100 dark:text-white/70">{rec}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="flex space-x-2 pt-4 border-t border-zinc-100/10 dark:border-white/10">
          <Button
            onClick={switchToMainnet}
            variant="outline"
            className="flex-1 border-zinc-100/10 dark:border-white/20 text-gray-100 dark:text-white hover:bg-black/[0.06] dark:hover:bg-white/10"
          >
            Switch to Mainnet
          </Button>
          <Button
            onClick={switchToTestnet}
            variant="outline"
            className="flex-1 border-zinc-100/10 dark:border-white/20 text-gray-100 dark:text-white hover:bg-black/[0.06] dark:hover:bg-white/10"
          >
            Switch to Testnet
          </Button>
        </div>

        <div className="text-xs text-gray-100 dark:text-white/70 bg-black/[0.06] dark:bg-white/5 p-3 rounded-lg">
          <p><strong>Note:</strong> Testnet is often unstable and may be down. Mainnet is more reliable for production use.</p>
          <p className="mt-1">Network switching requires a page refresh to take effect.</p>
        </div>
      </CardContent>
    </Card>
  );
}
