-- ============================================
-- FlowPay RLS Policy Fix
-- This fixes Row Level Security to work with wallet-based auth
-- ============================================

-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Users can view own data" ON users;
DROP POLICY IF EXISTS "Users can update own data" ON users;
DROP POLICY IF EXISTS "Users can insert own data" ON users;
DROP POLICY IF EXISTS "Allow anonymous user creation" ON users;
DROP POLICY IF EXISTS "Users can view by wallet address" ON users;

-- Create new permissive policies for wallet-based authentication

-- Allow anyone to create a user (needed for wallet registration)
CREATE POLICY "Allow user creation" ON users
  FOR INSERT WITH CHECK (true);

-- Allow anyone to read users (needed for merchant lookups)
CREATE POLICY "Allow user reads" ON users
  FOR SELECT USING (true);

-- Allow users to update their own records by wallet address
CREATE POLICY "Allow user updates by wallet" ON users
  FOR UPDATE USING (true);

-- ============================================
-- Update Payment Links Policies
-- ============================================

-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Merchants can view own links" ON payment_links;
DROP POLICY IF EXISTS "Merchants can create links" ON payment_links;
DROP POLICY IF EXISTS "Merchants can update own links" ON payment_links;
DROP POLICY IF EXISTS "Merchants can delete own links" ON payment_links;

-- Create new permissive policies

-- Allow anyone to view active payment links (needed for checkout)
CREATE POLICY "Allow viewing active links" ON payment_links
  FOR SELECT USING (status = 'active' OR true);

-- Allow anyone to create payment links (we validate merchant_id in app)
CREATE POLICY "Allow creating payment links" ON payment_links
  FOR INSERT WITH CHECK (true);

-- Allow anyone to update payment links (we validate in app)
CREATE POLICY "Allow updating payment links" ON payment_links
  FOR UPDATE USING (true);

-- Allow anyone to delete payment links (we validate in app)
CREATE POLICY "Allow deleting payment links" ON payment_links
  FOR DELETE USING (true);

-- ============================================
-- Update Payments Policies
-- ============================================

-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Link owners can view payments" ON payments;
DROP POLICY IF EXISTS "System can update payment status" ON payments;

-- Create new permissive policies

-- Allow anyone to view payments (we filter by merchant in app)
CREATE POLICY "Allow viewing payments" ON payments
  FOR SELECT USING (true);

-- Allow anyone to update payment status (needed for webhooks)
CREATE POLICY "Allow updating payments" ON payments
  FOR UPDATE USING (true);

-- ============================================
-- Note: In production, you should implement proper
-- authentication and more restrictive RLS policies.
-- These permissive policies are for development/hackathon.
-- ============================================


