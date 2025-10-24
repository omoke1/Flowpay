"use client";

import Link from "next/link";
import { ArrowLeft, Code, Zap, Shield, Globe } from "lucide-react";

export default function APIDocsPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="border-b border-white/10 py-6">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 text-white/60 hover:text-white transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to FlowPay
          </Link>
          <h1 className="text-3xl font-bold text-white">API Documentation</h1>
          <p className="text-white/60 mt-2">Integrate FlowPay into your application</p>
        </div>
      </header>

      {/* Content */}
      <main className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-12">
        {/* API Overview */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-white mb-6">API Overview</h2>
          <div className="bg-white/5 p-6 rounded-lg border border-white/10">
            <p className="text-white/80 mb-4">
              FlowPay provides a RESTful API for creating payment links, processing transactions, 
              and managing your cryptocurrency payments on the Flow blockchain.
            </p>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="flex items-center gap-3">
                <Zap className="w-5 h-5 text-[#97F11D]" />
                <span className="text-white">Real-time Processing</span>
              </div>
              <div className="flex items-center gap-3">
                <Shield className="w-5 h-5 text-[#97F11D]" />
                <span className="text-white">Secure & Encrypted</span>
              </div>
              <div className="flex items-center gap-3">
                <Globe className="w-5 h-5 text-[#97F11D]" />
                <span className="text-white">Global Access</span>
              </div>
            </div>
          </div>
        </section>

        {/* Authentication */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-white mb-6">Authentication</h2>
          <div className="bg-white/5 p-6 rounded-lg border border-white/10">
            <p className="text-white/80 mb-4">
              FlowPay uses API keys for authentication. Include your API key in the Authorization header:
            </p>
            <div className="bg-black/50 p-4 rounded-lg font-mono text-sm">
              <code className="text-[#97F11D]">Authorization: Bearer your_api_key_here</code>
            </div>
            <p className="text-white/80 mt-4">
              Get your API key from the Dashboard → Settings → API Keys
            </p>
          </div>
        </section>

        {/* Endpoints */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-white mb-6">API Endpoints</h2>
          
          {/* Create Payment Link */}
          <div className="bg-white/5 p-6 rounded-lg border border-white/10 mb-6">
            <div className="flex items-center gap-3 mb-4">
              <Code className="w-5 h-5 text-[#97F11D]" />
              <h3 className="text-lg font-semibold text-white">Create Payment Link</h3>
              <span className="bg-green-500/20 text-green-400 px-2 py-1 rounded text-sm">POST</span>
            </div>
            <div className="bg-black/50 p-4 rounded-lg font-mono text-sm mb-4">
              <code className="text-white">POST /api/payment-links</code>
            </div>
            <div className="space-y-4">
              <div>
                <h4 className="text-white font-medium mb-2">Request Body:</h4>
                <div className="bg-black/50 p-4 rounded-lg font-mono text-sm">
                  <pre className="text-white/80">{`{
  "merchantId": "0x...",
  "productName": "Coffee",
  "description": "Premium coffee beans",
  "amount": "10.00",
  "token": "USDC",
  "redirectUrl": "https://yoursite.com/success",
  "acceptCrypto": true,
  "acceptFiat": false
}`}</pre>
                </div>
              </div>
              <div>
                <h4 className="text-white font-medium mb-2">Response:</h4>
                <div className="bg-black/50 p-4 rounded-lg font-mono text-sm">
                  <pre className="text-white/80">{`{
  "success": true,
  "paymentLink": {
    "id": "uuid",
    "url": "https://useflopay.xyz/pay/uuid",
    "merchantId": "0x...",
    "amount": "10.00",
    "token": "USDC",
    "status": "active",
    "createdAt": "2024-01-01T00:00:00Z"
  }
}`}</pre>
                </div>
              </div>
            </div>
          </div>

          {/* Get Payment Links */}
          <div className="bg-white/5 p-6 rounded-lg border border-white/10 mb-6">
            <div className="flex items-center gap-3 mb-4">
              <Code className="w-5 h-5 text-[#97F11D]" />
              <h3 className="text-lg font-semibold text-white">Get Payment Links</h3>
              <span className="bg-blue-500/20 text-blue-400 px-2 py-1 rounded text-sm">GET</span>
            </div>
            <div className="bg-black/50 p-4 rounded-lg font-mono text-sm mb-4">
              <code className="text-white">GET /api/payment-links?merchantId=0x...</code>
            </div>
            <div className="space-y-4">
              <div>
                <h4 className="text-white font-medium mb-2">Response:</h4>
                <div className="bg-black/50 p-4 rounded-lg font-mono text-sm">
                  <pre className="text-white/80">{`{
  "paymentLinks": [
    {
      "id": "uuid",
      "url": "https://useflopay.xyz/pay/uuid",
      "productName": "Coffee",
      "amount": "10.00",
      "token": "USDC",
      "status": "active",
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ]
}`}</pre>
                </div>
              </div>
            </div>
          </div>

          {/* Get Payments */}
          <div className="bg-white/5 p-6 rounded-lg border border-white/10 mb-6">
            <div className="flex items-center gap-3 mb-4">
              <Code className="w-5 h-5 text-[#97F11D]" />
              <h3 className="text-lg font-semibold text-white">Get Payments</h3>
              <span className="bg-blue-500/20 text-blue-400 px-2 py-1 rounded text-sm">GET</span>
            </div>
            <div className="bg-black/50 p-4 rounded-lg font-mono text-sm mb-4">
              <code className="text-white">GET /api/payments?merchantId=0x...</code>
            </div>
            <div className="space-y-4">
              <div>
                <h4 className="text-white font-medium mb-2">Response:</h4>
                <div className="bg-black/50 p-4 rounded-lg font-mono text-sm">
                  <pre className="text-white/80">{`{
  "payments": [
    {
      "id": "uuid",
      "linkId": "uuid",
      "payerAddress": "0x...",
      "amount": "10.00",
      "token": "USDC",
      "txHash": "0x...",
      "status": "completed",
      "paidAt": "2024-01-01T00:00:00Z"
    }
  ]
}`}</pre>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* MoonPay Integration */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-white mb-6">MoonPay Integration</h2>
          <div className="bg-white/5 p-6 rounded-lg border border-white/10">
            <p className="text-white/80 mb-4">
              FlowPay integrates with MoonPay for fiat-to-crypto conversions, allowing users to 
              purchase FLOW and USDC directly with credit cards.
            </p>
            <div className="space-y-4">
              <div>
                <h4 className="text-white font-medium mb-2">MoonPay API Endpoints:</h4>
                <div className="bg-black/50 p-4 rounded-lg font-mono text-sm">
                  <pre className="text-white/80">{`// Create MoonPay transaction
POST /api/transak/create-order
{
  "cryptoCurrency": "FLOW",
  "fiatCurrency": "USD",
  "amount": "100.00",
  "walletAddress": "0x...",
  "redirectUrl": "https://useflopay.xyz/success"
}

// MoonPay webhook handler
POST /api/transak/webhook
{
  "event": "transaction.completed",
  "data": {
    "id": "transaction_id",
    "status": "completed",
    "cryptoAmount": "100.00",
    "cryptoCurrency": "FLOW"
  }
}`}</pre>
                </div>
              </div>
              <div>
                <h4 className="text-white font-medium mb-2">Required Environment Variables:</h4>
                <div className="bg-black/50 p-4 rounded-lg font-mono text-sm">
                  <pre className="text-white/80">{`TRANSAK_API_KEY=your_transak_api_key
TRANSAK_API_SECRET=your_transak_api_secret
NEXT_PUBLIC_TRANSAK_ENV=STAGING
NEXT_PUBLIC_TRANSAK_WIDGET_URL=https://global.transak.com`}</pre>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SDKs and Libraries */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-white mb-6">SDKs and Libraries</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white/5 p-6 rounded-lg border border-white/10">
              <h3 className="text-lg font-semibold text-white mb-3">JavaScript SDK</h3>
              <p className="text-white/80 mb-4">
                Official FlowPay JavaScript SDK for web applications.
              </p>
              <div className="bg-black/50 p-4 rounded-lg font-mono text-sm mb-4">
                <code className="text-white">npm install @flowpay/sdk</code>
              </div>
              <Link 
                href="#js-sdk" 
                className="inline-flex items-center gap-2 text-[#97F11D] hover:text-[#97F11D]/80 transition-colors"
              >
                View Documentation
              </Link>
            </div>

            <div className="bg-white/5 p-6 rounded-lg border border-white/10">
              <h3 className="text-lg font-semibold text-white mb-3">React Components</h3>
              <p className="text-white/80 mb-4">
                Pre-built React components for easy integration.
              </p>
              <div className="bg-black/50 p-4 rounded-lg font-mono text-sm mb-4">
                <code className="text-white">npm install @flowpay/react</code>
              </div>
              <Link 
                href="#react-components" 
                className="inline-flex items-center gap-2 text-[#97F11D] hover:text-[#97F11D]/80 transition-colors"
              >
                View Components
              </Link>
            </div>
          </div>
        </section>

        {/* Rate Limits */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-white mb-6">Rate Limits</h2>
          <div className="bg-white/5 p-6 rounded-lg border border-white/10">
            <p className="text-white/80 mb-4">
              FlowPay API has the following rate limits:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-white/80">
              <li><strong>Free Tier:</strong> 100 requests per minute</li>
              <li><strong>Pro Tier:</strong> 1,000 requests per minute</li>
              <li><strong>Enterprise:</strong> 10,000 requests per minute</li>
            </ul>
            <p className="text-yellow-400 mt-4">
              Rate limit headers are included in all responses: X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset
            </p>
          </div>
        </section>

        {/* Error Handling */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-white mb-6">Error Handling</h2>
          <div className="bg-white/5 p-6 rounded-lg border border-white/10">
            <p className="text-white/80 mb-4">
              FlowPay API uses standard HTTP status codes and returns detailed error messages:
            </p>
            <div className="space-y-4">
              <div>
                <h4 className="text-white font-medium mb-2">Error Response Format:</h4>
                <div className="bg-black/50 p-4 rounded-lg font-mono text-sm">
                  <pre className="text-white/80">{`{
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": "Additional error details",
  "timestamp": "2024-01-01T00:00:00Z"
}`}</pre>
                </div>
              </div>
              <div>
                <h4 className="text-white font-medium mb-2">Common Error Codes:</h4>
                <ul className="list-disc pl-6 space-y-2 text-white/80">
                  <li><strong>400:</strong> Bad Request - Invalid parameters</li>
                  <li><strong>401:</strong> Unauthorized - Invalid API key</li>
                  <li><strong>403:</strong> Forbidden - Insufficient permissions</li>
                  <li><strong>404:</strong> Not Found - Resource not found</li>
                  <li><strong>429:</strong> Too Many Requests - Rate limit exceeded</li>
                  <li><strong>500:</strong> Internal Server Error - Server error</li>
                </ul>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
