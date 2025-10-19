# FlowPay Quick Start Guide

## 🚀 Get Started in 5 Minutes

### Step 1: Install Dependencies

```bash
npm install
```

### Step 2: Set Up Supabase

1. Create a free account at [supabase.com](https://supabase.com)
2. Create a new project
3. Go to SQL Editor and run the contents of `supabase-setup.sql`
4. Go to Settings → API and copy:
   - Project URL
   - Anon/Public Key

### Step 3: Set Up Resend (Optional for MVP)

1. Create account at [resend.com](https://resend.com)
2. Get API key from dashboard

### Step 4: Configure Environment

Create `.env.local` file:

```env
# Supabase (REQUIRED)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key

# Resend (Optional - for email receipts)
RESEND_API_KEY=re_your_key

# Flow Testnet (Pre-configured)
NEXT_PUBLIC_FLOW_NETWORK=testnet
NEXT_PUBLIC_FLOW_ACCESS_NODE=https://rest-testnet.onflow.org
NEXT_PUBLIC_FLOW_DISCOVERY_WALLET=https://fcl-discovery.onflow.org/testnet/authn

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Step 5: Run the App

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Step 6: Test the Flow

1. **Connect Wallet** - Click "Connect Wallet" and use any Flow testnet wallet
2. **Create Payment Link** - Go to Dashboard → Create Payment Link
3. **Test Payment** - Open the generated link in a new tab
4. **Complete Payment** - Connect wallet and send test FLOW
5. **Check Dashboard** - See your payment appear in real-time!

## 📦 What's Included

- ✅ Next.js 15 with App Router
- ✅ Tailwind CSS with custom FlowPay theme
- ✅ Flow FCL integration for wallet auth
- ✅ Supabase for database
- ✅ Resend for email receipts
- ✅ Complete payment flow
- ✅ Merchant dashboard
- ✅ Beautiful UI components

## 🎨 Design System

- **Primary Color**: #97F11D (Neon Flow Green)
- **Background**: #111111 (Dark)
- **Surface**: #3E3411 (Dark Brown)
- **Font**: Neue Machina

## 📝 Key Files

- `app/` - Next.js pages and routes
- `components/` - Reusable UI components
- `lib/` - Utility functions and configurations
- `supabase-setup.sql` - Database schema
- `DEPLOYMENT.md` - Full deployment guide

## 🔧 Troubleshooting

**Issue: Can't connect wallet**
- Make sure you're using Flow testnet
- Try a different wallet (Lilico, Blocto, etc.)

**Issue: Payment links not saving**
- Check Supabase credentials in `.env.local`
- Verify database tables were created

**Issue: Transactions failing**
- Ensure wallet has testnet FLOW
- Get free testnet FLOW from [Flow Faucet](https://testnet-faucet.onflow.org/)

## 🚀 Deploy to Production

See `DEPLOYMENT.md` for complete deployment instructions to Vercel.

Quick deploy:
```bash
git init
git add .
git commit -m "Initial commit"
git push

# Then connect to Vercel and deploy
```

## 📚 Learn More

- [Flow Documentation](https://developers.flow.com)
- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)

## 🤝 Need Help?

- Check the [Flow Discord](https://discord.gg/flow)
- Review code comments in key files
- See `DEPLOYMENT.md` for detailed guides

---

**Happy Building! 🌊**

