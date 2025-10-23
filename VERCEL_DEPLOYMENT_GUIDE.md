# 🚀 Vercel Deployment Guide

This guide will help you deploy FlowPay to Vercel with all the required environment variables.

## 📋 Prerequisites

Before deploying, ensure you have:

1. ✅ **Supabase Project** set up with all tables created
2. ✅ **Flow Wallet** with mainnet access
3. ✅ **Vercel Account** connected to your GitHub repository

## 🔧 Step 1: Set Up Environment Variables in Vercel

### 1.1 Access Vercel Dashboard
1. Go to [vercel.com](https://vercel.com)
2. Navigate to your FlowPay project
3. Go to **Settings** → **Environment Variables**

### 1.2 Add Required Environment Variables

Add these **CRITICAL** environment variables:

#### **🔴 CRITICAL - Supabase Database**
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### **🔴 CRITICAL - Flow Blockchain**
```
NEXT_PUBLIC_FLOW_NETWORK=mainnet
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_walletconnect_project_id
```

#### **🔴 CRITICAL - Application URL**
```
NEXT_PUBLIC_APP_URL=https://useflowpay.xyz
```

#### **🟡 IMPORTANT - Admin Configuration**
```
NEXT_PUBLIC_ADMIN_PAYER_ADDRESS=0x...
ADMIN_PAYER_PRIVATE_KEY=xxx...
ADMIN_PAYER_ACCOUNT_INDEX=0
NEXT_PUBLIC_PLATFORM_FEE_RECIPIENT=0x...
ADMIN_WALLET_ADDRESS=0x...
ADMIN_SESSION_SECRET=your-admin-session-secret-here
ADMIN_API_KEY=your-admin-api-key-here
NEXT_PUBLIC_ADMIN_DOMAIN=admin.useflowpay.xyz
```

#### **🟡 IMPORTANT - Webhooks**
```
WEBHOOK_SECRET=your_webhook_secret_for_verification
```

### 1.3 Environment Variable Settings

For each environment variable:
- **Name**: Copy exactly as shown above
- **Value**: Your actual secret value
- **Environment**: Select **Production**, **Preview**, and **Development**
- **Encrypt**: ✅ Yes (for sensitive values)

## 🔧 Step 2: Get Your Supabase Credentials

### 2.1 Access Supabase Dashboard
1. Go to [supabase.com](https://supabase.com)
2. Open your FlowPay project
3. Go to **Settings** → **API**

### 2.2 Copy Required Values
- **Project URL**: Copy the URL (e.g., `https://abcdefgh.supabase.co`)
- **Anon Key**: Copy the `anon` public key
- **Service Role Key**: Copy the `service_role` secret key ⚠️ **KEEP SECRET!**

## 🔧 Step 3: Get Your Flow Credentials

### 3.1 WalletConnect Project ID
1. Go to [cloud.walletconnect.com](https://cloud.walletconnect.com)
2. Create a new project
3. Copy the **Project ID**

### 3.2 Flow Addresses
- **Admin Payer Address**: Your Flow wallet address that will fund new accounts
- **Platform Fee Recipient**: Your Flow wallet address for receiving 0.5% fees
- **Admin Wallet Address**: Your Flow wallet address for admin access

## 🔧 Step 4: Deploy to Vercel

### 4.1 Trigger Deployment
1. Go to your Vercel project dashboard
2. Click **Deployments**
3. Click **Redeploy** on the latest deployment
4. Or push a new commit to trigger automatic deployment

### 4.2 Monitor Deployment
Watch the deployment logs for:
- ✅ **Build successful**
- ✅ **No environment variable errors**
- ✅ **All API routes working**

## 🔧 Step 5: Test Production Deployment

### 5.1 Test Basic Functionality
1. Visit your deployed URL
2. Connect a Flow wallet
3. Create a payment link
4. Test payment flow

### 5.2 Test Database Integration
1. Check that user records are created
2. Verify payment links are saved
3. Confirm transactions are recorded

### 5.3 Test Mainnet Transactions
1. Make a real payment with FLOW/USDC
2. Check transaction on [Flowscan](https://flowscan.org)
3. Verify payment confirmation

## 🚨 Troubleshooting

### Build Errors
If you see `Error: supabaseKey is required`:
1. ✅ Check `SUPABASE_SERVICE_ROLE_KEY` is set in Vercel
2. ✅ Verify the key is correct (starts with `eyJ...`)
3. ✅ Ensure it's set for **Production** environment

### Runtime Errors
If you see database errors:
1. ✅ Check `NEXT_PUBLIC_SUPABASE_URL` is correct
2. ✅ Verify `NEXT_PUBLIC_SUPABASE_ANON_KEY` is set
3. ✅ Ensure Supabase tables are created

### Wallet Connection Issues
If wallets won't connect:
1. ✅ Check `NEXT_PUBLIC_FLOW_NETWORK=mainnet`
2. ✅ Verify `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` is set
3. ✅ Ensure Flow Discovery API is accessible

## 📊 Post-Deployment Checklist

- [ ] **Environment variables** set in Vercel
- [ ] **Supabase database** connected and working
- [ ] **Flow wallet** connection working
- [ ] **Payment links** creating successfully
- [ ] **Real transactions** processing on mainnet
- [ ] **Transaction tracking** working on Flowscan
- [ ] **Admin dashboard** accessible (if configured)

## 🎉 Success!

Once all environment variables are set and the deployment succeeds, FlowPay will be live on mainnet with:

- ✅ **Real Flow blockchain integration**
- ✅ **Production Supabase database**
- ✅ **Secure wallet connections**
- ✅ **On-chain transaction tracking**
- ✅ **Ready for users!**

## 📞 Support

If you encounter issues:
1. Check the deployment logs in Vercel
2. Verify all environment variables are set
3. Test the Supabase connection
4. Ensure Flow network is accessible

**Your FlowPay application is now ready for production use!** 🚀
