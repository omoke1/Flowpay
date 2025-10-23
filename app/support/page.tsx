"use client";

import Link from "next/link";
import { ArrowLeft, Mail, MessageCircle, BookOpen, HelpCircle } from "lucide-react";

export default function SupportPage() {
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
          <h1 className="text-3xl font-bold text-white">Support Center</h1>
          <p className="text-white/60 mt-2">Get help with FlowPay cryptocurrency payments</p>
        </div>
      </header>

      {/* Content */}
      <main className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-12">
        {/* Quick Help Cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          <div className="bg-white/5 p-6 rounded-lg border border-white/10">
            <div className="flex items-center gap-3 mb-4">
              <BookOpen className="w-6 h-6 text-[#97F11D]" />
              <h3 className="text-xl font-semibold text-white">Documentation</h3>
            </div>
            <p className="text-white/80 mb-4">
              Learn how to use FlowPay with our comprehensive guides and tutorials.
            </p>
            <Link 
              href="#documentation" 
              className="inline-flex items-center gap-2 text-[#97F11D] hover:text-[#97F11D]/80 transition-colors"
            >
              View Documentation
            </Link>
          </div>

          <div className="bg-white/5 p-6 rounded-lg border border-white/10">
            <div className="flex items-center gap-3 mb-4">
              <MessageCircle className="w-6 h-6 text-[#97F11D]" />
              <h3 className="text-xl font-semibold text-white">Live Chat</h3>
            </div>
            <p className="text-white/80 mb-4">
              Get instant help from our support team via live chat.
            </p>
            <button className="inline-flex items-center gap-2 text-[#97F11D] hover:text-[#97F11D]/80 transition-colors">
              Start Chat
            </button>
          </div>
        </div>

        {/* FAQ Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-white mb-8">Frequently Asked Questions</h2>
          
          <div className="space-y-6">
            <div className="bg-white/5 p-6 rounded-lg border border-white/10">
              <h3 className="text-lg font-semibold text-white mb-3">How do I connect my Flow wallet?</h3>
              <p className="text-white/80">
                Click the "Connect Wallet" button on the homepage and select your preferred Flow wallet 
                (Blocto, Ledger, etc.). Follow the prompts to authorize the connection.
              </p>
            </div>

            <div className="bg-white/5 p-6 rounded-lg border border-white/10">
              <h3 className="text-lg font-semibold text-white mb-3">What cryptocurrencies does FlowPay support?</h3>
              <p className="text-white/80">
                FlowPay currently supports FLOW (native token) and USDC.e (bridged USDC) on the Flow blockchain. 
                We're working on adding more tokens in the future.
              </p>
            </div>

            <div className="bg-white/5 p-6 rounded-lg border border-white/10">
              <h3 className="text-lg font-semibold text-white mb-3">How do I create a payment link?</h3>
              <p className="text-white/80">
                After connecting your wallet, go to the Dashboard and click "Create Payment Link". 
                Fill in the product details, amount, and token type. Your payment link will be generated instantly.
              </p>
            </div>

            <div className="bg-white/5 p-6 rounded-lg border border-white/10">
              <h3 className="text-lg font-semibold text-white mb-3">Are there any fees?</h3>
              <p className="text-white/80">
                FlowPay charges minimal platform fees plus blockchain network fees. All fees are 
                clearly displayed before transaction confirmation. No hidden fees.
              </p>
            </div>

            <div className="bg-white/5 p-6 rounded-lg border border-white/10">
              <h3 className="text-lg font-semibold text-white mb-3">Is FlowPay secure?</h3>
              <p className="text-white/80">
                Yes, FlowPay is built on the Flow blockchain with enterprise-grade security. 
                We never store your private keys, and all transactions are secured by blockchain cryptography.
              </p>
            </div>

            <div className="bg-white/5 p-6 rounded-lg border border-white/10">
              <h3 className="text-lg font-semibold text-white mb-3">What if a transaction fails?</h3>
              <p className="text-white/80">
                Failed transactions are automatically detected and funds are returned to your wallet. 
                Contact support if you experience any issues with transaction processing.
              </p>
            </div>

            <div className="bg-white/5 p-6 rounded-lg border border-white/10">
              <h3 className="text-lg font-semibold text-white mb-3">How do I track my payments?</h3>
              <p className="text-white/80">
                All payments are tracked in your Dashboard with real-time status updates. 
                You can also view transaction details on Flowscan using the transaction hash.
              </p>
            </div>

            <div className="bg-white/5 p-6 rounded-lg border border-white/10">
              <h3 className="text-lg font-semibold text-white mb-3">Can I use FlowPay for international payments?</h3>
              <p className="text-white/80">
                Yes, FlowPay supports global payments through the Flow blockchain. 
                Cryptocurrency transactions are borderless and can be sent anywhere in the world.
              </p>
            </div>
          </div>
        </section>

        {/* Contact Methods */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-white mb-8">Contact Support</h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white/5 p-6 rounded-lg border border-white/10 text-center">
              <Mail className="w-8 h-8 text-[#97F11D] mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">Email Support</h3>
              <p className="text-white/80 mb-4">
                Get detailed help via email. We respond within 24 hours.
              </p>
              <a 
                href="mailto:support@useflowpay.xyz" 
                className="inline-flex items-center gap-2 text-[#97F11D] hover:text-[#97F11D]/80 transition-colors"
              >
                support@useflowpay.xyz
              </a>
            </div>

            <div className="bg-white/5 p-6 rounded-lg border border-white/10 text-center">
              <MessageCircle className="w-8 h-8 text-[#97F11D] mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">Live Chat</h3>
              <p className="text-white/80 mb-4">
                Chat with our support team in real-time. Available 24/7.
              </p>
              <button className="inline-flex items-center gap-2 text-[#97F11D] hover:text-[#97F11D]/80 transition-colors">
                Start Chat
              </button>
            </div>

            <div className="bg-white/5 p-6 rounded-lg border border-white/10 text-center">
              <HelpCircle className="w-8 h-8 text-[#97F11D] mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">Community</h3>
              <p className="text-white/80 mb-4">
                Join our community for tips, updates, and peer support.
              </p>
              <a 
                href="https://discord.gg/flowpay" 
                className="inline-flex items-center gap-2 text-[#97F11D] hover:text-[#97F11D]/80 transition-colors"
              >
                Join Discord
              </a>
            </div>
          </div>
        </section>

        {/* Documentation Section */}
        <section id="documentation">
          <h2 className="text-2xl font-semibold text-white mb-8">Documentation</h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white/5 p-6 rounded-lg border border-white/10">
              <h3 className="text-lg font-semibold text-white mb-3">Getting Started</h3>
              <p className="text-white/80 mb-4">
                Learn the basics of FlowPay and how to create your first payment link.
              </p>
              <Link 
                href="#getting-started" 
                className="inline-flex items-center gap-2 text-[#97F11D] hover:text-[#97F11D]/80 transition-colors"
              >
                Read Guide
              </Link>
            </div>

            <div className="bg-white/5 p-6 rounded-lg border border-white/10">
              <h3 className="text-lg font-semibold text-white mb-3">API Documentation</h3>
              <p className="text-white/80 mb-4">
                Integrate FlowPay into your application with our comprehensive API.
              </p>
              <Link 
                href="#api-docs" 
                className="inline-flex items-center gap-2 text-[#97F11D] hover:text-[#97F11D]/80 transition-colors"
              >
                View API Docs
              </Link>
            </div>

            <div className="bg-white/5 p-6 rounded-lg border border-white/10">
              <h3 className="text-lg font-semibold text-white mb-3">Security Guide</h3>
              <p className="text-white/80 mb-4">
                Best practices for securing your FlowPay account and transactions.
              </p>
              <Link 
                href="#security" 
                className="inline-flex items-center gap-2 text-[#97F11D] hover:text-[#97F11D]/80 transition-colors"
              >
                Security Tips
              </Link>
            </div>

            <div className="bg-white/5 p-6 rounded-lg border border-white/10">
              <h3 className="text-lg font-semibold text-white mb-3">Troubleshooting</h3>
              <p className="text-white/80 mb-4">
                Common issues and their solutions for FlowPay users.
              </p>
              <Link 
                href="#troubleshooting" 
                className="inline-flex items-center gap-2 text-[#97F11D] hover:text-[#97F11D]/80 transition-colors"
              >
                Troubleshooting Guide
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
