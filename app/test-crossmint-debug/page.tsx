'use client';

import { useEffect, useState } from 'react';

export default function TestCrossmintDebug() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="container mx-auto p-8 max-w-2xl">
        <h1 className="text-3xl font-bold mb-6">Crossmint Debug</h1>
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  const testDirectUrl = () => {
    // Test the exact URL that was generated in the logs
    const testUrl = 'https://checkout.crossmint.com?clientId=ck_staging_6BNX28xR4Z4XJZhA1eHTNmGXGsFv73Gvue9GwCbbtRQyRbqQADBjdYforXVsaTCJUZzh8znGoqXSmqjk23FMHbtNU4xut3NpQfRmq9L2ebC88K6B7ufJCZ37ZfoBihsLhzHQFZXWUGzVSaT3bS7RWMxkMyvRZg3xapToRo5SsadWyGKjJ5wJH3cAJDKUY3tpfmnZtwW7iV4WTLzdsNdYuW2Q&projectId=9942ebd1-4471-4cb3-8fbf-fc03a8d8ef73&amount=1&currency=USD&successUrl=https%3A%2F%2Fuseflopay.xyz%2Fcheckout%2Fsuccess%3ForderId%3Dtest123&cancelUrl=https%3A%2F%2Fuseflopay.xyz%2Fcheckout%2Fcancel%3ForderId%3Dtest123&reference=test123&paymentMethod=fiat&blockchain=flow';
    
    console.log('Testing direct URL:', testUrl);
    window.open(testUrl, '_blank', 'noopener,noreferrer');
  };

  const testApiCall = async () => {
    try {
      const response = await fetch('/api/crossmint/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          paymentLinkId: 'ba07087e-ac79-4bc7-890e-d455a44ba1e8',
          amount: 1,
          currency: 'USD'
        })
      });

      const data = await response.json();
      console.log('API Response:', data);
      
      if (data.success && data.checkoutUrl) {
        window.open(data.checkoutUrl, '_blank', 'noopener,noreferrer');
      }
    } catch (error) {
      console.error('API Error:', error);
    }
  };

  return (
    <div className="container mx-auto p-8 max-w-2xl">
      <h1 className="text-3xl font-bold mb-6">Crossmint Debug</h1>
      
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <h2 className="text-lg font-semibold mb-2">Debug Tests:</h2>
        <div className="space-y-4">
          <div>
            <button 
              onClick={testDirectUrl}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 mr-2"
            >
              Test Direct URL (from logs)
            </button>
            <span className="text-sm text-gray-600">Test the exact URL from logs</span>
          </div>
          
          <div>
            <button 
              onClick={testApiCall}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 mr-2"
            >
              Test API Call
            </button>
            <span className="text-sm text-gray-600">Test server-side API call</span>
          </div>
        </div>
      </div>

      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <h2 className="text-lg font-semibold mb-2 text-red-800">If Both Tests Show Blank Page:</h2>
        <ul className="text-sm space-y-1 text-red-700">
          <li>• Your client-side API key is missing the <code>orders.create</code> scope</li>
          <li>• Go to Crossmint Staging Console → API Keys</li>
          <li>• Delete the current client-side key</li>
          <li>• Create a NEW client-side key with <code>orders.create</code> scope</li>
          <li>• Update your .env.local with the new key</li>
          <li>• Restart your development server</li>
        </ul>
      </div>
    </div>
  );
}

