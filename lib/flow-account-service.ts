import * as fcl from '@onflow/fcl';
import { initializeFlowConfig } from './flow-config-official';
import { supabase } from './supabase';

// Initialize Flow configuration
initializeFlowConfig();

export interface AccountCreationResult {
  address: string;
  keys: {
    publicKey: string;
    privateKey: string;
  };
  funded: boolean;
  transactionId?: string;
}

export interface PlatformFeeConfig {
  rate: number; // 0.005 for 0.5%
  recipient: string; // Platform fee recipient address
}

// Platform fee configuration
const PLATFORM_FEE_CONFIG: PlatformFeeConfig = {
  rate: 0.005, // 0.5%
  recipient: process.env.NEXT_PUBLIC_PLATFORM_FEE_RECIPIENT || '0x0' // Will be set by admin
};

// Cadence transaction for creating a new account
const CREATE_ACCOUNT_TRANSACTION = `
import FlowToken from 0x7e60df042a9c0868
import FungibleToken from 0x9a0766d93b6608b7

transaction(publicKey: String, initialAmount: UFix64) {
    let newAccount: AuthAccount
    let platformFeeRecipient: &FlowToken.Vault
    let payer: &FlowToken.Vault

    prepare(signer: AuthAccount) {
        // Create the new account
        self.newAccount = AuthAccount(payer: signer)
        
        // Get platform fee recipient vault
        self.platformFeeRecipient = getAccount(0x${PLATFORM_FEE_CONFIG.recipient.slice(2)})
            .getCapability(/public/flowTokenReceiver)
            .borrow<&FlowToken.Vault{FungibleToken.Receiver}>()
            ?? panic("Could not borrow platform fee recipient vault")
        
        // Get payer vault
        self.payer = signer.borrow<&FlowToken.Vault>(from: /storage/flowTokenVault)
            ?? panic("Could not borrow payer vault")
    }

    execute {
        // Add the public key to the new account
        let publicKey = PublicKey(
            publicKey: publicKey.decodeHex(),
            signatureAlgorithm: SignatureAlgorithm.ECDSA_P256
        )
        
        let keyList = Crypto.KeyList()
        keyList.add(
            publicKey,
            hashAlgorithm: HashAlgorithm.SHA3_256,
            weight: 1000.0,
            isRevoked: false
        )
        
        self.newAccount.keys.add(
            publicKey: publicKey,
            hashAlgorithm: HashAlgorithm.SHA3_256,
            weight: 1000.0,
            isRevoked: false
        )

        // Transfer initial amount to new account
        let vault <- self.payer.withdraw(amount: initialAmount)
        self.newAccount.getCapability(/public/flowTokenReceiver)
            .borrow<&FlowToken.Vault{FungibleToken.Receiver}>()
            ?? panic("Could not borrow new account vault")
            .deposit(from: <-vault)
    }
}`;

// Cadence transaction for transferring with platform fee
const TRANSFER_WITH_FEE_TRANSACTION = `
import FlowToken from 0x7e60df042a9c0868
import FungibleToken from 0x9a0766d93b6608b7

transaction(amount: UFix64, to: Address, platformFeeRate: UFix64) {
    let sentVault: @FungibleToken.Vault
    let platformFeeVault: @FungibleToken.Vault
    let platformFeeRecipient: &FlowToken.Vault

    prepare(signer: AuthAccount) {
        let vaultRef = signer.borrow<&FlowToken.Vault>(from: /storage/flowTokenVault)
            ?? panic("Could not borrow reference to the owner's Vault")
        
        // Calculate platform fee
        let platformFee = amount * platformFeeRate
        let netAmount = amount - platformFee
        
        // Withdraw total amount
        self.sentVault <- vaultRef.withdraw(amount: amount)
        
        // Split for platform fee
        self.platformFeeVault <- self.sentVault.withdraw(amount: platformFee)
        
        // Get platform fee recipient
        self.platformFeeRecipient = getAccount(0x${PLATFORM_FEE_CONFIG.recipient.slice(2)})
            .getCapability(/public/flowTokenReceiver)
            .borrow<&FlowToken.Vault{FungibleToken.Receiver}>()
            ?? panic("Could not borrow platform fee recipient vault")
    }

    execute {
        // Deposit platform fee
        self.platformFeeRecipient.deposit(from: <-self.platformFeeVault)
        
        // Deposit net amount to recipient
        let receiverRef = getAccount(to)
            .getCapability(/public/flowTokenReceiver)
            .borrow<&{FungibleToken.Receiver}>()
            ?? panic("Could not borrow receiver reference to the recipient's Vault")
        receiverRef.deposit(from: <-self.sentVault)
    }
}`;

export class FlowAccountService {
  private static instance: FlowAccountService;

  static getInstance(): FlowAccountService {
    if (!FlowAccountService.instance) {
      FlowAccountService.instance = new FlowAccountService();
    }
    return FlowAccountService.instance;
  }

  /**
   * Create a new Flow account with email and name
   */
  async createFlowAccount(email: string, name: string): Promise<AccountCreationResult> {
    try {
      console.log(`Creating Flow account for email: ${email}, name: ${name}`);

      // Generate new key pair
      const { publicKey, privateKey } = this.generateKeyPair();
      
      // Initial funding amount (0.001 FLOW for storage + 0.01 FLOW for operations)
      const initialAmount = 0.011; // 0.011 FLOW total
      
      // Create account transaction
      const transactionId = await fcl.mutate({
        cadence: CREATE_ACCOUNT_TRANSACTION,
        args: (arg: any, t: any) => [
          arg(publicKey, t.String),
          arg(initialAmount, t.UFix64)
        ],
        proposer: fcl.currentUser,
        payer: fcl.currentUser,
        authorizations: [fcl.currentUser],
        limit: 1000
      });

      console.log(`Account creation transaction submitted: ${transactionId}`);

      // Wait for transaction to be sealed
      const transaction = await fcl.tx(transactionId).onceSealed();
      
      if (!transaction || transaction.status !== 4) {
        throw new Error(`Account creation failed with status: ${transaction?.status}`);
      }

      // Extract the new account address from transaction events
      const newAccountAddress = this.extractAccountAddress(transaction);
      
      if (!newAccountAddress) {
        throw new Error('Could not extract new account address from transaction');
      }

      console.log(`Flow account created successfully: ${newAccountAddress}`);

      // Store account in database
      await this.storeAccountInDatabase(newAccountAddress, email, name, publicKey);

      return {
        address: newAccountAddress,
        keys: {
          publicKey,
          privateKey
        },
        funded: true,
        transactionId
      };

    } catch (error) {
      console.error('Error creating Flow account:', error);
      throw new Error(`Failed to create Flow account: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Transfer FLOW tokens with platform fee
   */
  async transferWithPlatformFee(
    fromAddress: string,
    toAddress: string,
    amount: number
  ): Promise<{ transactionId: string; platformFee: number; netAmount: number }> {
    try {
      const platformFee = amount * PLATFORM_FEE_CONFIG.rate;
      const netAmount = amount - platformFee;

      console.log(`Transferring ${amount} FLOW with ${platformFee} platform fee (${PLATFORM_FEE_CONFIG.rate * 100}%)`);

      const transactionId = await fcl.mutate({
        cadence: TRANSFER_WITH_FEE_TRANSACTION,
        args: (arg: any, t: any) => [
          arg(amount, t.UFix64),
          arg(toAddress, t.Address),
          arg(PLATFORM_FEE_CONFIG.rate, t.UFix64)
        ],
        proposer: fcl.currentUser,
        payer: fcl.currentUser,
        authorizations: [fcl.currentUser],
        limit: 1000
      });

      console.log(`Transfer with platform fee transaction submitted: ${transactionId}`);

      return {
        transactionId,
        platformFee,
        netAmount
      };

    } catch (error) {
      console.error('Error transferring with platform fee:', error);
      throw new Error(`Failed to transfer with platform fee: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Verify that an account was created successfully
   */
  async verifyAccountCreation(address: string): Promise<boolean> {
    try {
      const account = await fcl.account(address);
      return account && account.keys && account.keys.length > 0;
    } catch (error) {
      console.error('Error verifying account creation:', error);
      return false;
    }
  }

  /**
   * Get account balance
   */
  async getAccountBalance(address: string): Promise<string> {
    try {
      const account = await fcl.account(address);
      return account.balance?.toString() || '0';
    } catch (error) {
      console.error('Error getting account balance:', error);
      return '0';
    }
  }

  /**
   * Generate a new key pair for the account
   */
  private generateKeyPair(): { publicKey: string; privateKey: string } {
    // In a real implementation, you would use a secure key generation library
    // For now, we'll generate a deterministic key pair based on email
    const crypto = require('crypto');
    const seed = crypto.createHash('sha256').update(email).digest();
    
    // This is a simplified key generation - in production, use proper cryptographic libraries
    const publicKey = seed.toString('hex');
    const privateKey = seed.toString('hex') + 'private';
    
    return { publicKey, privateKey };
  }

  /**
   * Extract account address from transaction events
   */
  private extractAccountAddress(transaction: any): string | null {
    try {
      const events = transaction.events || [];
      
      for (const event of events) {
        if (event.type.includes('AccountCreated')) {
          return event.data?.address;
        }
      }
      
      return null;
    } catch (error) {
      console.error('Error extracting account address:', error);
      return null;
    }
  }

  /**
   * Store account information in database
   */
  private async storeAccountInDatabase(
    address: string,
    email: string,
    name: string,
    publicKey: string
  ): Promise<void> {
    try {
      if (!supabase) {
        throw new Error('Supabase not configured');
      }

      const { error } = await supabase
        .from('users')
        .insert({
          wallet_address: address,
          email: email,
          display_name: name,
          account_funded_by: 'admin_payer',
          public_key: publicKey,
          created_at: new Date().toISOString()
        });

      if (error) {
        throw new Error(`Database error: ${error.message}`);
      }

      console.log(`Account stored in database: ${address}`);
    } catch (error) {
      console.error('Error storing account in database:', error);
      throw error;
    }
  }

  /**
   * Get platform fee configuration
   */
  getPlatformFeeConfig(): PlatformFeeConfig {
    return PLATFORM_FEE_CONFIG;
  }

  /**
   * Calculate platform fee for a given amount
   */
  calculatePlatformFee(amount: number): number {
    return amount * PLATFORM_FEE_CONFIG.rate;
  }
}

// Export singleton instance
export const flowAccountService = FlowAccountService.getInstance();


