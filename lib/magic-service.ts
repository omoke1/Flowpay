import { Magic } from 'magic-sdk';
import { FlowExtension } from '@magic-ext/flow';

// Magic.link configuration for Flow
const magic = new Magic(process.env.NEXT_PUBLIC_MAGIC_PUBLISHABLE_KEY!, {
  extensions: [
    new FlowExtension({
      rpcUrl: 'https://rest-testnet.onflow.org', // Testnet RPC
      network: 'testnet'
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
      
      // Authenticate with Magic.link
      const didToken = await this.magic.auth.loginWithMagicLink({ email });
      
      if (!didToken) {
        throw new Error('Magic.link authentication failed');
      }

      console.log('Magic.link authentication successful, getting Flow wallet info...');

      // Get user metadata to extract Flow wallet information
      const userMetadata = await this.magic.user.getMetadata();
      
      if (!userMetadata) {
        throw new Error('Failed to get user metadata');
      }

      // For Magic.link managed wallets, we'll use the user's public key as the address
      // This is a simplified approach - in production you'd want to get the actual Flow address
      const flowAddress = userMetadata.publicAddress || userMetadata.issuer;
      
      if (!flowAddress) {
        throw new Error('Failed to get Flow wallet address');
      }

      console.log('Magic Flow wallet created:', {
        address: flowAddress,
        publicKey: userMetadata.publicKey,
        isLoggedIn: true
      });

      return {
        address: flowAddress,
        publicKey: userMetadata.publicKey || '',
        isLoggedIn: true
      };

    } catch (error) {
      console.error('Magic.link authentication error:', error);
      return null;
    }
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

      const userMetadata = await this.magic.user.getMetadata();
      return userMetadata?.publicAddress || userMetadata?.issuer || null;
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
   * Get user metadata
   */
  static async getUserMetadata(): Promise<any> {
    try {
      return await this.magic.user.getMetadata();
    } catch (error) {
      console.error('Error getting user metadata:', error);
      return null;
    }
  }
}
