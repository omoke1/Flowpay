'use client';

import { useEffect, useState } from 'react';

// Completely isolate this page from Flow FCL
if (typeof window !== 'undefined') {
  // Disable FCL completely
  window.FCL = null;
  
  // Override any FCL-related globals
  (window as any).fcl = null;
  (window as any).flow = null;
  
  // Disable any Flow-related scripts
  const scripts = document.querySelectorAll('script[src*="flow"], script[src*="fcl"]');
  scripts.forEach(script => script.remove());
}

export default function TestCrossmintIsolated() {
  const [mounted, setMounted] = useState(false);
  const [envVars, setEnvVars] = useState<any>(null);

  useEffect(() => {
    setMounted(true);
    
    // Get environment variables after mount
    const vars = {
      NEXT_PUBLIC_CROSSMINT_CLIENT_ID: process.env.NEXT_PUBLIC_CROSSMINT_CLIENT_ID,
      NEXT_PUBLIC_COLLECTION_ID: process.env.NEXT_PUBLIC_COLLECTION_ID,
      NEXT_PUBLIC_CLIENT_API_KEY: process.env.NEXT_PUBLIC_CLIENT_API_KEY,
    };
    setEnvVars(vars);
  }, []);

  if (!mounted) {
    return (
      <div className="container mx-auto p-8 max-w-2xl">
        <h1 className="text-3xl font-bold mb-6">Crossmint Isolated Test</h1>
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-8 max-w-2xl">
      <h1 className="text-3xl font-bold mb-6">Crossmint Isolated Test</h1>
      
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <h2 className="text-lg font-semibold mb-2">Environment Variables:</h2>
        <pre className="text-sm bg-white p-2 rounded border overflow-auto max-h-96">
          {JSON.stringify(envVars, null, 2)}
        </pre>
      </div>

      <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
        <h2 className="text-lg font-semibold mb-2">Status:</h2>
        <ul className="text-sm space-y-1">
          <li>NEXT_PUBLIC_CROSSMINT_CLIENT_ID: {envVars?.NEXT_PUBLIC_CROSSMINT_CLIENT_ID ? '✅ Set' : '❌ Missing'}</li>
          <li>NEXT_PUBLIC_COLLECTION_ID: {envVars?.NEXT_PUBLIC_COLLECTION_ID ? '✅ Set' : '❌ Missing'}</li>
          <li>NEXT_PUBLIC_CLIENT_API_KEY: {envVars?.NEXT_PUBLIC_CLIENT_API_KEY ? '✅ Set' : '❌ Missing'}</li>
        </ul>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h2 className="text-lg font-semibold mb-2">Next Steps:</h2>
        <p className="text-sm">
          If the environment variables are missing, we need to check your .env.local file.
          The collection ID should be: <code>2613b89e-c37b-4a1a-95ea-31270b0dcd4e</code>
        </p>
      </div>
    </div>
  );
}

