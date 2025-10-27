import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Only create client if we have valid credentials
export const supabase = (supabaseUrl && supabaseAnonKey && !supabaseUrl.includes('placeholder')) 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Helper function to check if database is configured
export const isDatabaseConfigured = () => {
  return supabase !== null;
};

// Helper function to get database configuration status
export const getDatabaseStatus = () => {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    return { configured: false, error: "NEXT_PUBLIC_SUPABASE_URL is not set" };
  }
  if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return { configured: false, error: "NEXT_PUBLIC_SUPABASE_ANON_KEY is not set" };
  }
  if (process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder')) {
    return { configured: false, error: "NEXT_PUBLIC_SUPABASE_URL contains placeholder value" };
  }
  return { configured: true, error: null };
};

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

export interface Transfer {
  id: string;
  sender_id: string;
  sender_address: string;
  recipient_email?: string;
  amount: number;
  token: 'FLOW' | 'USDC';
  claim_token: string;
  claim_link: string;
  note?: string;
  status: 'pending' | 'claimed' | 'refunded' | 'expired';
  escrow_tx_hash?: string;
  claim_tx_hash?: string;
  claimed_by_address?: string;
  claimed_at?: string;
  expires_at: string;
  created_at: string;
  updated_at: string;
}

