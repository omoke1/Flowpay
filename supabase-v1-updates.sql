-- ============================================
-- FlowPay V1 Updates: Payment Methods & Transak
-- Run this SQL in your Supabase SQL Editor after the initial setup
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

-- Update payment_links to support payment method preferences
ALTER TABLE payment_links ADD COLUMN IF NOT EXISTS accept_crypto BOOLEAN DEFAULT true;
ALTER TABLE payment_links ADD COLUMN IF NOT EXISTS accept_fiat BOOLEAN DEFAULT true;

-- Create indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_payments_method ON payments(payment_method);
CREATE INDEX IF NOT EXISTS idx_payments_settlement_status ON payments(settlement_status);
CREATE INDEX IF NOT EXISTS idx_payments_transak_order ON payments(transak_order_id);

-- Add constraint to ensure at least one payment method is enabled
ALTER TABLE payment_links DROP CONSTRAINT IF EXISTS check_payment_methods;
ALTER TABLE payment_links ADD CONSTRAINT check_payment_methods 
  CHECK (accept_crypto = true OR accept_fiat = true);

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

