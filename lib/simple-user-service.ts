// Simple user service to replace the complex wallet service
import { supabase } from "@/lib/supabase";

export interface SimpleUser {
  id: string;
  wallet_address: string;
  email?: string;
  display_name?: string;
  created_at: string;
}

export class SimpleUserService {
  // Get or create user by wallet address
  static async getOrCreateUser(walletAddress: string, userData?: {
    email?: string;
    display_name?: string;
  }): Promise<SimpleUser | null> {
    try {
      if (!supabase) {
        console.error("Supabase not configured");
        return null;
      }

      // First, try to get existing user
      const { data: existingUser, error: fetchError } = await supabase
        .from("users")
        .select("*")
        .eq("wallet_address", walletAddress)
        .single();

      if (existingUser && !fetchError) {
        return existingUser;
      }

      // Create new user if not found
      const { data: newUser, error: createError } = await supabase
        .from("users")
        .insert({
          wallet_address: walletAddress,
          email: userData?.email || null,
          display_name: userData?.display_name || null,
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (createError) {
        console.error("Error creating user:", createError);
        return null;
      }

      return newUser;
    } catch (error) {
      console.error("Error in getOrCreateUser:", error);
      return null;
    }
  }

  // Get user by wallet address
  static async getUserByWalletAddress(walletAddress: string): Promise<SimpleUser | null> {
    try {
      if (!supabase) {
        console.error("Supabase not configured");
        return null;
      }

      const { data: user, error } = await supabase
        .from("users")
        .select("*")
        .eq("wallet_address", walletAddress)
        .single();

      if (error) {
        console.error("Error fetching user:", error);
        return null;
      }

      return user;
    } catch (error) {
      console.error("Error in getUserByWalletAddress:", error);
      return null;
    }
  }

  // Get user by email
  static async getUserByEmail(email: string): Promise<SimpleUser | null> {
    try {
      if (!supabase) {
        console.error("Supabase not configured");
        return null;
      }

      const { data: user, error } = await supabase
        .from("users")
        .select("*")
        .eq("email", email)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No user found
          return null;
        }
        console.error("Error fetching user by email:", error);
        return null;
      }

      return user;
    } catch (error) {
      console.error("Error in getUserByEmail:", error);
      return null;
    }
  }
}
