"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  CreditCard, 
  Wallet, 
  Coins, 
  MapPin, 
  Phone, 
  Building, 
  User,
  Check,
  ArrowRight,
  Shield,
  Lock
} from "lucide-react";

interface EnhancedCheckoutProps {
  productName: string;
  amount: string;
  token: string;
  onPaymentSuccess: (reference: string) => void;
  onPaymentError: (error: string) => void;
}

type PaymentMethod = 'saved' | 'card' | 'crypto';

export function EnhancedCheckout({
  productName,
  amount,
  token,
  onPaymentSuccess,
  onPaymentError
}: EnhancedCheckoutProps) {
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod>('crypto');
  const [billingInfo, setBillingInfo] = useState({
    firstName: '',
    lastName: '',
    email: '',
    company: '',
    country: '',
    address: '',
    address2: '',
    city: '',
    state: '',
    zipCode: '',
    phone: ''
  });
  const [autoRenew, setAutoRenew] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const handleInputChange = (field: string, value: string) => {
    setBillingInfo(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (formErrors[field]) {
      setFormErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    
    if (!billingInfo.firstName.trim()) {
      errors.firstName = 'First name is required';
    }
    
    if (!billingInfo.lastName.trim()) {
      errors.lastName = 'Last name is required';
    }
    
    if (!billingInfo.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(billingInfo.email)) {
      errors.email = 'Please enter a valid email address';
    }
    
    if (!billingInfo.country.trim()) {
      errors.country = 'Country is required';
    }
    
    if (!billingInfo.address.trim()) {
      errors.address = 'Address is required';
    }
    
    if (!billingInfo.city.trim()) {
      errors.city = 'City is required';
    }
    
    if (!billingInfo.state.trim()) {
      errors.state = 'State/Province is required';
    }
    
    if (!billingInfo.zipCode.trim()) {
      errors.zipCode = 'ZIP/Postal code is required';
    }
    
    if (!billingInfo.phone.trim()) {
      errors.phone = 'Phone number is required';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handlePayment = async () => {
    // Validate form first
    if (!validateForm()) {
      onPaymentError('Please fill in all required fields correctly.');
      return;
    }

    setIsProcessing(true);
    try {
      if (selectedPaymentMethod === 'crypto') {
        // For crypto payments, proceed to actual Flow blockchain payment
        // This will trigger the real payment flow
        onPaymentSuccess('crypto_ready');
      } else {
        // For fiat payments, show coming soon
        onPaymentError('Fiat payments are coming soon! Please use crypto payment for now.');
      }
    } catch (error) {
      onPaymentError('Payment failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Left Panel - Billing Information */}
      <div className="space-y-6">
        <Card className="bg-black/50 border border-white/10">
          <CardHeader>
            <CardTitle className="text-white text-xl">Billing Information</CardTitle>
            <CardDescription className="text-gray-400">
              Complete your payment details securely
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Payment Method Selection */}
            <div className="space-y-4">
              <Label className="text-white font-medium">Payment Method</Label>
              <div className="grid grid-cols-3 gap-2">
                <Button
                  variant={selectedPaymentMethod === 'saved' ? 'default' : 'outline'}
                  onClick={() => setSelectedPaymentMethod('saved')}
                  disabled
                  className="h-12 flex flex-col items-center justify-center gap-2 bg-transparent border-white/10 text-gray-500 cursor-not-allowed opacity-50"
                >
                  <CreditCard className="w-4 h-4" />
                  <span className="text-xs">Saved</span>
                  <span className="text-xs text-gray-500">Coming Soon</span>
                </Button>
                
                <Button
                  variant={selectedPaymentMethod === 'card' ? 'default' : 'outline'}
                  onClick={() => setSelectedPaymentMethod('card')}
                  disabled
                  className="h-12 flex flex-col items-center justify-center gap-2 bg-transparent border-white/10 text-gray-500 cursor-not-allowed opacity-50"
                >
                  <CreditCard className="w-4 h-4" />
                  <span className="text-xs">Card</span>
                  <span className="text-xs text-gray-500">Coming Soon</span>
                </Button>
                
                <Button
                  variant={selectedPaymentMethod === 'crypto' ? 'default' : 'outline'}
                  onClick={() => setSelectedPaymentMethod('crypto')}
                  className={`h-12 flex flex-col items-center justify-center gap-2 ${
                    selectedPaymentMethod === 'crypto' 
                      ? 'bg-[#97F11D] text-black' 
                      : 'bg-transparent border-[#97F11D]/50 text-[#97F11D] hover:bg-[#97F11D]/10'
                  }`}
                >
                  <Coins className="w-4 h-4" />
                  <span className="text-xs font-semibold">Crypto</span>
                  <span className="text-xs text-[#97F11D]">Flow Blockchain</span>
                </Button>
              </div>
            </div>

            {/* Payment Method Specific Content */}
            {selectedPaymentMethod === 'crypto' && (
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-4 bg-[#97F11D]/10 rounded-lg border border-[#97F11D]/20">
                  <div className="w-8 h-8 bg-[#97F11D]/20 rounded-full flex items-center justify-center">
                    <Coins className="w-4 h-4 text-[#97F11D]" />
                  </div>
                  <div>
                    <p className="text-white font-medium">Pay with Flow Blockchain</p>
                    <p className="text-gray-400 text-sm">
                      Secure payment using FLOW tokens or USDC on Flow mainnet.
                    </p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center gap-2 p-3 bg-white/5 rounded-lg border border-white/10">
                    <div className="w-6 h-6 bg-[#97F11D]/20 rounded-full flex items-center justify-center">
                      <span className="text-[#97F11D] text-xs font-bold">F</span>
                    </div>
                    <div>
                      <p className="text-white text-sm font-medium">FLOW</p>
                      <p className="text-gray-400 text-xs">Native token</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 p-3 bg-white/5 rounded-lg border border-white/10">
                    <div className="w-6 h-6 bg-blue-500/20 rounded-full flex items-center justify-center">
                      <span className="text-blue-400 text-xs font-bold">U</span>
                    </div>
                    <div>
                      <p className="text-white text-sm font-medium">USDC</p>
                      <p className="text-gray-400 text-xs">Stablecoin</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Personal Information Form */}
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="text-white">First Name *</Label>
                  <Input
                    id="firstName"
                    value={billingInfo.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    className={`bg-black/50 border-white/20 text-white placeholder-gray-500 ${
                      formErrors.firstName ? 'border-red-500' : ''
                    }`}
                    placeholder="Enter first name"
                  />
                  {formErrors.firstName && (
                    <p className="text-red-400 text-xs">{formErrors.firstName}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName" className="text-white">Last Name *</Label>
                  <Input
                    id="lastName"
                    value={billingInfo.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    className={`bg-black/50 border-white/20 text-white placeholder-gray-500 ${
                      formErrors.lastName ? 'border-red-500' : ''
                    }`}
                    placeholder="Enter last name"
                  />
                  {formErrors.lastName && (
                    <p className="text-red-400 text-xs">{formErrors.lastName}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-white">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={billingInfo.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className={`bg-black/50 border-white/20 text-white placeholder-gray-500 ${
                    formErrors.email ? 'border-red-500' : ''
                  }`}
                  placeholder="Enter email address"
                />
                {formErrors.email && (
                  <p className="text-red-400 text-xs">{formErrors.email}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="company" className="text-white">Company (Optional)</Label>
                <Input
                  id="company"
                  value={billingInfo.company}
                  onChange={(e) => handleInputChange('company', e.target.value)}
                  className="bg-black/50 border-white/20 text-white placeholder-gray-500"
                  placeholder="Enter company name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="country" className="text-white">Country *</Label>
                <div className="relative">
                  <Input
                    id="country"
                    value={billingInfo.country}
                    onChange={(e) => handleInputChange('country', e.target.value)}
                    className={`bg-black/50 border-white/20 text-white placeholder-gray-500 pr-8 ${
                      formErrors.country ? 'border-red-500' : ''
                    }`}
                    placeholder="Select country"
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
                {formErrors.country && (
                  <p className="text-red-400 text-xs">{formErrors.country}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="address" className="text-white">Billing Address *</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="address"
                    value={billingInfo.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    className={`bg-black/50 border-white/20 text-white placeholder-gray-500 pl-10 pr-8 ${
                      formErrors.address ? 'border-red-500' : ''
                    }`}
                    placeholder="Enter billing address"
                  />
                  <button className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                {formErrors.address && (
                  <p className="text-red-400 text-xs">{formErrors.address}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="address2" className="text-white">Address 2 (Optional)</Label>
                <Input
                  id="address2"
                  value={billingInfo.address2}
                  onChange={(e) => handleInputChange('address2', e.target.value)}
                  className="bg-black/50 border-white/20 text-white placeholder-gray-500"
                  placeholder="Apartment, suite, etc."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city" className="text-white">City *</Label>
                  <Input
                    id="city"
                    value={billingInfo.city}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                    className={`bg-black/50 border-white/20 text-white placeholder-gray-500 ${
                      formErrors.city ? 'border-red-500' : ''
                    }`}
                    placeholder="Enter city"
                  />
                  {formErrors.city && (
                    <p className="text-red-400 text-xs">{formErrors.city}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state" className="text-white">State/Province/Region *</Label>
                  <div className="relative">
                    <Input
                      id="state"
                      value={billingInfo.state}
                      onChange={(e) => handleInputChange('state', e.target.value)}
                      className={`bg-black/50 border-white/20 text-white placeholder-gray-500 pr-8 ${
                        formErrors.state ? 'border-red-500' : ''
                      }`}
                      placeholder="Select state"
                    />
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                  {formErrors.state && (
                    <p className="text-red-400 text-xs">{formErrors.state}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="zipCode" className="text-white">ZIP / Postal Code *</Label>
                  <Input
                    id="zipCode"
                    value={billingInfo.zipCode}
                    onChange={(e) => handleInputChange('zipCode', e.target.value)}
                    className={`bg-black/50 border-white/20 text-white placeholder-gray-500 ${
                      formErrors.zipCode ? 'border-red-500' : ''
                    }`}
                    placeholder="Enter ZIP code"
                  />
                  {formErrors.zipCode && (
                    <p className="text-red-400 text-xs">{formErrors.zipCode}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-white">Phone *</Label>
                  <div className="flex">
                    <div className="flex items-center px-3 bg-black/50 border border-r-0 border-white/20 rounded-l-md">
                      <span className="text-white text-sm">🇺🇸</span>
                    </div>
                    <Input
                      id="phone"
                      value={billingInfo.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      className={`bg-black/50 border-white/20 text-white placeholder-gray-500 rounded-l-none ${
                        formErrors.phone ? 'border-red-500' : ''
                      }`}
                      placeholder="Enter phone number"
                    />
                  </div>
                  {formErrors.phone && (
                    <p className="text-red-400 text-xs">{formErrors.phone}</p>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Right Panel - Order Summary */}
      <div className="space-y-6">
        <Card className="bg-black/50 border border-white/10">
          <CardHeader>
            <CardTitle className="text-white text-xl">Order Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Items */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-[#97F11D]/20 rounded-full flex items-center justify-center">
                    <Coins className="w-4 h-4 text-[#97F11D]" />
                  </div>
                  <div>
                    <p className="text-white font-medium">{productName}</p>
                    <p className="text-gray-400 text-sm">FlowPay Digital Product</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[#97F11D] font-semibold">${amount}</p>
                  <p className="text-gray-400 text-xs">USD</p>
                </div>
              </div>

              {/* Auto-renewal Option */}
              <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10">
                <div>
                  <p className="text-white font-medium">FlowPay Pro Subscription</p>
                  <p className="text-gray-400 text-sm">Enhanced features and priority support</p>
                </div>
                <button
                  onClick={() => setAutoRenew(!autoRenew)}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    autoRenew ? 'bg-[#97F11D]' : 'bg-gray-600'
                  }`}
                >
                  <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                    autoRenew ? 'translate-x-6' : 'translate-x-0'
                  }`} />
                </button>
              </div>

              {/* FlowPay Features */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-gray-400 text-sm">
                  <Check className="w-4 h-4 text-[#97F11D]" />
                  <span>Flow mainnet transactions</span>
                </div>
                <div className="flex items-center gap-2 text-gray-400 text-sm">
                  <Check className="w-4 h-4 text-[#97F11D]" />
                  <span>Real-time payment tracking</span>
                </div>
                <div className="flex items-center gap-2 text-gray-400 text-sm">
                  <Check className="w-4 h-4 text-[#97F11D]" />
                  <span>Secure blockchain payments</span>
                </div>
              </div>
            </div>

            {/* Total */}
            <div className="border-t border-white/10 pt-4">
              <div className="flex items-center justify-between">
                <span className="text-white font-semibold text-lg">Total</span>
                <span className="text-[#97F11D] font-bold text-xl">${amount}</span>
              </div>
            </div>

            {/* Security Features */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-[#97F11D] text-sm">
                <Shield className="w-4 h-4" />
                <span>Secured by Flow Mainnet</span>
              </div>
              <div className="flex items-center gap-2 text-gray-400 text-sm">
                <Lock className="w-4 h-4" />
                <span>256-bit SSL encryption</span>
              </div>
              <div className="flex items-center gap-2 text-gray-400 text-sm">
                <Coins className="w-4 h-4" />
                <span>Decentralized payments</span>
              </div>
            </div>

            {/* Buy Button */}
            <Button
              onClick={handlePayment}
              disabled={isProcessing}
              className="w-full h-12 bg-[#97F11D] hover:bg-[#97F11D]/90 text-black font-semibold text-lg"
            >
              {isProcessing ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  Processing...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Coins className="w-5 h-5" />
                  Pay with Flow
                </div>
              )}
            </Button>

            {/* Security Notice */}
            <div className="text-center">
              <p className="text-gray-400 text-xs">
                Powered by Flow mainnet • Secure blockchain payments
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
