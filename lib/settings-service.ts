// Settings service for managing user preferences and API keys
// This handles user settings, API keys, and webhook logs

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
  response_status: number;
  response_body: string;
  created_at: string;
}

class SettingsService {
  private static instance: SettingsService;
  private settings: Map<string, UserSettings> = new Map();
  private webhookLogs: Map<string, WebhookLog[]> = new Map();

  static getInstance(): SettingsService {
    if (!SettingsService.instance) {
      SettingsService.instance = new SettingsService();
    }
    return SettingsService.instance;
  }

  // Generate API keys
  generateApiKeys(): { publicKey: string; secretKey: string } {
    const publicKey = `pk_live_${this.generateRandomString(12)}`;
    const secretKey = `sk_live_${this.generateRandomString(32)}`;
    return { publicKey, secretKey };
  }

  private generateRandomString(length: number): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  // Get user settings
  async getUserSettings(walletAddress: string): Promise<UserSettings | null> {
    // Check if we have settings in memory
    let settings = this.settings.get(walletAddress);
    
    if (!settings) {
      // Create default settings for new user
      const { publicKey, secretKey } = this.generateApiKeys();
      settings = {
        id: `settings_${Date.now()}`,
        wallet_address: walletAddress,
        name: `User ${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`,
        email: "",
        dark_mode: true,
        email_notifications: true,
        public_key: publicKey,
        secret_key: secretKey,
        webhook_url: "",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      this.settings.set(walletAddress, settings);
    }
    
    return settings;
  }

  // Update user settings
  async updateUserSettings(walletAddress: string, updates: Partial<UserSettings>): Promise<UserSettings> {
    const currentSettings = await this.getUserSettings(walletAddress);
    if (!currentSettings) {
      throw new Error("User settings not found");
    }

    const updatedSettings = {
      ...currentSettings,
      ...updates,
      updated_at: new Date().toISOString(),
    };

    this.settings.set(walletAddress, updatedSettings);
    return updatedSettings;
  }

  // Rotate API keys
  async rotateApiKeys(walletAddress: string): Promise<{ publicKey: string; secretKey: string }> {
    const { publicKey, secretKey } = this.generateApiKeys();
    
    await this.updateUserSettings(walletAddress, {
      public_key: publicKey,
      secret_key: secretKey,
    });

    return { publicKey, secretKey };
  }

  // Add webhook log
  addWebhookLog(walletAddress: string, log: Omit<WebhookLog, 'id' | 'user_id' | 'created_at'>): void {
    const logs = this.webhookLogs.get(walletAddress) || [];
    const newLog: WebhookLog = {
      ...log,
      id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      user_id: walletAddress,
      created_at: new Date().toISOString(),
    };
    
    logs.unshift(newLog); // Add to beginning
    if (logs.length > 100) {
      logs.splice(100); // Keep only last 100 logs
    }
    
    this.webhookLogs.set(walletAddress, logs);
  }

  // Get webhook logs
  getWebhookLogs(walletAddress: string): WebhookLog[] {
    return this.webhookLogs.get(walletAddress) || [];
  }

  // Revoke all sessions (simulate)
  async revokeSessions(walletAddress: string): Promise<void> {
    // In a real implementation, this would invalidate JWT tokens, clear sessions, etc.
    console.log(`Revoking all sessions for ${walletAddress}`);
  }
}

export const settingsService = SettingsService.getInstance();
