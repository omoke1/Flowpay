-- ============================================
-- FlowPay Complete Database Migration
-- Run this SQL in your Supabase SQL Editor
-- This includes all updates for V1 + Flow Port integration
-- ============================================

-- ============================================
-- PART 1: Update Users Table for Flow Port
-- ============================================

-- Add wallet_type column
ALTER TABLE users ADD COLUMN IF NOT EXISTS wallet_type TEXT DEFAULT 'external' CHECK (wallet_type IN ('external', 'managed'));

-- Add flow_port_user_id for Flow Port managed wallets
ALTER TABLE users ADD COLUMN IF NOT EXISTS flow_port_user_id TEXT;

-- Add display_name
ALTER TABLE users ADD COLUMN IF NOT EXISTS display_name TEXT;

-- Add avatar_url
ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- Add is_verified
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT FALSE;

-- Add updated_at timestamp
ALTER TABLE users ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Make email column unique if not already
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'users_email_key'
    ) THEN
        ALTER TABLE users ADD CONSTRAINT users_email_key UNIQUE (email);
    END IF;
END $$;

-- ============================================
-- PART 2: Update Payments Table for Payment Methods
-- ============================================

-- Add payment_method column to payments table
ALTER TABLE payments ADD COLUMN IF NOT EXISTS payment_method TEXT DEFAULT 'crypto' CHECK (payment_method IN ('crypto', 'fiat'));

-- Add transak_order_id for fiat payments
ALTER TABLE payments ADD COLUMN IF NOT EXISTS transak_order_id TEXT;

-- Add settlement_status column
ALTER TABLE payments ADD COLUMN IF NOT EXISTS settlement_status TEXT DEFAULT 'pending' CHECK (settlement_status IN ('pending', 'completed', 'failed'));

-- Add fiat_amount and fiat_currency columns
ALTER TABLE payments ADD COLUMN IF NOT EXISTS fiat_amount TEXT;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS fiat_currency TEXT DEFAULT 'USD';

-- ============================================
-- PART 3: Update Payment Links for Payment Methods
-- ============================================

-- Update payment_links to support payment method preferences
ALTER TABLE payment_links ADD COLUMN IF NOT EXISTS accept_crypto BOOLEAN DEFAULT true;
ALTER TABLE payment_links ADD COLUMN IF NOT EXISTS accept_fiat BOOLEAN DEFAULT true;

-- ============================================
-- PART 4: Create Indexes for Performance
-- ============================================

-- Indexes for payments table
CREATE INDEX IF NOT EXISTS idx_payments_method ON payments(payment_method);
CREATE INDEX IF NOT EXISTS idx_payments_settlement_status ON payments(settlement_status);
CREATE INDEX IF NOT EXISTS idx_payments_transak_order ON payments(transak_order_id);

-- Indexes for users table
CREATE INDEX IF NOT EXISTS idx_users_wallet_type ON users(wallet_type);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- ============================================
-- PART 5: Add Constraints
-- ============================================

-- Add constraint to ensure at least one payment method is enabled
ALTER TABLE payment_links DROP CONSTRAINT IF EXISTS check_payment_methods;
ALTER TABLE payment_links ADD CONSTRAINT check_payment_methods 
  CHECK (accept_crypto = true OR accept_fiat = true);

-- ============================================
-- PART 6: Update Functions
-- ============================================

-- Update get_merchant_earnings function to include payment method breakdown
CREATE OR REPLACE FUNCTION get_merchant_earnings_v2(merchant_uuid UUID)
RETURNS TABLE (
  total_flow NUMERIC,
  total_usdc NUMERIC,
  total_crypto_payments BIGINT,
  total_fiat_payments BIGINT,
  payment_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COALESCE(SUM(CASE WHEN p.token = 'FLOW' AND p.payment_method = 'crypto' THEN p.amount::NUMERIC ELSE 0 END), 0) as total_flow,
    COALESCE(SUM(CASE WHEN p.token IN ('USDC', 'USDC.e') THEN p.amount::NUMERIC ELSE 0 END), 0) as total_usdc,
    COUNT(CASE WHEN p.payment_method = 'crypto' THEN 1 END) as total_crypto_payments,
    COUNT(CASE WHEN p.payment_method = 'fiat' THEN 1 END) as total_fiat_payments,
    COUNT(*) as payment_count
  FROM payments p
  INNER JOIN payment_links pl ON p.link_id = pl.id
  WHERE pl.merchant_id = merchant_uuid
  AND p.status = 'completed';
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- PART 7: Verify Migration
-- ============================================

-- You can run these queries after migration to verify:
-- SELECT column_name, data_type, column_default FROM information_schema.columns WHERE table_name = 'users' ORDER BY ordinal_position;
-- SELECT column_name, data_type, column_default FROM information_schema.columns WHERE table_name = 'payments' ORDER BY ordinal_position;
-- SELECT column_name, data_type, column_default FROM information_schema.columns WHERE table_name = 'payment_links' ORDER BY ordinal_position;


