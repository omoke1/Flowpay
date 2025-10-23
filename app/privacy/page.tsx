"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function PrivacyPolicyPage() {
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
          <h1 className="text-3xl font-bold text-white">Privacy Policy</h1>
          <p className="text-white/60 mt-2">Last updated: {new Date().toLocaleDateString()}</p>
        </div>
      </header>

      {/* Content */}
      <main className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="prose prose-invert max-w-none">
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-white mb-4">1. Information We Collect</h2>
            <div className="text-white/80 space-y-4">
              <p>
                FlowPay collects information necessary to provide our cryptocurrency payment services:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Wallet Information:</strong> Flow blockchain addresses and transaction data</li>
                <li><strong>Payment Data:</strong> Transaction amounts, tokens, and payment links</li>
                <li><strong>Account Information:</strong> Email addresses and display names (optional)</li>
                <li><strong>Technical Data:</strong> IP addresses, browser information, and usage analytics</li>
                <li><strong>Blockchain Data:</strong> Public transaction records on the Flow blockchain</li>
              </ul>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-white mb-4">2. How We Use Your Information</h2>
            <div className="text-white/80 space-y-4">
              <p>We use your information to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Process cryptocurrency payments and transactions</li>
                <li>Maintain and improve our payment infrastructure</li>
                <li>Provide customer support and technical assistance</li>
                <li>Ensure compliance with applicable laws and regulations</li>
                <li>Prevent fraud and enhance security</li>
                <li>Analyze usage patterns to improve our services</li>
              </ul>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-white mb-4">3. Blockchain and Decentralization</h2>
            <div className="text-white/80 space-y-4">
              <p>
                FlowPay operates on the Flow blockchain, which means:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Transaction data is publicly visible on the blockchain</li>
                <li>We cannot modify or delete blockchain transactions</li>
                <li>Your wallet addresses and transaction history are immutable</li>
                <li>We do not control your private keys or wallet access</li>
              </ul>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-white mb-4">4. Data Sharing and Third Parties</h2>
            <div className="text-white/80 space-y-4">
              <p>We may share your information with:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Service Providers:</strong> Cloud infrastructure, analytics, and security services</li>
                <li><strong>Legal Requirements:</strong> When required by law or to protect our rights</li>
                <li><strong>Business Transfers:</strong> In case of merger, acquisition, or asset sale</li>
                <li><strong>Consent:</strong> When you explicitly consent to sharing</li>
              </ul>
              <p className="text-yellow-400">
                <strong>Note:</strong> We do not sell your personal information to third parties.
              </p>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-white mb-4">5. Security Measures</h2>
            <div className="text-white/80 space-y-4">
              <p>We implement industry-standard security measures:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>End-to-end encryption for sensitive data</li>
                <li>Secure key management and storage</li>
                <li>Regular security audits and updates</li>
                <li>Access controls and authentication</li>
                <li>Monitoring and threat detection</li>
              </ul>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-white mb-4">6. Your Rights</h2>
            <div className="text-white/80 space-y-4">
              <p>You have the right to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Access your personal information</li>
                <li>Correct inaccurate information</li>
                <li>Request deletion of your account data</li>
                <li>Opt-out of marketing communications</li>
                <li>Data portability (where technically feasible)</li>
              </ul>
              <p className="text-yellow-400">
                <strong>Important:</strong> Blockchain data cannot be deleted or modified once recorded.
              </p>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-white mb-4">7. International Transfers</h2>
            <div className="text-white/80 space-y-4">
              <p>
                Your information may be transferred to and processed in countries other than your own. 
                We ensure appropriate safeguards are in place for international data transfers.
              </p>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-white mb-4">8. Children's Privacy</h2>
            <div className="text-white/80 space-y-4">
              <p>
                FlowPay is not intended for users under 18 years of age. We do not knowingly collect 
                personal information from children under 18.
              </p>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-white mb-4">9. Changes to This Policy</h2>
            <div className="text-white/80 space-y-4">
              <p>
                We may update this Privacy Policy from time to time. We will notify you of any 
                material changes by posting the new policy on our website and updating the 
                "Last updated" date.
              </p>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-white mb-4">10. Contact Us</h2>
            <div className="text-white/80 space-y-4">
              <p>
                If you have any questions about this Privacy Policy or our data practices, 
                please contact us at:
              </p>
              <div className="bg-white/5 p-4 rounded-lg">
                <p><strong>Email:</strong> privacy@useflowpay.xyz</p>
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
