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
      
      // Authenticate with Magic.link
      const didToken = await this.magic.auth.loginWithMagicLink({ email });
      
      if (!didToken) {
        throw new Error('Magic.link authentication failed');
      }

      console.log('Magic.link authentication successful, creating Flow wallet...');

      // Create Flow wallet using Magic.link API
      const walletResponse = await this.createFlowWallet(didToken);
      
      if (!walletResponse) {
        throw new Error('Failed to create Flow wallet');
      }

      console.log('Magic Flow wallet created:', {
        address: walletResponse.address,
        publicKey: walletResponse.publicKey,
        isLoggedIn: true
      });

      return {
        address: walletResponse.address,
        publicKey: walletResponse.publicKey,
        isLoggedIn: true
      };

    } catch (error) {
      console.error('Magic.link authentication error:', error);
      return null;
    }
  }

  /**
   * Create Flow wallet using Magic.link API
   */
  private static async createFlowWallet(didToken: string): Promise<{
    address: string;
    publicKey: string;
  } | null> {
    try {
      const response = await fetch("https://tee.express.magiclabs.com/v1/wallet", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${didToken}`,
          "X-Magic-API-Key": process.env.NEXT_PUBLIC_MAGIC_PUBLISHABLE_KEY!,
          "X-Magic-Chain": "FLOW", // Use FLOW instead of ETH
        },
      });

      if (!response.ok) {
        throw new Error(`Magic.link wallet creation failed: ${response.status}`);
      }

      const data = await response.json();
      
      return {
        address: data.public_address,
        publicKey: data.public_key || 'magic_public_key'
      };

    } catch (error) {
      console.error('Error creating Flow wallet:', error);
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

      // Get the user's DID token for API calls
      const didToken = await this.magic.user.getIdToken();
      if (!didToken) return null;

      // Get wallet info from Magic.link API
      const response = await fetch("https://tee.express.magiclabs.com/v1/wallet", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${didToken}`,
          "X-Magic-API-Key": process.env.NEXT_PUBLIC_MAGIC_PUBLISHABLE_KEY!,
          "X-Magic-Chain": "FLOW",
        },
      });

      if (!response.ok) {
        console.error('Failed to get wallet info:', response.status);
        return null;
      }

      const data = await response.json();
      return data.public_address || null;

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
