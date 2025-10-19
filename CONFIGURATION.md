# 🔧 FlowPay Configuration Guide

## Environment Variables

Create a `.env.local` file in your project root with the following variables:

```bash
# Flow Configuration
NEXT_PUBLIC_FLOW_ACCESS_NODE=https://rest-testnet.onflow.org
NEXT_PUBLIC_FLOW_DISCOVERY_WALLET=https://fcl-discovery.onflow.org/testnet/authn

# WalletConnect (Optional - for enhanced wallet support)
# Get your project ID from https://cloud.walletconnect.com/
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your-walletconnect-project-id

# Supabase Configuration (Optional - for production)
# Get these from your Supabase project settings
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

# Resend API (Optional - for email notifications)
# Get your API key from https://resend.com/
RESEND_API_KEY=your-resend-api-key

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3001
```

## Required Configuration

### 1. Flow Blockchain (Required)
- **Access Node**: `https://rest-testnet.onflow.org` (testnet)
- **Discovery Wallet**: `https://fcl-discovery.onflow.org/testnet/authn`

### 2. WalletConnect (Recommended)
- Get a project ID from [WalletConnect Cloud](https://cloud.walletconnect.com/)
- This enables support for more wallets

### 3. Supabase (Optional for MVP)
- The app works with mock data if Supabase is not configured
- For production, set up a Supabase project

### 4. Resend (Optional)
- For email notifications
- Get API key from [Resend](https://resend.com/)

## Quick Start (No Configuration Required)

The app works out of the box with:
- ✅ Mock data for development
- ✅ Flow testnet integration
- ✅ Basic wallet connection (Blocto, Ledger, etc.)
- ✅ All dashboard features
- ✅ No endless loading issues

## Production Setup

1. **Get WalletConnect Project ID**:
   - Visit [WalletConnect Cloud](https://cloud.walletconnect.com/)
   - Create a new project
   - Copy the project ID

2. **Set up Supabase** (optional):
   - Create a Supabase project
   - Run the SQL from `supabase-setup.sql`
   - Add environment variables

3. **Configure Email** (optional):
   - Sign up for Resend
   - Add API key to environment

## Testing

The app works without any configuration - all features are functional with mock data!
