import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Only create client if we have valid credentials
export const supabase = (supabaseUrl && supabaseAnonKey && !supabaseUrl.includes('placeholder')) 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Database types
export interface User {
  id: string;
  wallet_address: string;
  email?: string;
  created_at: string;
}

export interface PaymentLink {
  id: string;
  merchant_id: string;
  product_name: string;
  description: string;
  amount: string;
  token: 'FLOW' | 'USDC';
  redirect_url?: string;
  status: 'active' | 'inactive';
  created_at: string;
}

export interface Payment {
  id: string;
  link_id: string;
  payer_address: string;
  amount: string;
  token: 'FLOW' | 'USDC';
  tx_hash: string;
  status: 'pending' | 'completed' | 'failed';
  paid_at: string;
}

