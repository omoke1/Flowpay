# FlowPay Deployment Guide

## Prerequisites

Before deploying FlowPay, ensure you have:

1. **Supabase Account** - [https://supabase.com](https://supabase.com)
2. **Resend Account** - [https://resend.com](https://resend.com)
3. **Vercel Account** - [https://vercel.com](https://vercel.com)
4. **Flow Testnet Wallet** - Any Flow-compatible wallet (Lilico, Blocto, etc.)

## Step 1: Set Up Supabase

### 1.1 Create a New Project

1. Go to [https://app.supabase.com](https://app.supabase.com)
2. Click "New Project"
3. Fill in project details and create

### 1.2 Run Database Schema

1. Go to SQL Editor in your Supabase dashboard
2. Copy the contents of `supabase-setup.sql`
3. Paste and run the SQL script
4. Verify tables are created: `users`, `payment_links`, `payments`

### 1.3 Get API Credentials

1. Go to Project Settings → API
2. Copy:
   - Project URL (NEXT_PUBLIC_SUPABASE_URL)
   - Anon/Public Key (NEXT_PUBLIC_SUPABASE_ANON_KEY)

## Step 2: Set Up Resend

### 2.1 Create Account and Get API Key

1. Go to [https://resend.com](https://resend.com)
2. Sign up and verify your account
3. Go to API Keys section
4. Create a new API key
5. Copy the API key (RESEND_API_KEY)

### 2.2 Verify Domain (Optional for Production)

1. Go to Domains section
2. Add your domain
3. Follow DNS verification steps
4. Update `from` email in `lib/resend.ts` to use your domain

## Step 3: Configure Environment Variables

### 3.1 Create `.env.local` File

Create a `.env.local` file in the project root:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here

# Resend
RESEND_API_KEY=re_your_api_key_here

# Flow Network (Testnet)
NEXT_PUBLIC_FLOW_NETWORK=testnet
NEXT_PUBLIC_FLOW_ACCESS_NODE=https://rest-testnet.onflow.org
NEXT_PUBLIC_FLOW_DISCOVERY_WALLET=https://fcl-discovery.onflow.org/testnet/authn

# App URL (Update for production)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Step 4: Test Locally

### 4.1 Install Dependencies

```bash
npm install
```

### 4.2 Run Development Server

```bash
npm run dev
```

### 4.3 Test Core Flows

1. **Connect Wallet**: Click "Connect Wallet" and authenticate with Flow wallet
2. **Create Payment Link**: Go to Dashboard → Create Payment Link
3. **Test Checkout**: Open the generated payment link
4. **Make Payment**: Connect wallet and complete a test payment
5. **Verify Dashboard**: Check that payment appears in dashboard

## Step 5: Deploy to Vercel

### 5.1 Push to GitHub

```bash
git init
git add .
git commit -m "Initial FlowPay deployment"
git branch -M main
git remote add origin https://github.com/yourusername/flowpay.git
git push -u origin main
```

### 5.2 Connect to Vercel

1. Go to [https://vercel.com](https://vercel.com)
2. Click "New Project"
3. Import your GitHub repository
4. Configure project:
   - Framework Preset: Next.js
   - Root Directory: ./
   - Build Command: `npm run build`
   - Output Directory: `.next`

### 5.3 Add Environment Variables

In Vercel project settings, add all environment variables from `.env.local`:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `RESEND_API_KEY`
- `NEXT_PUBLIC_FLOW_NETWORK`
- `NEXT_PUBLIC_FLOW_ACCESS_NODE`
- `NEXT_PUBLIC_FLOW_DISCOVERY_WALLET`
- `NEXT_PUBLIC_APP_URL` (set to your Vercel domain, e.g., `https://flowpay.vercel.app`)

### 5.4 Deploy

1. Click "Deploy"
2. Wait for build to complete
3. Visit your deployed site

## Step 6: Post-Deployment Configuration

### 6.1 Update App URL

1. Once deployed, get your Vercel URL
2. Update `NEXT_PUBLIC_APP_URL` in Vercel environment variables
3. Redeploy the application

### 6.2 Test Production

1. Visit your deployed FlowPay site
2. Test the complete flow:
   - Connect wallet
   - Create payment link
   - Share link and make test payment
   - Verify email receipts
   - Check dashboard updates

## Step 7: Configure Custom Domain (Optional)

### 7.1 Add Domain in Vercel

1. Go to Project Settings → Domains
2. Add your custom domain
3. Follow DNS configuration instructions

### 7.2 Update Environment Variables

1. Update `NEXT_PUBLIC_APP_URL` to your custom domain
2. Update Resend sender email if using verified domain
3. Redeploy

## Troubleshooting

### Common Issues

**Issue: Wallet won't connect**
- Solution: Ensure FCL configuration is correct for testnet
- Check browser console for errors
- Try different wallet providers

**Issue: Payment links not saving**
- Solution: Verify Supabase credentials
- Check RLS policies are enabled
- Verify user authentication

**Issue: Emails not sending**
- Solution: Check Resend API key is valid
- Verify sender email is allowed
- Check Resend dashboard for delivery status

**Issue: Transactions failing**
- Solution: Ensure wallet has sufficient FLOW for gas
- Verify contract addresses are correct for testnet
- Check Flow testnet status

### Debug Mode

Enable debug logging:

```typescript
// In lib/flow-config.ts
fcl.config({
  // ... existing config
  "fcl.eventPollRate": 2500,
  "debug.accounts": true,
});
```

## Production Checklist

Before going to production:

- [ ] Database schema deployed and tested
- [ ] All environment variables configured
- [ ] Wallet connection working
- [ ] Payment flow tested end-to-end
- [ ] Email receipts sending correctly
- [ ] Dashboard displaying real data
- [ ] Custom domain configured (optional)
- [ ] Error handling tested
- [ ] Mobile responsiveness verified
- [ ] Security audit completed (see SECURITY.md)

## Monitoring

### Recommended Tools

1. **Vercel Analytics**: Monitor page views and performance
2. **Supabase Dashboard**: Track database queries and usage
3. **Resend Dashboard**: Monitor email delivery
4. **FlowScan**: Track on-chain transactions

### Key Metrics to Monitor

- Payment link creation rate
- Payment success rate
- Average transaction time
- Email delivery rate
- Dashboard load time

## Support

For issues or questions:

- Check [Flow Documentation](https://developers.flow.com)
- Visit [Flow Discord](https://discord.gg/flow)
- Review Supabase and Resend documentation

---

**Built on Flow** 🌊

