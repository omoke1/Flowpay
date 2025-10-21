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

      // Get Flow wallet information
      const flowUser = await this.magic.flow.getAccount();
      
      if (!flowUser) {
        throw new Error('Failed to get Flow wallet information');
      }

      console.log('Magic Flow wallet created:', {
        address: flowUser.address,
        publicKey: flowUser.publicKey,
        isLoggedIn: true
      });

      return {
        address: flowUser.address,
        publicKey: flowUser.publicKey,
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

      const flowUser = await this.magic.flow.getAccount();
      return flowUser?.address || null;
    } catch (error) {
      console.error('Error getting Flow address:', error);
      return null;
    }
  }

  /**
   * Sign a Flow transaction using Magic.link
   */
  static async signTransaction(transaction: any): Promise<string | null> {
    try {
      const isLoggedIn = await this.isLoggedIn();
      if (!isLoggedIn) {
        throw new Error('User not logged in');
      }

      const result = await this.magic.flow.signTransaction(transaction);
      return result;
    } catch (error) {
      console.error('Error signing transaction:', error);
      return null;
    }
  }

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
