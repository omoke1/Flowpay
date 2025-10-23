"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function TermsOfServicePage() {
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
          <h1 className="text-3xl font-bold text-white">Terms of Service</h1>
          <p className="text-white/60 mt-2">Last updated: {new Date().toLocaleDateString()}</p>
        </div>
      </header>

      {/* Content */}
      <main className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="prose prose-invert max-w-none">
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-white mb-4">1. Acceptance of Terms</h2>
            <div className="text-white/80 space-y-4">
              <p>
                By accessing or using FlowPay ("Service"), you agree to be bound by these Terms of Service 
                ("Terms"). If you disagree with any part of these terms, you may not access the Service.
              </p>
              <p>
                FlowPay is a cryptocurrency payment platform built on the Flow blockchain that enables 
                businesses to accept digital payments and create payment links.
              </p>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-white mb-4">2. Service Description</h2>
            <div className="text-white/80 space-y-4">
              <p>FlowPay provides:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Cryptocurrency payment processing on the Flow blockchain</li>
                <li>Payment link creation and management</li>
                <li>Transaction tracking and analytics</li>
                <li>Integration with Flow ecosystem tokens (FLOW, USDC.e)</li>
                <li>Business dashboard and reporting tools</li>
              </ul>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-white mb-4">3. Eligibility and Account Requirements</h2>
            <div className="text-white/80 space-y-4">
              <p>To use FlowPay, you must:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Be at least 18 years old</li>
                <li>Have a valid Flow blockchain wallet</li>
                <li>Comply with all applicable laws and regulations</li>
                <li>Not be located in a jurisdiction where cryptocurrency services are prohibited</li>
                <li>Provide accurate and complete information</li>
              </ul>
              <p className="text-yellow-400">
                <strong>Important:</strong> You are responsible for maintaining the security of your wallet and private keys.
              </p>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-white mb-4">4. Cryptocurrency and Blockchain Risks</h2>
            <div className="text-white/80 space-y-4">
              <p className="text-red-400 font-semibold">
                <strong>WARNING:</strong> Cryptocurrency transactions involve significant risks:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Volatility:</strong> Cryptocurrency values can fluctuate dramatically</li>
                <li><strong>Irreversibility:</strong> Blockchain transactions cannot be reversed</li>
                <li><strong>Technical Risks:</strong> Smart contract bugs, network congestion, or protocol changes</li>
                <li><strong>Regulatory Risks:</strong> Changing laws and regulations</li>
                <li><strong>Loss of Funds:</strong> Lost private keys result in permanent loss of funds</li>
                <li><strong>No Insurance:</strong> Cryptocurrency transactions are not insured by government agencies</li>
              </ul>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-white mb-4">5. Prohibited Uses</h2>
            <div className="text-white/80 space-y-4">
              <p>You may not use FlowPay for:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Illegal activities or money laundering</li>
                <li>Fraudulent transactions or scams</li>
                <li>Sanctions violations or terrorist financing</li>
                <li>Adult content or illegal goods/services</li>
                <li>Market manipulation or price fixing</li>
                <li>Any activity that violates applicable laws</li>
              </ul>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-white mb-4">6. Fees and Payments</h2>
            <div className="text-white/80 space-y-4">
              <p>FlowPay charges fees for:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Transaction Fees:</strong> Network fees for blockchain transactions</li>
                <li><strong>Platform Fees:</strong> Service fees for payment processing</li>
                <li><strong>Processing Fees:</strong> Fees for payment link creation and management</li>
              </ul>
              <p>
                All fees are clearly displayed before transaction confirmation. Fees are non-refundable 
                and may change with notice.
              </p>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-white mb-4">7. Intellectual Property</h2>
            <div className="text-white/80 space-y-4">
              <p>
                FlowPay and its original content, features, and functionality are owned by FlowPay 
                and are protected by international copyright, trademark, patent, trade secret, and 
                other intellectual property laws.
              </p>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-white mb-4">8. Disclaimers and Limitations</h2>
            <div className="text-white/80 space-y-4">
              <p className="text-yellow-400">
                <strong>DISCLAIMER:</strong> FlowPay is provided "as is" without warranties of any kind.
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>We do not guarantee uninterrupted or error-free service</li>
                <li>We are not responsible for blockchain network issues</li>
                <li>We do not provide investment or financial advice</li>
                <li>We are not liable for losses due to market volatility</li>
                <li>We do not guarantee the security of your wallet or private keys</li>
              </ul>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-white mb-4">9. Limitation of Liability</h2>
            <div className="text-white/80 space-y-4">
              <p>
                To the maximum extent permitted by law, FlowPay shall not be liable for any indirect, 
                incidental, special, consequential, or punitive damages, including but not limited to 
                loss of profits, data, or other intangible losses.
              </p>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-white mb-4">10. Compliance and Regulations</h2>
            <div className="text-white/80 space-y-4">
              <p>
                Users are responsible for compliance with all applicable laws and regulations in their 
                jurisdiction, including:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Tax reporting and payment obligations</li>
                <li>Anti-money laundering (AML) requirements</li>
                <li>Know Your Customer (KYC) regulations</li>
                <li>Securities and financial services laws</li>
              </ul>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-white mb-4">11. Termination</h2>
            <div className="text-white/80 space-y-4">
              <p>
                We may terminate or suspend your access to FlowPay immediately, without prior notice, 
                for any reason, including breach of these Terms.
              </p>
              <p>
                Upon termination, your right to use the Service will cease immediately. However, 
                blockchain transactions cannot be reversed or deleted.
              </p>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-white mb-4">12. Governing Law</h2>
            <div className="text-white/80 space-y-4">
              <p>
                These Terms shall be governed by and construed in accordance with the laws of 
                [Jurisdiction], without regard to conflict of law principles.
              </p>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-white mb-4">13. Changes to Terms</h2>
            <div className="text-white/80 space-y-4">
              <p>
                We reserve the right to modify these Terms at any time. We will notify users of 
                material changes by posting the new Terms on our website and updating the 
                "Last updated" date.
              </p>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-white mb-4">14. Contact Information</h2>
            <div className="text-white/80 space-y-4">
              <p>
                If you have any questions about these Terms, please contact us at:
              </p>
              <div className="bg-white/5 p-4 rounded-lg">
                <p><strong>Email:</strong> legal@useflowpay.xyz</p>
                <p><strong>Website:</strong> https://useflowpay.xyz</p>
                <p><strong>Support:</strong> https://useflowpay.xyz/support</p>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
