# 🔧 Transak API Setup Guide

## 📍 **Where to Put Transak API Configuration**

### **1. Environment Variables (.env.local)**

Create a `.env.local` file in your project root with these Transak API credentials:

```env
# ============================================
# Transak API Configuration
# ============================================
# Get these from: https://dashboard.transak.com/
NEXT_PUBLIC_TRANSAK_API_KEY=your_transak_api_key_here
TRANSAK_API_SECRET=your_transak_api_secret_here
NEXT_PUBLIC_TRANSAK_ENV=STAGING
# Options: STAGING (for testing) or PRODUCTION (for live)
```

### **2. Complete Environment File Template**

Your `.env.local` should include all these variables:

```env
# ============================================
# FlowPay Environment Configuration
# ============================================

# ============================================
# Transak API Configuration
# ============================================
NEXT_PUBLIC_TRANSAK_API_KEY=your_transak_api_key_here
TRANSAK_API_SECRET=your_transak_api_secret_here
NEXT_PUBLIC_TRANSAK_ENV=STAGING

# ============================================
# Supabase Database Configuration
# ============================================
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# ============================================
# Email Service (Resend)
# ============================================
RESEND_API_KEY=your_resend_api_key

# ============================================
# Flow Blockchain Configuration
# ============================================
NEXT_PUBLIC_FLOW_NETWORK=testnet
NEXT_PUBLIC_FLOW_ACCESS_NODE=https://rest-testnet.onflow.org

# ============================================
# App Configuration
# ============================================
NEXT_PUBLIC_APP_URL=http://localhost:3001

# ============================================
# WalletConnect Configuration
# ============================================
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_walletconnect_project_id
```

## 🚀 **How to Get Transak API Credentials**

### **Step 1: Sign Up for Transak**
1. Go to [https://transak.com](https://transak.com)
2. Click "Get Started" or "Sign Up"
3. Complete the registration process

### **Step 2: Access Dashboard**
1. Log in to [https://dashboard.transak.com/](https://dashboard.transak.com/)
2. Navigate to "API Keys" section
3. Create a new API key or use existing one

### **Step 3: Get Required Credentials**
You'll need these three values:

#### **API Key** (`NEXT_PUBLIC_TRANSAK_API_KEY`)
- This is your public API key
- Used in frontend code
- Safe to expose in client-side code

#### **API Secret** (`TRANSAK_API_SECRET`)
- This is your private API secret
- Used in backend API routes
- **NEVER expose this in frontend code**

#### **Environment Selection** (`NEXT_PUBLIC_TRANSAK_ENV`)
- Choose between STAGING or PRODUCTION
- STAGING for testing, PRODUCTION for live transactions

### **Step 4: Environment Selection**
- **STAGING**: For testing and development
- **PRODUCTION**: For live transactions

## 📁 **Current Transak Integration Files**

### **Already Implemented:**

#### **1. Configuration File**
- **Location**: `lib/transak.ts`
- **Purpose**: Transak SDK configuration and utilities
- **Contains**: API config, webhook verification, SDK initialization

#### **2. API Routes**
- **Location**: `app/api/transak/create-order/route.ts`
- **Purpose**: Create Transak orders from payment links
- **Endpoint**: `POST /api/transak/create-order`

- **Location**: `app/api/transak/webhook/route.ts`
- **Purpose**: Handle Transak webhook notifications
- **Endpoint**: `POST /api/transak/webhook`

#### **3. Frontend Components**
- **Location**: `components/checkout/FiatPay.tsx`
- **Purpose**: Fiat payment interface using Transak SDK
- **Features**: Card payments, order tracking, success handling

## 🔄 **Transak Integration Flow**

### **1. Customer Payment Flow**
```
1. Customer selects "Pay with Card" on checkout page
2. FiatPay component calls /api/transak/create-order
3. Backend creates pending payment record
4. Transak SDK initializes with order details
5. Customer completes payment on Transak
6. Transak sends webhook to /api/transak/webhook
7. Backend updates payment status
8. Customer redirected to success page
```

### **2. Webhook Processing**
```
1. Transak sends webhook to your server
2. /api/transak/webhook verifies signature
3. Updates payment record in database
4. Sends email notifications
5. Updates merchant dashboard
```

## 🛠️ **Setup Instructions**

### **Step 1: Create .env.local**
```bash
# In your project root directory
touch .env.local
```

### **Step 2: Add Transak Credentials**
Copy the environment variables from above and replace with your actual Transak API credentials.

### **Step 3: Restart Development Server**
```bash
# Stop current server (Ctrl+C)
# Then restart
npm run dev
```

### **Step 4: Test Integration**
1. Create a payment link with fiat enabled
2. Go to checkout page
3. Select "Pay with Card"
4. Verify Transak SDK loads correctly

## 🔍 **Verification Steps**

### **Check Environment Variables**
```bash
# In your terminal, verify variables are loaded
echo $NEXT_PUBLIC_TRANSAK_API_KEY
```

### **Test API Endpoints**
```bash
# Test create order endpoint
curl -X POST http://localhost:3001/api/transak/create-order \
  -H "Content-Type: application/json" \
  -d '{"paymentLinkId":"test","merchantWalletAddress":"0x123"}'
```

### **Check Console Logs**
- Open browser developer tools
- Look for Transak SDK initialization logs
- Verify no API key errors

## 🚨 **Important Notes**

### **Security**
- ✅ `NEXT_PUBLIC_TRANSAK_API_KEY` - Safe for frontend
- ❌ `TRANSAK_API_SECRET` - Backend only
- ✅ `NEXT_PUBLIC_TRANSAK_ENV` - Environment selection

### **Environment**
- Use `STAGING` for development and testing
- Use `PRODUCTION` only for live transactions
- Test thoroughly in staging before going live

### **Webhook URL**
- Set webhook URL in Transak dashboard to: `https://yourdomain.com/api/transak/webhook`
- For local testing, use ngrok or similar tunneling service

## 📞 **Support**

### **Transak Documentation**
- [Transak API Docs](https://docs.transak.com/)
- [Transak SDK Docs](https://docs.transak.com/sdk)
- [Transak Webhook Docs](https://docs.transak.com/webhooks)

### **FlowPay Integration**
- All Transak integration code is already implemented
- Just add your API credentials to `.env.local`
- Restart the development server
- Test the fiat payment flow

---

## 🎯 **Summary**

**To enable Transak API integration:**

1. ✅ **Get API credentials** from Transak dashboard
2. ✅ **Create `.env.local`** file in project root
3. ✅ **Add Transak variables** to environment file
4. ✅ **Restart development server**
5. ✅ **Test fiat payment flow**

The Transak integration is **fully implemented** - you just need to add your API credentials! 🚀
