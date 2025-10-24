// Simple user service to replace the complex wallet service
import { supabase } from "@/lib/supabase";
import { decryptRecoveryInfo, generateEncryptionPassword } from "@/lib/encryption-utils";

export interface SimpleUser {
  id: string;
  wallet_address: string;
  email?: string;
  display_name?: string;
  created_at: string;
  encrypted_recovery_info?: string; // Encrypted recovery information
  recovery_info?: {
    seedPhrase: string;
    privateKey: string;
    publicKey: string;
    derivationPath: string;
    createdAt: string;
  };
}

export class SimpleUserService {
  // Get or create user by wallet address
  static async getOrCreateUser(walletAddress: string, userData?: {
    email?: string;
    display_name?: string;
    encrypted_recovery_info?: string;
    recovery_info?: {
      seedPhrase: string;
      privateKey: string;
      publicKey: string;
      derivationPath: string;
      createdAt: string;
    };
  }): Promise<SimpleUser | null> {
    try {
      if (!supabase) {
        console.error("Supabase not configured - returning mock user");
        // Return a mock user for development when Supabase is not configured
        return {
          id: `mock_${Date.now()}`,
          wallet_address: walletAddress,
          email: userData?.email || null,
          display_name: userData?.display_name || null,
          created_at: new Date().toISOString(),
          // Note: recovery_info not stored in mock user for now
        };
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
          encrypted_recovery_info: userData?.encrypted_recovery_info || null,
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
        console.error("Supabase not configured - returning mock user");
        // Return a mock user for development when Supabase is not configured
        return {
          id: `mock_${Date.now()}`,
          wallet_address: walletAddress,
          email: null,
          display_name: null,
          created_at: new Date().toISOString(),
        };
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
        console.error("Supabase not configured - returning null for email lookup");
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

  // Decrypt recovery information for a user
  static async getDecryptedRecoveryInfo(walletAddress: string, userEmail: string): Promise<any | null> {
    try {
      if (!supabase) {
        console.error("Supabase not configured - cannot decrypt recovery info");
        return null;
      }

      // Get user with encrypted recovery info
      const { data: user, error } = await supabase
        .from("users")
        .select("encrypted_recovery_info")
        .eq("wallet_address", walletAddress)
        .single();

      if (error || !user || !user.encrypted_recovery_info) {
        console.error("Error fetching encrypted recovery info:", error);
        return null;
      }

      try {
        // Generate encryption password based on user email + server secret
        const serverSecret = process.env.ENCRYPTION_SECRET || 'default-secret-change-in-production';
        const encryptionPassword = generateEncryptionPassword(userEmail, serverSecret);
        
        // Decrypt the recovery information
        const decryptedInfo = decryptRecoveryInfo(user.encrypted_recovery_info, encryptionPassword);
        
        return decryptedInfo;
      } catch (decryptError) {
        console.error("Error decrypting recovery info:", decryptError);
        return null;
      }
    } catch (error) {
      console.error("Error in getDecryptedRecoveryInfo:", error);
      return null;
    }
  }
}
