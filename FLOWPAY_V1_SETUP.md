# FlowPay V1 - Setup Guide

## 🚀 Quick Start

FlowPay is a unified crypto + fiat payment platform built on Flow blockchain with Transak integration.

### Prerequisites

- Node.js 18+ and npm
- Supabase account
- Transak account (staging or production)
- Resend account (for emails)
- Flow testnet wallet

---

## 📦 Installation

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local
```

---

## 🔧 Environment Configuration

### 1. Transak Setup

1. Sign up at [Transak](https://transak.com)
2. Get your API credentials from the dashboard
3. Add to `.env.local`:

```env
NEXT_PUBLIC_TRANSAK_API_KEY=your_api_key_here
TRANSAK_API_SECRET=your_api_secret_here
NEXT_PUBLIC_TRANSAK_ENV=STAGING  # or PRODUCTION
```

### 2. Supabase Setup

1. Create a new project at [Supabase](https://supabase.com)
2. Run the SQL schema:
   - Open SQL Editor in Supabase
   - Run `supabase-setup.sql`
   - Then run `supabase-v1-updates.sql`
3. Add to `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

### 3. Resend Setup

1. Sign up at [Resend](https://resend.com)
2. Get your API key
3. Add to `.env.local`:

```env
RESEND_API_KEY=your_resend_api_key
```

### 4. Flow Configuration

```env
NEXT_PUBLIC_FLOW_NETWORK=testnet
NEXT_PUBLIC_FLOW_ACCESS_NODE=https://rest-testnet.onflow.org
```

### 5. App URL

```env
NEXT_PUBLIC_APP_URL=http://localhost:3000  # Change for production
```

---

## 🗄️ Database Setup

### Run SQL Migrations

1. **Initial Setup** - Run `supabase-setup.sql` in Supabase SQL Editor
2. **V1 Updates** - Run `supabase-v1-updates.sql` for payment methods support

### Verify Tables

After running the SQL, verify these tables exist:
- `users` - User accounts with wallet addresses
- `payment_links` - Merchant payment links
- `payments` - Payment transactions

---

## 🔗 Transak Webhook Configuration

### Local Development

1. Install Transak CLI (if available) or use ngrok:
```bash
ngrok http 3000
```

2. Copy the ngrok URL and add to Transak dashboard:
```
https://your-ngrok-url.ngrok.io/api/transak/webhook
```

### Production

Set webhook URL in Transak dashboard:
```
https://your-domain.com/api/transak/webhook
```

---

## 🏃 Running the App

### Development Mode

```bash
npm run dev
```

Visit `http://localhost:3000`

### Production Build

```bash
npm run build
npm start
```

---

## 🧪 Testing

### Test Crypto Payments

1. Connect Flow wallet (Blocto, Lilico, etc.)
2. Create a payment link
3. Visit checkout page
4. Select "Pay with Crypto"
5. Complete transaction

### Test Fiat Payments

1. Create a payment link with "Accept Card Payments" enabled
2. Visit checkout page
3. Select "Pay with Card"
4. Use Transak test cards (staging environment):
   - Card: `4242 4242 4242 4242`
   - Expiry: Any future date
   - CVC: Any 3 digits

---

## 📁 Project Structure

```
flowpay/
├── app/
│   ├── checkout/[paymentId]/    # New unified checkout
│   ├── dashboard/               # Merchant dashboard
│   ├── api/
│   │   ├── transak/            # Transak integration
│   │   ├── payment-links/      # Payment link management
│   │   └── payments/           # Payment processing
│   └── page.tsx                # Landing page
├── components/
│   ├── checkout/               # Checkout components
│   │   ├── PaymentMethodSelector.tsx
│   │   ├── CryptoPay.tsx
│   │   ├── FiatPay.tsx
│   │   └── PaymentConfirmation.tsx
│   ├── dashboard/              # Dashboard components
│   └── ui/                     # UI components
├── lib/
│   ├── transak.ts             # Transak service
│   ├── flow-config.ts         # Flow blockchain config
│   ├── wallet-service.ts      # Wallet management
│   ├── supabase.ts            # Database client
│   └── resend.ts              # Email service
└── supabase-v1-updates.sql    # Database schema updates
```

---

## 🎯 Key Features

### For Merchants

- ✅ Create payment links with crypto and/or fiat options
- ✅ Accept FLOW and USDC.e directly
- ✅ Accept card payments via Transak (auto-converts to USDC.e)
- ✅ View payment history and analytics
- ✅ Email notifications for all payments

### For Customers

- ✅ Choose between crypto or card payment
- ✅ Simple checkout experience
- ✅ Email receipts
- ✅ Transaction confirmation on-chain

---

## 🔐 Security

- Webhook signature verification for Transak
- Row Level Security (RLS) in Supabase
- Secure environment variable handling
- HTTPS required for production

---

## 🚀 Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

### Environment Variables in Production

Make sure to set all environment variables in your hosting platform:
- Transak credentials
- Supabase credentials
- Resend API key
- App URL (production domain)

### Post-Deployment

1. Update Transak webhook URL to production domain
2. Test both crypto and fiat payment flows
3. Verify email notifications
4. Check database connections

---

## 📝 Usage Guide

### Creating a Payment Link

1. Connect your Flow wallet
2. Go to Dashboard → Create Payment Link
3. Fill in:
   - Product name
   - Amount (USD)
   - Description
   - Payment methods (Crypto/Card/Both)
   - Optional redirect URL
4. Click "Create"
5. Share the generated checkout URL

### Processing Payments

**Crypto Payments:**
- Customer connects Flow wallet
- Pays with FLOW or USDC.e
- Funds sent directly to merchant wallet
- Transaction recorded on-chain

**Fiat Payments:**
- Customer clicks "Pay with Card"
- Transak modal opens
- Completes card payment
- Transak converts to USDC.e
- Funds sent to merchant wallet
- Webhook updates payment status

---

## 🐛 Troubleshooting

### Transak Widget Not Opening

- Check `NEXT_PUBLIC_TRANSAK_API_KEY` is set
- Verify API key is valid
- Check browser console for errors

### Webhook Not Receiving Events

- Verify webhook URL in Transak dashboard
- Check webhook secret matches
- Test with ngrok for local development

### Database Errors

- Verify Supabase credentials
- Check RLS policies are set up
- Run SQL migrations in correct order

### Flow Wallet Connection Issues

- Ensure using Flow testnet
- Check FCL configuration
- Try different wallet (Blocto, Lilico)

---

## 📚 Additional Resources

- [Transak Documentation](https://docs.transak.com)
- [Flow Documentation](https://developers.flow.com)
- [Supabase Documentation](https://supabase.com/docs)
- [Next.js Documentation](https://nextjs.org/docs)

---

## 🎉 Success Checklist

- [ ] Environment variables configured
- [ ] Supabase database set up
- [ ] Transak webhook configured
- [ ] Can create payment links
- [ ] Can pay with crypto
- [ ] Can pay with card (Transak)
- [ ] Emails being sent
- [ ] Dashboard showing payments
- [ ] Both payment methods working

---

## 🆘 Support

For issues or questions:
1. Check this setup guide
2. Review error logs in browser console
3. Check Supabase logs
4. Verify Transak dashboard for webhook events

---

**Built with ❤️ for the Flow Blockchain Hackathon**

