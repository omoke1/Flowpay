-- FlowPay Database Schema
-- Run this SQL in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  wallet_address TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE,
  wallet_type TEXT DEFAULT 'external' CHECK (wallet_type IN ('external', 'managed')),
  flow_port_user_id TEXT, -- For Flow Port managed wallets
  display_name TEXT,
  avatar_url TEXT,
  is_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Payment Links table
CREATE TABLE IF NOT EXISTS payment_links (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  merchant_id UUID REFERENCES users(id) ON DELETE CASCADE,
  product_name TEXT NOT NULL,
  description TEXT,
  amount TEXT NOT NULL,
  token TEXT NOT NULL CHECK (token IN ('FLOW', 'USDC')),
  redirect_url TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Payments table
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  link_id UUID REFERENCES payment_links(id) ON DELETE CASCADE,
  payer_address TEXT NOT NULL,
  amount TEXT NOT NULL,
  token TEXT NOT NULL CHECK (token IN ('FLOW', 'USDC')),
  tx_hash TEXT NOT NULL UNIQUE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
  paid_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_payment_links_merchant ON payment_links(merchant_id);
CREATE INDEX IF NOT EXISTS idx_payment_links_status ON payment_links(status);
CREATE INDEX IF NOT EXISTS idx_payments_link ON payments(link_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_tx_hash ON payments(tx_hash);

-- Row Level Security (RLS) Policies

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Users: Users can read and update their own data, allow anonymous creation
CREATE POLICY "Users can view own data" ON users
  FOR SELECT USING (auth.uid()::text = id::text);

CREATE POLICY "Users can update own data" ON users
  FOR UPDATE USING (auth.uid()::text = id::text);

-- Allow anonymous user creation for wallet-based registration
CREATE POLICY "Allow anonymous user creation" ON users
  FOR INSERT WITH CHECK (true);

-- Allow users to view their own data by wallet address
CREATE POLICY "Users can view by wallet address" ON users
  FOR SELECT USING (true);

-- Payment Links: Merchants can manage their own links, anyone can view active links
CREATE POLICY "Merchants can view own links" ON payment_links
  FOR SELECT USING (merchant_id::text = auth.uid()::text);

CREATE POLICY "Anyone can view active links" ON payment_links
  FOR SELECT USING (status = 'active');

CREATE POLICY "Merchants can create links" ON payment_links
  FOR INSERT WITH CHECK (merchant_id::text = auth.uid()::text);

CREATE POLICY "Merchants can update own links" ON payment_links
  FOR UPDATE USING (merchant_id::text = auth.uid()::text);

CREATE POLICY "Merchants can delete own links" ON payment_links
  FOR DELETE USING (merchant_id::text = auth.uid()::text);

-- Payments: Link owners can view payments, anyone can create payments
CREATE POLICY "Link owners can view payments" ON payments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM payment_links
      WHERE payment_links.id = payments.link_id
      AND payment_links.merchant_id::text = auth.uid()::text
    )
  );

CREATE POLICY "Anyone can create payments" ON payments
  FOR INSERT WITH CHECK (true);

CREATE POLICY "System can update payment status" ON payments
  FOR UPDATE USING (true);

-- Functions

-- Function to get merchant earnings
CREATE OR REPLACE FUNCTION get_merchant_earnings(merchant_uuid UUID)
RETURNS TABLE (
  total_flow NUMERIC,
  total_usdc NUMERIC,
  payment_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COALESCE(SUM(CASE WHEN p.token = 'FLOW' THEN p.amount::NUMERIC ELSE 0 END), 0) as total_flow,
    COALESCE(SUM(CASE WHEN p.token = 'USDC' THEN p.amount::NUMERIC ELSE 0 END), 0) as total_usdc,
    COUNT(*) as payment_count
  FROM payments p
  INNER JOIN payment_links pl ON p.link_id = pl.id
  WHERE pl.merchant_id = merchant_uuid
  AND p.status = 'completed';
END;
$$ LANGUAGE plpgsql;

-- Function to get recent payments for a merchant
CREATE OR REPLACE FUNCTION get_merchant_recent_payments(merchant_uuid UUID, limit_count INT DEFAULT 10)
RETURNS TABLE (
  payment_id UUID,
  product_name TEXT,
  amount TEXT,
  token TEXT,
  payer_address TEXT,
  tx_hash TEXT,
  paid_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id as payment_id,
    pl.product_name,
    p.amount,
    p.token,
    p.payer_address,
    p.tx_hash,
    p.paid_at
  FROM payments p
  INNER JOIN payment_links pl ON p.link_id = pl.id
  WHERE pl.merchant_id = merchant_uuid
  AND p.status = 'completed'
  ORDER BY p.paid_at DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

