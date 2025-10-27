"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle, 
  CreditCard, 
  BarChart3, 
  Settings, 
  Link as LinkIcon,
  Wallet,
  Zap,
  PlayCircle,
  Send,
  Mail,
  Share2
} from "lucide-react";

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  content: React.ReactNode;
  action?: {
    text: string;
    onClick: () => void;
  };
}

interface OnboardingTourProps {
  isOpen: boolean;
  onComplete: () => void;
  onSkip: () => void;
}

export function OnboardingTour({ isOpen, onComplete, onSkip }: OnboardingTourProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());

  const steps: OnboardingStep[] = [
    {
      id: "welcome",
      title: "Welcome to FlowPay! 🎉",
      description: "Let's get you started with accepting crypto and fiat payments",
      icon: <PlayCircle className="w-8 h-8 text-[#97F11D]" />,
      content: (
        <div className="space-y-4">
          <p className="text-gray-400">
            FlowPay is a unified payment platform that lets you accept both cryptocurrency and traditional card payments.
          </p>
          <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg p-4">
            <h4 className="font-medium text-blue-100 mb-2">What you can do:</h4>
            <ul className="text-sm text-blue-200 space-y-1">
              <li>• Create payment links for your products/services</li>
              <li>• Accept FLOW and USDC.e cryptocurrency</li>
              <li>• Accept card payments via Transak</li>
              <li>• Track all payments in real-time</li>
              <li>• Get paid directly to your Flow wallet</li>
            </ul>
          </div>
        </div>
      )
    },
    {
      id: "create-link",
      title: "Create Your First Payment Link",
      description: "Learn how to create payment links for your products",
      icon: <LinkIcon className="w-8 h-8 text-blue-400" />,
      content: (
        <div className="space-y-4">
          <p className="text-gray-400">
            Payment links are shareable URLs that customers can use to pay you. You can create them for any product or service.
          </p>
          <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-4">
            <h4 className="font-medium text-green-100 mb-2">How to Create a Payment Link:</h4>
            <ol className="text-sm text-green-200 space-y-1">
              <li>1. Click the "Create Payment Link" button in the header</li>
              <li>2. Enter your product name and price</li>
              <li>3. Choose payment methods (crypto/card)</li>
              <li>4. Share the generated link with customers</li>
            </ol>
          </div>
          <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg p-4">
            <h4 className="font-medium text-blue-100 mb-2">💡 Pro Tip:</h4>
            <p className="text-sm text-blue-200">
              You can create multiple payment links for different products or services. Each link will have its own unique URL and payment tracking.
            </p>
          </div>
        </div>
      )
    },
    {
      id: "payment-methods",
      title: "Choose Payment Methods",
      description: "Configure how customers can pay you",
      icon: <CreditCard className="w-8 h-8 text-purple-400" />,
      content: (
        <div className="space-y-4">
          <p className="text-gray-400">
            You can accept both cryptocurrency and traditional card payments. Choose what works best for your business.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg p-4">
              <h4 className="font-medium text-blue-100 mb-2">Crypto Payments</h4>
              <ul className="text-sm text-blue-200 space-y-1">
                <li>• FLOW tokens</li>
                <li>• USDC.e stablecoin</li>
                <li>• Instant settlement</li>
                <li>• Low fees</li>
              </ul>
            </div>
            <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-4">
              <h4 className="font-medium text-green-100 mb-2">Card Payments</h4>
              <ul className="text-sm text-green-200 space-y-1">
                <li>• Visa, Mastercard</li>
                <li>• Apple Pay, Google Pay</li>
                <li>• Global availability</li>
                <li>• Familiar checkout</li>
              </ul>
            </div>
          </div>
        </div>
      )
    },
    {
      id: "send-money",
      title: "Send Money Globally 💸",
      description: "Send FLOW or USDC to anyone, anywhere",
      icon: <Send className="w-8 h-8 text-purple-400" />,
      content: (
        <div className="space-y-4">
          <p className="text-gray-400">
            FlowPay now supports peer-to-peer transfers! Send money to anyone globally, even if they don't have a FlowPay account.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-purple-500/20 border border-purple-500/30 rounded-lg p-4">
              <h4 className="font-medium text-purple-100 mb-2">Send via Link</h4>
              <ul className="text-sm text-purple-200 space-y-1">
                <li>• Create a secure claim link</li>
                <li>• Share via chat, social media, or text</li>
                <li>• Recipients claim without account</li>
                <li>• 7-day expiry with auto-refund</li>
              </ul>
            </div>
            <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg p-4">
              <h4 className="font-medium text-blue-100 mb-2">Send via Email</h4>
              <ul className="text-sm text-blue-200 space-y-1">
                <li>• Send directly to email address</li>
                <li>• Automatic claim email sent</li>
                <li>• Professional email template</li>
                <li>• Personal message included</li>
              </ul>
            </div>
          </div>
          <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-4">
            <h4 className="font-medium text-green-100 mb-2">Claim Options:</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
              <div className="flex items-center gap-2 text-sm text-green-200">
                <Wallet className="w-4 h-4" />
                <span>Crypto Wallet (FLOW/USDC)</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-green-200">
                <CreditCard className="w-4 h-4" />
                <span>Bank Account (via Crossmint)</span>
              </div>
            </div>
          </div>
          <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-lg p-4">
            <h4 className="font-medium text-yellow-100 mb-2">💡 Perfect For:</h4>
            <ul className="text-sm text-yellow-200 space-y-1">
              <li>• Paying freelancers and contractors</li>
              <li>• Sending money to family and friends</li>
              <li>• Cross-border payments</li>
              <li>• Business expense reimbursements</li>
            </ul>
          </div>
        </div>
      )
    },
    {
      id: "dashboard",
      title: "Your Dashboard",
      description: "Monitor your payments and revenue",
      icon: <BarChart3 className="w-8 h-8 text-green-400" />,
      content: (
        <div className="space-y-4">
          <p className="text-gray-400">
            Your dashboard shows all your payment activity, revenue, payment links, and transfers in one place.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-800 rounded-lg p-4">
              <h4 className="font-medium text-white mb-2">Payments Tab</h4>
              <p className="text-sm text-gray-400">
                View all incoming payments, their status, and customer details.
              </p>
            </div>
            <div className="bg-gray-800 rounded-lg p-4">
              <h4 className="font-medium text-white mb-2">Analytics Tab</h4>
              <p className="text-sm text-gray-400">
                Track your revenue, popular payment links, and success rates.
              </p>
            </div>
            <div className="bg-gray-800 rounded-lg p-4">
              <h4 className="font-medium text-white mb-2">Send Money</h4>
              <p className="text-sm text-gray-400">
                Access P2P transfers via the sidebar. Send money globally with links or email.
              </p>
            </div>
            <div className="bg-gray-800 rounded-lg p-4">
              <h4 className="font-medium text-white mb-2">Payment Links</h4>
              <p className="text-sm text-gray-400">
                Manage all your payment links, track their performance, and view analytics.
              </p>
            </div>
          </div>
        </div>
      )
    },
    {
      id: "settings",
      title: "Configure Your Settings",
      description: "Customize your profile and API keys",
      icon: <Settings className="w-8 h-8 text-gray-400" />,
      content: (
        <div className="space-y-4">
          <p className="text-gray-400">
            Set up your profile, manage API keys, and configure webhooks for advanced integrations.
          </p>
          <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-lg p-4">
            <h4 className="font-medium text-yellow-100 mb-2">Important Settings:</h4>
            <ul className="text-sm text-yellow-200 space-y-1">
              <li>• Update your display name and email</li>
              <li>• Generate API keys for integrations</li>
              <li>• Set up webhook URLs for notifications</li>
              <li>• Configure email notifications</li>
            </ul>
          </div>
        </div>
      )
    },
    {
      id: "complete",
      title: "You're All Set! 🚀",
      description: "Start accepting payments and grow your business",
      icon: <CheckCircle className="w-8 h-8 text-green-400" />,
      content: (
        <div className="space-y-4">
          <p className="text-gray-400">
            Congratulations! You now have everything you need to start accepting payments with FlowPay.
          </p>
          <div className="bg-[#97F11D]/10 border border-[#97F11D]/20 rounded-lg p-4">
            <h4 className="font-medium text-white mb-2">Ready to Start:</h4>
            <ul className="text-sm text-gray-300 space-y-1">
              <li>• Create your first payment link using the button above</li>
              <li>• Try sending money via "Send Money" in the sidebar</li>
              <li>• Test the payment flow with a small amount</li>
              <li>• Share your payment links with customers</li>
              <li>• Monitor your dashboard for incoming payments</li>
            </ul>
          </div>
          <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg p-4">
            <h4 className="font-medium text-blue-100 mb-2">💡 Remember:</h4>
            <p className="text-sm text-blue-200">
              You can always come back to this tour by clicking the "Take Tour" button in the welcome banner, or access help through the settings page.
            </p>
          </div>
        </div>
      )
    }
  ];

  const currentStepData = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;
  const isFirstStep = currentStep === 0;

  const handleNext = () => {
    if (isLastStep) {
      onComplete();
    } else {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (!isFirstStep) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSkip = () => {
    onSkip();
  };

  const handleSkipToEnd = () => {
    setCurrentStep(steps.length - 1);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl bg-black border border-white/10">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {currentStepData.icon}
              <div>
                <CardTitle className="text-xl font-semibold text-white">
                  {currentStepData.title}
                </CardTitle>
                <CardDescription className="text-sm text-gray-400">
                  {currentStepData.description}
                </CardDescription>
              </div>
            </div>
            <button 
              onClick={handleSkip}
              className="text-gray-400 hover:text-gray-300"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          {/* Progress Bar */}
          <div className="mt-4">
            <div className="flex items-center gap-2">
              {steps.map((_, index) => (
                <div
                  key={index}
                  className={`h-2 flex-1 rounded-full ${
                    index <= currentStep 
                      ? 'bg-[#97F11D]' 
                      : 'bg-gray-200 dark:bg-gray-700'
                  }`}
                />
              ))}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              Step {currentStep + 1} of {steps.length}
            </p>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {currentStepData.content}
          
          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-4">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={isFirstStep}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Previous
            </Button>
            
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                onClick={handleSkip}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                Skip Tour
              </Button>
              
              <Button
                onClick={handleNext}
                className="bg-[#97F11D] hover:bg-[#97F11D]/90 text-black font-medium flex items-center gap-2"
              >
                {isLastStep ? 'Complete' : 'Next'}
                {!isLastStep && <ArrowRight className="w-4 h-4" />}
              </Button>
            </div>
          </div>
          
          {/* Skip to End Option */}
          {!isLastStep && (
            <div className="text-center pt-2">
              <button
                onClick={handleSkipToEnd}
                className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 underline"
              >
                Skip to end
              </button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

