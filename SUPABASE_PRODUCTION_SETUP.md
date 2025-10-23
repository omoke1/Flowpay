# Supabase Production Setup Guide

## Overview

This guide will help you set up Supabase for production use with FlowPay on mainnet.

## Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Sign up/Login to your account
3. Click "New Project"
4. Choose your organization
5. Enter project details:
   - **Name**: `flowpay-production`
   - **Database Password**: Generate a strong password
   - **Region**: Choose closest to your users
6. Click "Create new project"
7. Wait for the project to be created (2-3 minutes)

## Step 2: Get Your Supabase Credentials

1. Go to your project dashboard
2. Click on "Settings" in the sidebar
3. Click on "API" in the settings menu
4. Copy the following values:

### Project URL
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
```

### Anon Key (Public)
```
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Service Role Key (Private - Server Only)
```
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

⚠️ **Important**: The Service Role Key has admin privileges. Never expose it to the client side.

## Step 3: Set Up Database Tables

Run the following SQL in your Supabase SQL Editor:

```sql
-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  address TEXT UNIQUE NOT NULL,
  name TEXT,
  email TEXT,
  role TEXT DEFAULT 'user',
  account_funded_by TEXT,
  public_key TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create payment_links table
CREATE TABLE IF NOT EXISTS payment_links (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  merchant_id TEXT NOT NULL REFERENCES users(address),
  product_name TEXT NOT NULL,
  description TEXT,
  amount TEXT NOT NULL,
  token TEXT NOT NULL CHECK (token IN ('FLOW', 'USDC')),
  redirect_url TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create payments table
CREATE TABLE IF NOT EXISTS payments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  link_id UUID NOT NULL REFERENCES payment_links(id),
  payer_address TEXT NOT NULL,
  amount TEXT NOT NULL,
  token TEXT NOT NULL CHECK (token IN ('FLOW', 'USDC')),
  tx_hash TEXT UNIQUE NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
  paid_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_settings table
CREATE TABLE IF NOT EXISTS user_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id),
  webhook_url TEXT,
  webhook_secret TEXT,
  email_notifications BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create webhook_logs table
CREATE TABLE IF NOT EXISTS webhook_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id),
  webhook_url TEXT NOT NULL,
  payload JSONB NOT NULL,
  response_status INTEGER,
  response_body TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create session_tokens table
CREATE TABLE IF NOT EXISTS session_tokens (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id),
  token_hash TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_address ON users(address);
CREATE INDEX IF NOT EXISTS idx_payment_links_merchant_id ON payment_links(merchant_id);
CREATE INDEX IF NOT EXISTS idx_payments_link_id ON payments(link_id);
CREATE INDEX IF NOT EXISTS idx_payments_payer_address ON payments(payer_address);
CREATE INDEX IF NOT EXISTS idx_user_settings_user_id ON user_settings(user_id);
CREATE INDEX IF NOT EXISTS idx_webhook_logs_user_id ON webhook_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_session_tokens_user_id ON session_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_session_tokens_token_hash ON session_tokens(token_hash);

-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_tokens ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can manage their own data" ON users
  FOR ALL USING (true);

CREATE POLICY "Users can manage their own payment links" ON payment_links
  FOR ALL USING (true);

CREATE POLICY "Users can view their own payments" ON payments
  FOR ALL USING (true);

CREATE POLICY "Users can manage their own settings" ON user_settings
  FOR ALL USING (true);

CREATE POLICY "Users can view their own webhook logs" ON webhook_logs
  FOR SELECT USING (true);

CREATE POLICY "Users can manage their own session tokens" ON session_tokens
  FOR ALL USING (true);

-- Create updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payment_links_updated_at BEFORE UPDATE ON payment_links
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_settings_updated_at BEFORE UPDATE ON user_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_webhook_logs_updated_at BEFORE UPDATE ON webhook_logs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_session_tokens_updated_at BEFORE UPDATE ON session_tokens
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

## Step 4: Configure Environment Variables

Update your `.env.local` file with your Supabase credentials:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# Flow Configuration (Mainnet)
NEXT_PUBLIC_FLOW_NETWORK=mainnet
NEXT_PUBLIC_APP_URL=https://useflowpay.xyz

# Admin Configuration
NEXT_PUBLIC_ADMIN_PAYER_ADDRESS=0x...
ADMIN_PAYER_PRIVATE_KEY=xxx...
ADMIN_PAYER_ACCOUNT_INDEX=0
NEXT_PUBLIC_PLATFORM_FEE_RECIPIENT=0x...

# Admin Security
ADMIN_WALLET_ADDRESS=0x...
ADMIN_SESSION_SECRET=your-admin-session-secret-here
ADMIN_API_KEY=your-admin-api-key-here
NEXT_PUBLIC_ADMIN_DOMAIN=admin.useflowpay.xyz
```

## Step 5: Test the Setup

1. Start your development server: `npm run dev`
2. Visit `http://localhost:3000`
3. Connect your wallet
4. Check the browser console for any errors
5. Try creating a payment link
6. Verify data appears in your Supabase dashboard

## Step 6: Production Deployment

### Vercel Deployment

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard:
   - Go to your project settings
   - Click "Environment Variables"
   - Add all the variables from your `.env.local`
4. Deploy

### Environment Variables for Production

Make sure to set these in your production environment:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_FLOW_NETWORK=mainnet`
- `NEXT_PUBLIC_APP_URL=https://useflowpay.xyz`
- All admin and Flow configuration variables

## Troubleshooting

### Common Issues

1. **"Database not configured" error**
   - Check that all Supabase environment variables are set
   - Verify the URLs and keys are correct

2. **"User not found" error**
   - Make sure the `users` table exists
   - Check that RLS policies are set up correctly

3. **CORS errors**
   - Add your domain to Supabase allowed origins
   - Check Supabase project settings

4. **RLS policy errors**
   - Verify RLS policies are created
   - Check that policies allow the operations you need

### Verification Commands

Test your Supabase connection:

```bash
# Test environment variables
echo $NEXT_PUBLIC_SUPABASE_URL
echo $NEXT_PUBLIC_SUPABASE_ANON_KEY

# Test database connection (if you have supabase CLI)
supabase status
```

## Security Best Practices

1. **Never expose service role key** to client-side code
2. **Use RLS policies** to secure your data
3. **Rotate keys regularly** in production
4. **Monitor database usage** in Supabase dashboard
5. **Set up alerts** for unusual activity

## Support

If you encounter issues:

1. Check the Supabase dashboard for errors
2. Review the browser console for client-side errors
3. Check the server logs for API errors
4. Verify all environment variables are set correctly
5. Ensure the database tables are created properly

For additional help, refer to the [Supabase documentation](https://supabase.com/docs) or [FlowPay documentation](./README.md).
