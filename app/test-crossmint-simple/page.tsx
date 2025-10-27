'use client';

import { useEffect, useState } from 'react';
import { CrossmintProvider, CrossmintHostedCheckout } from '@crossmint/client-sdk-react-ui';

// Disable Flow FCL to prevent CORS issues with Crossmint
if (typeof window !== 'undefined') {
  // @ts-ignore
  window.FCL = null;
}

export default function TestCrossmintSimple() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="container mx-auto p-8 max-w-2xl">
        <h1 className="text-3xl font-bold mb-6">Crossmint Test</h1>
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  const clientApiKey = process.env.NEXT_PUBLIC_CROSSMINT_CLIENT_ID;
  const collectionId = process.env.NEXT_PUBLIC_COLLECTION_ID;

  // Check if environment variables are properly set
  if (!clientApiKey || !collectionId) {
    return (
      <div className="container mx-auto p-8 max-w-2xl">
        <h1 className="text-3xl font-bold mb-6">Crossmint Test</h1>
        
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h2 className="text-lg font-semibold mb-2 text-red-800">Configuration Error:</h2>
          <ul className="text-sm space-y-1 text-red-700">
            <li>Client API Key: {clientApiKey ? '✅ Set' : '❌ Missing'}</li>
            <li>Collection ID: {collectionId ? '✅ Set' : '❌ Missing'}</li>
          </ul>
          <p className="text-sm mt-2 text-red-600">
            Please check your .env.local file and restart the development server.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-8 max-w-2xl">
      <h1 className="text-3xl font-bold mb-6">Crossmint Test</h1>
      
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <h2 className="text-lg font-semibold mb-2">Configuration:</h2>
        <ul className="text-sm space-y-1">
          <li>Client API Key: ✅ Set</li>
          <li>Collection ID: ✅ Set</li>
        </ul>
      </div>

      <CrossmintProvider apiKey={clientApiKey}>
        <CrossmintHostedCheckout
          lineItems={{
            collectionLocator: `crossmint:${collectionId}`,
            callData: {
              totalPrice: "0.50", // Staging minimum
              quantity: 1,
            },
          }}
          payment={{
            crypto: { enabled: true },
            fiat: { enabled: true },
          }}
        />
      </CrossmintProvider>
    </div>
  );
}
