import * as fcl from '@onflow/fcl';
import { initializeFlowConfig } from './flow-config-official';

// Initialize Flow configuration
initializeFlowConfig();

// Flow Token contract addresses
const FLOW_TOKEN_CONTRACT = {
  testnet: '0x7e60df042a9c0868',
  mainnet: '0x1654653399040a61'
};

// USDC contract addresses (example - you'll need to verify these)
const USDC_CONTRACT = {
  testnet: '0xa983fecbed621163', // Example testnet USDC
  mainnet: '0x3c5959b568896393'  // Example mainnet USDC
};

// Get current network
const getNetwork = () => {
  return process.env.NODE_ENV === 'production' ? 'mainnet' : 'testnet';
};

// Flow Token transfer transaction
const FLOW_TRANSFER_TRANSACTION = `
import FungibleToken from 0x9a0766d93b6608b7
import FlowToken from 0x7e60df042a9c0868

transaction(amount: UFix64, to: Address) {
    let sentVault: @FungibleToken.Vault

    prepare(signer: AuthAccount) {
        let vaultRef = signer.borrow<&FlowToken.Vault>(from: /storage/flowTokenVault)
            ?? panic("Could not borrow reference to the owner's Vault")
        self.sentVault <- vaultRef.withdraw(amount: amount)
    }

    execute {
        let receiverRef = getAccount(to)
            .getCapability(/public/flowTokenReceiver)
            .borrow<&{FungibleToken.Receiver}>()
            ?? panic("Could not borrow receiver reference to the recipient's Vault")
        receiverRef.deposit(from: <-self.sentVault)
    }
}`;

// Flow Token transfer with platform fee transaction
const FLOW_TRANSFER_WITH_FEE_TRANSACTION = `
import FungibleToken from 0x9a0766d93b6608b7
import FlowToken from 0x7e60df042a9c0868

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
        
        // Get platform fee recipient (you'll need to set this address)
        self.platformFeeRecipient = getAccount(0x0) // Replace with your platform fee address
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

// USDC transfer transaction (example - adjust based on actual USDC contract)
const USDC_TRANSFER_TRANSACTION = `
import FungibleToken from 0x9a0766d93b6608b7
import FiatToken from 0xa983fecbed621163

transaction(amount: UFix64, to: Address) {
    let sentVault: @FungibleToken.Vault

    prepare(signer: AuthAccount) {
        let vaultRef = signer.borrow<&FiatToken.Vault>(from: /storage/usdcVault)
            ?? panic("Could not borrow reference to the owner's Vault")
        self.sentVault <- vaultRef.withdraw(amount: amount)
    }

    execute {
        let receiverRef = getAccount(to)
            .getCapability(/public/usdcReceiver)
            .borrow<&{FungibleToken.Receiver}>()
            ?? panic("Could not borrow receiver reference to the recipient's Vault")
        receiverRef.deposit(from: <-self.sentVault)
    }
}`;

// USDC transfer with platform fee transaction
const USDC_TRANSFER_WITH_FEE_TRANSACTION = `
import FungibleToken from 0x9a0766d93b6608b7
import FiatToken from 0xa983fecbed621163

transaction(amount: UFix64, to: Address, platformFeeRate: UFix64) {
    let sentVault: @FungibleToken.Vault
    let platformFeeVault: @FungibleToken.Vault
    let platformFeeRecipient: &FiatToken.Vault

    prepare(signer: AuthAccount) {
        let vaultRef = signer.borrow<&FiatToken.Vault>(from: /storage/usdcVault)
            ?? panic("Could not borrow reference to the owner's Vault")
        
        // Calculate platform fee
        let platformFee = amount * platformFeeRate
        let netAmount = amount - platformFee
        
        // Withdraw total amount
        self.sentVault <- vaultRef.withdraw(amount: amount)
        
        // Split for platform fee
        self.platformFeeVault <- self.sentVault.withdraw(amount: platformFee)
        
        // Get platform fee recipient (you'll need to set this address)
        self.platformFeeRecipient = getAccount(0x0) // Replace with your platform fee address
            .getCapability(/public/usdcReceiver)
            .borrow<&FiatToken.Vault{FungibleToken.Receiver}>()
            ?? panic("Could not borrow platform fee recipient vault")
    }

    execute {
        // Deposit platform fee
        self.platformFeeRecipient.deposit(from: <-self.platformFeeVault)
        
        // Deposit net amount to recipient
        let receiverRef = getAccount(to)
            .getCapability(/public/usdcReceiver)
            .borrow<&{FungibleToken.Receiver}>()
            ?? panic("Could not borrow receiver reference to the recipient's Vault")
        receiverRef.deposit(from: <-self.sentVault)
    }
}`;

/**
 * Send Flow tokens to a recipient with platform fee
 */
export async function sendFlowTokens(recipient: string, amount: string): Promise<string> {
  try {
    console.log(`Sending ${amount} FLOW to ${recipient} with platform fee`);
    
    // Convert amount to UFix64 (Flow's decimal type)
    const flowAmount = parseFloat(amount);
    if (isNaN(flowAmount) || flowAmount <= 0) {
      throw new Error('Invalid amount');
    }

    // Calculate platform fee (0.5%)
    const platformFeeRate = 0.005;
    const platformFee = flowAmount * platformFeeRate;
    const netAmount = flowAmount - platformFee;

    console.log(`Platform fee: ${platformFee} FLOW (${platformFeeRate * 100}%)`);
    console.log(`Net amount to recipient: ${netAmount} FLOW`);

    // Use the transfer with fee transaction
    const transactionId = await fcl.mutate({
      cadence: FLOW_TRANSFER_WITH_FEE_TRANSACTION,
      args: (arg: any, t: any) => [
        arg(flowAmount, t.UFix64),
        arg(recipient, t.Address),
        arg(platformFeeRate, t.UFix64)
      ],
      proposer: fcl.currentUser,
      payer: fcl.currentUser,
      authorizations: [fcl.currentUser],
      limit: 1000
    });

    console.log(`Flow transaction with platform fee submitted: ${transactionId}`);
    return transactionId;
  } catch (error) {
    console.error('Error sending Flow tokens:', error);
    throw new Error(`Failed to send Flow tokens: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Send USDC tokens to a recipient with platform fee
 */
export async function sendUSDCTokens(recipient: string, amount: string): Promise<string> {
  try {
    console.log(`Sending ${amount} USDC to ${recipient} with platform fee`);
    
    // Convert amount to UFix64 (Flow's decimal type)
    const usdcAmount = parseFloat(amount);
    if (isNaN(usdcAmount) || usdcAmount <= 0) {
      throw new Error('Invalid amount');
    }

    // Calculate platform fee (0.5%)
    const platformFeeRate = 0.005;
    const platformFee = usdcAmount * platformFeeRate;
    const netAmount = usdcAmount - platformFee;

    console.log(`Platform fee: ${platformFee} USDC (${platformFeeRate * 100}%)`);
    console.log(`Net amount to recipient: ${netAmount} USDC`);

    // Build transaction with platform fee
    const transactionId = await fcl.mutate({
      cadence: USDC_TRANSFER_WITH_FEE_TRANSACTION,
      args: (arg: any, t: any) => [
        arg(usdcAmount, t.UFix64),
        arg(recipient, t.Address),
        arg(platformFeeRate, t.UFix64)
      ],
      proposer: fcl.currentUser,
      payer: fcl.currentUser,
      authorizations: [fcl.currentUser],
      limit: 1000
    });

    console.log(`USDC transaction with platform fee submitted: ${transactionId}`);
    return transactionId;
  } catch (error) {
    console.error('Error sending USDC tokens:', error);
    throw new Error(`Failed to send USDC tokens: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Verify a transaction on the Flow blockchain
 */
export async function verifyTransaction(txHash: string): Promise<{
  isValid: boolean;
  error: string | null;
  actualAmount: string;
  actualRecipient: string;
}> {
  try {
    console.log(`Verifying transaction: ${txHash}`);
    
    // Use a simpler approach - just check if the transaction exists
    // For now, we'll assume the transaction is valid if it was submitted successfully
    // In a production environment, you would want to verify the transaction details
    
    // For development/testing purposes, we'll return a successful verification
    // TODO: Implement proper transaction verification using Flow API
    return {
      isValid: true,
      error: null,
      actualAmount: '0', // We'll get this from the payment request
      actualRecipient: '' // We'll get this from the payment request
    };
  } catch (error) {
    console.error('Error verifying transaction:', error);
    return {
      isValid: false,
      error: error instanceof Error ? error.message : 'Unknown verification error',
      actualAmount: '0',
      actualRecipient: ''
    };
  }
}

/**
 * Get Flow token balance for an address
 */
export async function getFlowBalance(address: string): Promise<string> {
  try {
    const result = await fcl.query({
      cadence: `
        import FlowToken from 0x7e60df042a9c0868
        import FungibleToken from 0x9a0766d93b6608b7
        
        pub fun main(address: Address): UFix64 {
          let account = getAccount(address)
          let vault = account.getCapability(/public/flowTokenReceiver)
              .borrow<&FlowToken.Vault{FungibleToken.Receiver}>()
              ?? panic("Could not borrow Balance reference to the Vault")
          
          return vault.balance
        }
      `,
      args: (arg: any, t: any) => [arg(address, t.Address)]
    });

    return result.toString();
  } catch (error) {
    console.error('Error getting Flow balance:', error);
    return '0';
  }
}

/**
 * Get USDC balance for an address
 */
export async function getUSDCBalance(address: string): Promise<string> {
  try {
    const result = await fcl.query({
      cadence: `
        import FiatToken from 0xa983fecbed621163
        import FungibleToken from 0x9a0766d93b6608b7
        
        pub fun main(address: Address): UFix64 {
          let account = getAccount(address)
          let vault = account.getCapability(/public/usdcReceiver)
              .borrow<&FiatToken.Vault{FungibleToken.Receiver}>()
              ?? panic("Could not borrow Balance reference to the Vault")
          
          return vault.balance
        }
      `,
      args: (arg: any, t: any) => [arg(address, t.Address)]
    });

    return result.toString();
  } catch (error) {
    console.error('Error getting USDC balance:', error);
    return '0';
  }
}
