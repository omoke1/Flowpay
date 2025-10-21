import { Magic } from 'magic-sdk';
import { FlowExtension } from '@magic-ext/flow';

// Magic.link configuration for Flow Testnet
const magic = new Magic(process.env.NEXT_PUBLIC_MAGIC_PUBLISHABLE_KEY!, {
  extensions: [
    new FlowExtension({
      rpcUrl: 'https://rest-testnet.onflow.org', // Flow Testnet RPC
      network: 'testnet' // Flow Testnet
    })
  ]
});

export class MagicService {
  private static magic = magic;

  /**
   * Authenticate user with email using Magic.link
   * This creates a real Flow wallet behind the scenes
   */
  static async authenticateWithEmail(email: string): Promise<{
    address: string;
    publicKey: string;
    isLoggedIn: boolean;
  } | null> {
    try {
      console.log('Starting Magic.link authentication for email:', email);
      
      // Check if Magic.link is properly configured
      if (!process.env.NEXT_PUBLIC_MAGIC_PUBLISHABLE_KEY) {
        throw new Error('Magic.link publishable key not configured');
      }

      // For now, create a mock authentication for testing
      // TODO: Replace with real Magic.link authentication once domain is approved
      console.log('Using mock Magic.link authentication for testing...');
      
      // Generate a deterministic Flow address from email
      const flowAddress = this.generateFlowAddress({ email });
      
      console.log('Mock Magic Flow wallet created:', {
        address: flowAddress,
        publicKey: 'magic_public_key',
        isLoggedIn: true
      });

      return {
        address: flowAddress,
        publicKey: 'magic_public_key',
        isLoggedIn: true
      };

    } catch (error) {
      console.error('Magic.link authentication error:', error);
      return null;
    }
  }

  /**
   * Generate a Flow-compatible address from Magic.link user data
   */
  private static generateFlowAddress(userInfo: any): string {
    // Create a deterministic Flow address from Magic.link user data
    const userHash = this.hashString(userInfo.issuer || userInfo.email || 'magic_user');
    return `0x${userHash.substring(0, 40).padStart(40, '0')}`;
  }

  /**
   * Simple hash function for deterministic address generation
   */
  private static hashString(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(16);
  }

  /**
   * Check if user is logged in with Magic.link
   */
  static async isLoggedIn(): Promise<boolean> {
    try {
      return await this.magic.user.isLoggedIn();
    } catch (error) {
      console.error('Error checking Magic.link login status:', error);
      return false;
    }
  }

  /**
   * Get current user's Flow wallet address
   */
  static async getFlowAddress(): Promise<string | null> {
    try {
      const isLoggedIn = await this.isLoggedIn();
      if (!isLoggedIn) return null;

      // Get user info to regenerate the same address
      const userInfo = await this.magic.user.getInfo();
      return this.generateFlowAddress(userInfo);

    } catch (error) {
      console.error('Error getting Flow address:', error);
      return null;
    }
  }

  /**
   * Note: Transaction signing for Flow is handled by FCL for external wallets
   * Magic.link managed wallets use the embedded wallet infrastructure
   * For Flow transactions, users will need to use external wallets or FCL
   */

  /**
   * Logout user from Magic.link
   */
  static async logout(): Promise<void> {
    try {
      await this.magic.user.logout();
    } catch (error) {
      console.error('Error logging out:', error);
    }
  }

  /**
   * Note: getUserMetadata method removed due to Magic.link API limitations
   * Use standard Magic.link user methods instead
   */
}
