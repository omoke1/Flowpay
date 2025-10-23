// Real database-integrated settings service for production use
import { supabase } from '@/lib/supabase';
import crypto from 'crypto';

interface UserSettings {
  id: string;
  wallet_address: string;
  name: string;
  email: string;
  dark_mode: boolean;
  email_notifications: boolean;
  public_key: string;
  secret_key: string;
  webhook_url: string;
  created_at: string;
  updated_at: string;
}

interface WebhookLog {
  id: string;
  user_id: string;
  event_type: string;
  payload: any;
  webhook_url: string;
  response_status: number | null;
  response_body: string | null;
  retry_count: number;
  max_retries: number;
  next_retry_at: string | null;
  status: 'pending' | 'delivered' | 'failed' | 'max_retries_reached';
  created_at: string;
  updated_at: string;
}

interface SessionToken {
  id: string;
  user_id: string;
  token_hash: string;
  expires_at: string;
  revoked_at: string | null;
  created_at: string;
}

interface WebhookLogInput {
  event_type: string;
  payload: any;
  webhook_url: string;
  response_status: number | null;
  response_body: string | null;
  retry_count: number;
  max_retries: number;
  next_retry_at: string | null;
  status: 'pending' | 'delivered' | 'failed' | 'max_retries_reached';
}

class RealSettingsService {
  private static instance: RealSettingsService;

  static getInstance(): RealSettingsService {
    if (!RealSettingsService.instance) {
      RealSettingsService.instance = new RealSettingsService();
    }
    return RealSettingsService.instance;
  }

  // Generate secure API keys
  generateApiKeys(): { publicKey: string; secretKey: string } {
    const publicKey = `pk_live_${this.generateSecureRandomString(12)}`;
    const secretKey = `sk_live_${this.generateSecureRandomString(32)}`;
    return { publicKey, secretKey };
  }

  private generateSecureRandomString(length: number): string {
    return crypto.randomBytes(length).toString('base64url');
  }

  // Get user settings from database
  async getUserSettings(walletAddress: string): Promise<UserSettings | null> {
    try {
      const { data, error } = await supabase
        .from('user_settings')
        .select('*')
        .eq('wallet_address', walletAddress)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No settings found, create default
          return await this.createDefaultSettings(walletAddress);
        }
        
        // Check if table doesn't exist
        if (error.message && error.message.includes('relation "user_settings" does not exist')) {
          console.warn('⚠️ user_settings table does not exist. Please run the SQL script in supabase-settings-tables.sql');
          // Return default settings without persisting to database
          return {
            id: 'temp-id',
            wallet_address: walletAddress,
            name: `User ${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`,
            email: '',
            dark_mode: true,
            email_notifications: true,
            public_key: `pk_live_${this.generateSecureRandomString(12)}`,
            secret_key: `sk_live_${this.generateSecureRandomString(32)}`,
            webhook_url: '',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };
        }
        
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error fetching user settings:', error);
      throw error;
    }
  }

  // Create default settings for new user
  private async createDefaultSettings(walletAddress: string): Promise<UserSettings> {
    const { publicKey, secretKey } = this.generateApiKeys();
    
    const defaultSettings = {
      wallet_address: walletAddress,
      name: `User ${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`,
      email: '',
      dark_mode: true,
      email_notifications: true,
      public_key: publicKey,
      secret_key: secretKey,
      webhook_url: '',
    };

    const { data, error } = await supabase
      .from('user_settings')
      .insert(defaultSettings)
      .select()
      .single();

    if (error) {
      console.error('Error creating default settings:', error);
      throw error;
    }

    return data;
  }

  // Update user settings in database
  async updateUserSettings(walletAddress: string, updates: Partial<UserSettings>): Promise<UserSettings> {
    try {
      const { data, error } = await supabase
        .from('user_settings')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('wallet_address', walletAddress)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error updating user settings:', error);
      throw error;
    }
  }

  // Rotate API keys in database
  async rotateApiKeys(walletAddress: string): Promise<{ publicKey: string; secretKey: string }> {
    try {
      const { publicKey, secretKey } = this.generateApiKeys();
      
      await this.updateUserSettings(walletAddress, {
        public_key: publicKey,
        secret_key: secretKey,
      });

      return { publicKey, secretKey };
    } catch (error) {
      console.error('Error rotating API keys:', error);
      throw error;
    }
  }

  // Add webhook log to database
  async addWebhookLog(userId: string, log: WebhookLogInput): Promise<WebhookLog> {
    try {
      const { data, error } = await supabase
        .from('webhook_logs')
        .insert({
          user_id: userId,
          ...log,
        })
        .select()
        .single();

      if (error) {
        // Check if table doesn't exist
        if (error.message && error.message.includes('relation "webhook_logs" does not exist')) {
          console.warn('⚠️ webhook_logs table does not exist. Webhook logging disabled.');
          // Return a mock webhook log
          return {
            id: 'temp-log-id',
            user_id: userId,
            event_type: log.event_type,
            payload: log.payload,
            webhook_url: log.webhook_url,
            response_status: log.response_status,
            response_body: log.response_body,
            retry_count: log.retry_count,
            max_retries: log.max_retries,
            next_retry_at: log.next_retry_at,
            status: log.status,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };
        }
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error adding webhook log:', error);
      throw error;
    }
  }

  // Get webhook logs from database
  async getWebhookLogs(walletAddress: string, limit: number = 100): Promise<WebhookLog[]> {
    try {
      // First get user ID
      const { data: user } = await supabase
        .from('user_settings')
        .select('id')
        .eq('wallet_address', walletAddress)
        .single();

      if (!user) {
        return [];
      }

      const { data, error } = await supabase
        .from('webhook_logs')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        // Check if table doesn't exist
        if (error.message && error.message.includes('relation "webhook_logs" does not exist')) {
          console.warn('⚠️ webhook_logs table does not exist. Returning empty logs.');
          return [];
        }
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching webhook logs:', error);
      throw error;
    }
  }

  // Revoke all sessions for a user
  async revokeSessions(walletAddress: string): Promise<void> {
    try {
      // Get user ID
      const { data: user } = await supabase
        .from('user_settings')
        .select('id')
        .eq('wallet_address', walletAddress)
        .single();

      if (!user) {
        throw new Error('User not found');
      }

      // Mark all active sessions as revoked
      const { error } = await supabase
        .from('session_tokens')
        .update({ revoked_at: new Date().toISOString() })
        .eq('user_id', user.id)
        .is('revoked_at', null);

      if (error) {
        throw error;
      }

      console.log(`Revoked all sessions for user ${walletAddress}`);
    } catch (error) {
      console.error('Error revoking sessions:', error);
      throw error;
    }
  }

  // Add session token to blacklist
  async addSessionToken(userId: string, tokenHash: string, expiresAt: Date): Promise<void> {
    try {
      const { error } = await supabase
        .from('session_tokens')
        .insert({
          user_id: userId,
          token_hash: tokenHash,
          expires_at: expiresAt.toISOString(),
        });

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('Error adding session token:', error);
      throw error;
    }
  }

  // Check if token is blacklisted
  async isTokenBlacklisted(tokenHash: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('session_tokens')
        .select('id')
        .eq('token_hash', tokenHash)
        .is('revoked_at', null)
        .gt('expires_at', new Date().toISOString())
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      return !!data;
    } catch (error) {
      console.error('Error checking token blacklist:', error);
      return false;
    }
  }

  // Clean up expired tokens
  async cleanupExpiredTokens(): Promise<void> {
    try {
      const { error } = await supabase
        .from('session_tokens')
        .delete()
        .lt('expires_at', new Date().toISOString());

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('Error cleaning up expired tokens:', error);
    }
  }
}

export const realSettingsService = RealSettingsService.getInstance();
