import { fcl } from "./flow-config";
import { supabase, isDatabaseConfigured, getDatabaseStatus } from "./supabase";
import bcrypt from "bcryptjs";

export interface WalletUser {
  id: string;
  wallet_address: string;
  email?: string;
  wallet_type: 'external' | 'managed';
  flow_port_user_id?: string;
  display_name?: string;
  avatar_url?: string;
  is_verified: boolean;
  password_hash?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateUserData {
  email?: string;
  wallet_type?: 'external' | 'managed';
  flow_port_user_id?: string;
  display_name?: string;
  avatar_url?: string;
  is_verified?: boolean;
  password?: string; // For creating new users with password
}

export interface FlowPortUser {
  address: string;
  email?: string;
  name?: string;
  avatar?: string;
  verified: boolean;
}

export class WalletService {
  /**
   * Authenticate user with Flow Port (email-based registration)
   */
  static async authenticateWithFlowPort(): Promise<FlowPortUser | null> {
    try {
      if (typeof window === "undefined") return null;
      
      // FCL should already be initialized by FlowProvider
      // Authenticate with Flow Port
      const user = await fcl.authenticate();
      
      if (user && user.addr) {
        return {
          address: user.addr,
          email: (user as any).email || '',
          name: (user as any).name || '',
          avatar: (user as any).avatar || '',
          verified: (user as any).verified || false
        };
      }
      
      return null;
    } catch (error) {
      console.error("Flow Port authentication error:", error);
      return null;
    }
  }

  /**
   * Authenticate user with external wallet (existing flow)
   */
  static async authenticateWithExternalWallet(): Promise<string | null> {
    try {
      if (typeof window === "undefined") return null;
      
      // FCL should already be initialized by FlowProvider
      // Authenticate with external wallet
      const user = await fcl.authenticate();
      
      if (user && user.addr) {
        return user.addr;
      }
      
      return null;
    } catch (error) {
      console.error("External wallet authentication error:", error);
      return null;
    }
  }

  /**
   * Authenticate user with email and password
   */
  static async authenticateUser(email: string, password: string): Promise<WalletUser | null> {
    try {
      if (!isDatabaseConfigured()) {
        const status = getDatabaseStatus();
        console.error("Database configuration error:", status.error);
        throw new Error(`Database not configured. ${status.error}. Please set up Supabase environment variables.`);
      }

      const supabaseClient = supabase!;

      // Find user by email
      const { data: user, error: fetchError } = await supabaseClient
        .from("users")
        .select("*")
        .eq("email", email)
        .single();

      if (fetchError || !user) {
        console.log("User not found with email:", email);
        return null;
      }

      // Verify password
      if (!user.password_hash) {
        console.log("User has no password set");
        return null;
      }

      const isValidPassword = await bcrypt.compare(password, user.password_hash);
      if (!isValidPassword) {
        console.log("Invalid password for user:", email);
        return null;
      }

      console.log("User authenticated successfully:", user.email);
      return user as WalletUser;
    } catch (error) {
      console.error("Error in authenticateUser:", error);
      return null;
    }
  }

  /**
   * Get or create user in database
   */
  static async getOrCreateUser(
    walletAddress: string, 
    userData?: CreateUserData
  ): Promise<WalletUser | null> {
    try {
      if (!isDatabaseConfigured()) {
        const status = getDatabaseStatus();
        console.error("Database configuration error:", status.error);
        throw new Error(`Database not configured. ${status.error}. Please set up Supabase environment variables.`);
      }

      // At this point, supabase is guaranteed to be non-null due to isDatabaseConfigured() check
      const supabaseClient = supabase!;

      // First, try to find existing user by wallet address
      const { data: existingUser, error: fetchError } = await supabaseClient
        .from("users")
        .select("*")
        .eq("wallet_address", walletAddress)
        .single();

      if (existingUser && !fetchError) {
        return existingUser as WalletUser;
      }

      // If user doesn't exist, create new user
      const insertData: any = {
        wallet_address: walletAddress,
        email: userData?.email,
        wallet_type: userData?.wallet_type || 'external',
        flow_port_user_id: userData?.flow_port_user_id,
        display_name: userData?.display_name,
        avatar_url: userData?.avatar_url,
        is_verified: userData?.is_verified || false
      };

      // Hash password if provided
      if (userData?.password) {
        const saltRounds = 12;
        insertData.password_hash = await bcrypt.hash(userData.password, saltRounds);
      }

      const { data: newUser, error: createError } = await supabaseClient
        .from("users")
        .insert(insertData)
        .select()
        .single();

      if (createError) {
        console.error("Error creating user:", createError);
        return null;
      }

      return newUser as WalletUser;
    } catch (error) {
      console.error("Error in getOrCreateUser:", error);
      return null;
    }
  }

  /**
   * Update user information
   */
  static async updateUser(
    userId: string, 
    updates: Partial<WalletUser>
  ): Promise<WalletUser | null> {
    try {
      if (!supabase) {
        console.warn("Supabase not configured, cannot update user");
        return null;
      }

      const { data, error } = await supabase
        .from("users")
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq("id", userId)
        .select()
        .single();

      if (error) {
        console.error("Error updating user:", error);
        return null;
      }

      return data as WalletUser;
    } catch (error) {
      console.error("Error in updateUser:", error);
      return null;
    }
  }

  /**
   * Get user by wallet address
   */
  static async getUserByWalletAddress(walletAddress: string): Promise<WalletUser | null> {
    try {
      if (!supabase) {
        return null;
      }

      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("wallet_address", walletAddress)
        .single();

      if (error) {
        console.error("Error fetching user:", error);
        return null;
      }

      return data as WalletUser;
    } catch (error) {
      console.error("Error in getUserByWalletAddress:", error);
      return null;
    }
  }

  /**
   * Get user by email (for managed wallets)
   */
  static async getUserByEmail(email: string): Promise<WalletUser | null> {
    try {
      if (!supabase) {
        return null;
      }

      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("email", email)
        .single();

      if (error) {
        console.error("Error fetching user by email:", error);
        return null;
      }

      return data as WalletUser;
    } catch (error) {
      console.error("Error in getUserByEmail:", error);
      return null;
    }
  }

  /**
   * Disconnect user (logout)
   */
  static async disconnect(): Promise<void> {
    try {
      if (typeof window === "undefined") return;
      
      await fcl.unauthenticate();
    } catch (error) {
      console.error("Error disconnecting user:", error);
    }
  }

  /**
   * Get current authenticated user
   */
  static async getCurrentUser(): Promise<any> {
    try {
      if (typeof window === "undefined") return null;
      
      return await fcl.currentUser();
    } catch (error) {
      console.error("Error getting current user:", error);
      return null;
    }
  }

  /**
   * Check if user is authenticated
   */
  static async isAuthenticated(): Promise<boolean> {
    try {
      if (typeof window === "undefined") return false;
      
      const user = await fcl.currentUser();
      return user && (user as any).addr;
    } catch (error) {
      console.error("Error checking authentication:", error);
      return false;
    }
  }

  /**
   * Get user's wallet balance
   */
  static async getWalletBalance(address: string, token: 'FLOW' | 'USDC'): Promise<string> {
    try {
      if (typeof window === "undefined") return "0";
      
      // This would need to be implemented with proper Flow scripts
      // For now, return 0 balance
      return "0";
    } catch (error) {
      console.error("Error getting wallet balance:", error);
      return "0";
    }
  }
}
