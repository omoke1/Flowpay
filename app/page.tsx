"use client";

import Link from "next/link";
import { useFlowMinimal } from "@/components/providers/flow-provider-minimal";
import { SimpleRegistrationModal } from "@/components/auth/simple-registration-modal";
import { useState } from "react";

export default function HomePage() {
  const { isConnected, user, connectWallet, isLoading, error } = useFlowMinimal();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);

  return (
    <div className="min-h-screen gradient-bg text-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-black/20 border-white/10 border-b backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center justify-between py-4">
            <div className="opacity-0 animate-fade-in">
              <Link href="/" className="flex items-center gap-2 text-xl font-semibold tracking-tight">
                FlowPay
              </Link>
            </div>
            <div className="flex items-center gap-3 opacity-0 animate-fade-in">
              {isConnected ? (
                <Link
                  href="/dashboard"
                  className="inline-flex items-center rounded-lg border px-4 py-2 text-sm font-medium transition-all bg-[#97F11D] text-black hover:bg-[#97F11D]/90 border-[#97F11D]"
                >
                  Dashboard
                </Link>
              ) : (
                <button
                  onClick={() => setShowRegistrationModal(true)}
                  disabled={isLoading}
                  className="inline-flex items-center rounded-lg border px-4 py-2 text-sm font-medium transition-all bg-white/10 hover:bg-white/20 border-white/20 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? "Connecting..." : "Get started"}
                </button>
              )}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-lg transition-colors hover:bg-white/10"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </nav>
          {mobileMenuOpen && (
            <div className="md:hidden flex flex-col gap-4 pb-6 border-t pt-4 border-white/10">
              <Link href="#" className="text-sm transition-colors text-white/80 hover:text-white">Sign in</Link>
            </div>
          )}
        </div>
      </header>
      
      {/* Hero Section */}
      <section className="relative isolate lg:pt-20 bg-[url(https://cdn.midjourney.com/f17eb8c4-754a-43d0-b0d5-7a87f5cf9922/0_0.png?w=800&q=80)] bg-cover pt-8">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 pb-20 lg:pb-32 text-center lg:px-8">
          <div className="opacity-0 animate-slide-up delay-400">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border text-sm mb-8 bg-white/5 border-white/10 text-white/80">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 3v4" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M22 5h-4" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 17v2" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 18H3" />
              </svg>
              New: Instant crypto payments now available
            </div>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-7xl tracking-tight leading-tight opacity-0 animate-slide-up delay-500">
            Digital payments<br className="hidden sm:inline" />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-gray-200 to-gray-400">
              reimagined
            </span>
          </h1>
          <p className="mt-8 text-lg sm:text-xl max-w-3xl mx-auto leading-relaxed opacity-0 animate-slide-up delay-600 text-white/70">
            Experience the future of finance with instant transfers, smart contracts, and seamless global payments. Built for the next generation of digital commerce.
          </p>

          {error && (
            <div className="mt-4 p-4 bg-red-500/20 border border-red-500/50 rounded-lg max-w-md mx-auto opacity-0 animate-slide-up delay-600">
              <p className="text-red-300 text-sm text-center">{error}</p>
            </div>
          )}

          <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4 opacity-0 animate-slide-up delay-700">
            {isConnected ? (
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 transition-all transform hover:scale-105 text-base font-medium bg-gradient-to-r from-[#97F11D] to-[#707070] text-black rounded-lg px-8 py-4"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
                Go to Dashboard
              </Link>
            ) : (
              <button
                onClick={() => setShowRegistrationModal(true)}
                disabled={isLoading}
                className="inline-flex items-center gap-2 transition-all transform hover:scale-105 hover:bg-blue-700 text-base font-medium bg-gradient-to-r from-white/10 to-gray-400/70 rounded-lg px-8 py-4 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
                {isLoading ? "Connecting..." : "Get Started"}
              </button>
            )}
            <Link
              href="#features"
              className="inline-flex items-center gap-2 rounded-lg border px-8 py-4 text-base font-medium transition-all border-white/20 hover:bg-white/10"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Watch demo
            </Link>
          </div>

          {/* Enhanced payment cards mockup */}
          <div className="relative mt-16 lg:mt-24 opacity-0 animate-scale-in delay-800">
            <div className="flex flex-col sm:flex-row justify-center items-center gap-6 sm:gap-8">
              <div className="w-72 h-44 transform hover:rotate-[-8deg] transition-transform duration-500 relative overflow-hidden bg-gradient-to-br from-white/0 to-gray-400/50 rounded-2xl rotate-[-12deg]">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 via-gray-500/20 to-purple-500/20"></div>
                <div className="relative h-full flex flex-col pt-6 pr-6 pb-6 pl-6 justify-between">
                  <div className="flex justify-between items-start">
                    <div className="w-12 h-8 bg-gradient-to-br from-white/0 to-gray-400/50 rounded"></div>
                    <svg className="w-6 h-6 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 20h.01" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2 8.82a15 15 0 0 1 20 0" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12.859a10 10 0 0 1 14 0" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.5 16.429a5 5 0 0 1 7 0" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-lg font-mono tracking-wider">•••• •••• •••• 4829</p>
                    <div className="flex justify-between items-end mt-2">
                      <div>
                        <p className="text-xs text-white/60">VALID THRU</p>
                        <p className="text-sm font-medium">08/28</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-white/60">SARAH CHEN</p>
                        <p className="text-sm font-medium">FlowPay</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="w-80 h-48 rounded-2xl glass card-glow transform hover:scale-105 transition-transform duration-500 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-gray-500/20 via-blue-500/20 to-blue-500/20"></div>
                <div className="relative p-8 h-full flex flex-col justify-between">
                  <div className="flex justify-between items-start">
                    <div className="w-14 h-10 rounded bg-gradient-to-br from-white/0 to-gray-400/50"></div>
                    <svg className="w-7 h-7 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xl font-mono tracking-wider">•••• •••• •••• 7391</p>
                    <div className="flex justify-between items-end mt-3">
                      <div>
                        <p className="text-xs text-white/60">EXPIRES</p>
                        <p className="text-base font-medium">12/27</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-white/60">ALEX MORGAN</p>
                        <p className="text-base font-semibold">FlowPay Pro</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="w-72 h-44 rounded-2xl glass card-glow transform rotate-[8deg] hover:rotate-[4deg] transition-transform duration-500 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 via-gray-500/20 to-purple-500/20"></div>
                <div className="relative p-6 h-full flex flex-col justify-between">
                  <div className="flex justify-between items-start">
                    <div className="w-12 h-8 bg-gradient-to-br from-white/0 to-gray-400/50 rounded"></div>
                    <svg className="w-6 h-6 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-lg font-mono tracking-wider">•••• •••• •••• 5067</p>
                    <div className="flex justify-between items-end mt-2">
                      <div>
                        <p className="text-xs text-white/60">VALID THRU</p>
                        <p className="text-sm font-medium">03/29</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-white/60">JAMIE TAYLOR</p>
                        <p className="text-sm font-medium">FlowPay</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Enhanced grid background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none"></div>
      </section>
      
      {/* Features Section */}
      <section id="features" className="py-24 bg-black/20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Built for the Future of Payments
            </h2>
            <p className="text-xl text-white/70 max-w-3xl mx-auto">
              Experience lightning-fast transactions, global reach, and enterprise-grade security with Flow's cutting-edge blockchain technology.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="glass p-8 rounded-2xl card-glow">
              <div className="w-12 h-12 bg-gray-500/20 rounded-lg flex items-center justify-center mb-6">
                <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-4">Lightning Fast</h3>
              <p className="text-white/70">
                Process payments in seconds with Flow's high-performance blockchain. No more waiting for slow confirmations.
              </p>
            </div>
            
            <div className="glass p-8 rounded-2xl card-glow">
              <div className="w-12 h-12 bg-gray-500/20 rounded-lg flex items-center justify-center mb-6">
                <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-4">Enterprise Security</h3>
              <p className="text-white/70">
                Bank-grade security with smart contracts that protect both merchants and customers from fraud.
              </p>
            </div>
            
            <div className="glass p-8 rounded-2xl card-glow">
              <div className="w-12 h-12 bg-gray-500/20 rounded-lg flex items-center justify-center mb-6">
                <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-4">Global Reach</h3>
              <p className="text-white/70">
                Accept payments from anywhere in the world with support for multiple cryptocurrencies and stablecoins.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="bg-black/40 border-t border-white/10 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-2 text-xl font-semibold text-white mb-4 md:mb-0">
              <span className="text-white">Flowpay</span>
            </div>
            <div className="flex gap-6 text-sm text-white/60">
              <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
              <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
              <Link href="/support" className="hover:text-white transition-colors">Support</Link>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-white/10 text-center text-sm text-white/60">
            <p>&copy; 2024 FlowPay. Built on Flow blockchain.</p>
          </div>
        </div>
      </footer>

      {/* Registration Modal */}
        <SimpleRegistrationModal
        isOpen={showRegistrationModal}
        onClose={() => setShowRegistrationModal(false)}
        onSuccess={() => {
          // Optionally redirect to dashboard after successful registration
          // window.location.href = '/dashboard';
        }}
      />
    </div>
  );
}
