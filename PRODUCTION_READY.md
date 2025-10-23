# FlowPay Production Ready Setup

## ✅ Mock Data Removed - Real Supabase Integration

FlowPay has been updated to use **real Supabase data only** for production deployment on mainnet.

## 🚀 Quick Start

### 1. Set Up Supabase

```bash
# Run the interactive setup script
npm run setup-supabase
```

Or manually follow the detailed guide in `SUPABASE_PRODUCTION_SETUP.md`.

### 2. Configure Environment Variables

Your `.env.local` should include:

```env
# Supabase (Required)
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Flow Mainnet
NEXT_PUBLIC_FLOW_NETWORK=mainnet
NEXT_PUBLIC_APP_URL=https://useflowpay.xyz

# Admin Configuration
NEXT_PUBLIC_ADMIN_PAYER_ADDRESS=0x...
ADMIN_PAYER_PRIVATE_KEY=xxx...
# ... other admin variables
```

### 3. Set Up Database Tables

Run the SQL script from `SUPABASE_PRODUCTION_SETUP.md` in your Supabase SQL Editor.

### 4. Start Development

```bash
npm run dev
```

## 🔧 What's Changed

### ✅ Removed Mock Data
- ❌ Deleted `lib/mock-data-service.ts`
- ❌ Removed all mock data fallbacks from API endpoints
- ❌ Removed mock user creation

### ✅ Real Supabase Integration
- ✅ API endpoints now require proper Supabase configuration
- ✅ Clear error messages when database is not configured
- ✅ Production-ready database schema
- ✅ Proper RLS policies for security

### ✅ Production Configuration
- ✅ Mainnet Flow configuration by default
- ✅ Comprehensive setup documentation
- ✅ Automated setup script
- ✅ Environment variable validation

## 📊 Database Schema

The following tables are required:

- `users` - User accounts and wallet addresses
- `payment_links` - Payment link configurations
- `payments` - Transaction records
- `user_settings` - User preferences and webhooks
- `webhook_logs` - Webhook delivery logs
- `session_tokens` - User session management

## 🔒 Security Features

- **Row Level Security (RLS)** enabled on all tables
- **Service Role Key** properly secured (server-side only)
- **Environment variable validation**
- **Rate limiting** on API endpoints
- **Input validation** and sanitization

## 🚀 Deployment

### Vercel Deployment

1. Push code to GitHub
2. Connect repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

### Environment Variables for Production

Set these in your production environment:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
NEXT_PUBLIC_FLOW_NETWORK=mainnet
NEXT_PUBLIC_APP_URL=https://useflowpay.xyz
# ... all other configuration variables
```

## 🧪 Testing

### Local Testing

1. Start development server: `npm run dev`
2. Visit `http://localhost:3000`
3. Connect wallet (should create user record automatically)
4. Create payment links
5. Test payment flow
6. Verify data in Supabase dashboard

### Production Testing

1. Deploy to Vercel
2. Test with real Flow mainnet
3. Verify all API endpoints work
4. Test wallet connection and user creation
5. Test payment link creation and payments

## 📋 Checklist

Before going live:

- [ ] Supabase project created and configured
- [ ] Database tables created with proper schema
- [ ] Environment variables set in production
- [ ] Admin payer account configured with sufficient FLOW
- [ ] Platform fee recipient address set
- [ ] Domain configured (useflowpay.xyz)
- [ ] SSL certificate active
- [ ] All API endpoints tested
- [ ] Wallet connection tested
- [ ] Payment flow tested end-to-end

## 🆘 Troubleshooting

### Common Issues

1. **"Database not configured" error**
   - Check Supabase environment variables
   - Verify project URL and keys

2. **"User not found" error**
   - Ensure `users` table exists
   - Check RLS policies

3. **Wallet connection issues**
   - Verify Flow network configuration
   - Check Flow service status

4. **Payment failures**
   - Verify transaction verification
   - Check Flow account balances

### Support

- Check `SUPABASE_PRODUCTION_SETUP.md` for detailed instructions
- Review server logs for API errors
- Verify environment variables are set correctly
- Test with Supabase dashboard

## 🎉 Ready for Production!

FlowPay is now configured for real production use with:

- ✅ **Real Supabase database** (no mock data)
- ✅ **Mainnet Flow integration**
- ✅ **Production-ready security**
- ✅ **Comprehensive documentation**
- ✅ **Automated setup tools**

Deploy with confidence! 🚀
