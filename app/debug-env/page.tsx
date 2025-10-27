'use client';

import { useEffect, useState } from 'react';

export default function DebugEnv() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="container mx-auto p-8 max-w-2xl">
        <h1 className="text-3xl font-bold mb-6">Environment Variables Debug</h1>
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-8 max-w-2xl">
      <h1 className="text-3xl font-bold mb-6">Environment Variables Debug</h1>
      
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <h2 className="text-lg font-semibold mb-2">All Environment Variables:</h2>
        <pre className="text-sm bg-white p-2 rounded border overflow-auto max-h-96">
          {JSON.stringify(process.env, null, 2)}
        </pre>
      </div>

      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <h2 className="text-lg font-semibold mb-2">Crossmint Variables:</h2>
        <ul className="text-sm space-y-1">
          <li>NEXT_PUBLIC_CROSSMINT_CLIENT_ID: {process.env.NEXT_PUBLIC_CROSSMINT_CLIENT_ID ? '✅ Set' : '❌ Missing'}</li>
          <li>NEXT_PUBLIC_COLLECTION_ID: {process.env.NEXT_PUBLIC_COLLECTION_ID ? '✅ Set' : '❌ Missing'}</li>
          <li>NEXT_PUBLIC_CLIENT_API_KEY: {process.env.NEXT_PUBLIC_CLIENT_API_KEY ? '✅ Set' : '❌ Missing'}</li>
        </ul>
      </div>
    </div>
  );
}
