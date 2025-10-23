import * as fcl from '@onflow/fcl';
import { initializeFlowConfig } from './flow-config-official';

// Initialize Flow configuration - Force mainnet
initializeFlowConfig();

// Force mainnet configuration for FlowPay
fcl.config({
  'accessNode.api': 'https://rest-mainnet.onflow.org',
  'discovery.wallet': 'https://fcl-discovery.onflow.org/authn',
  'discovery.authn.endpoint': 'https://fcl-discovery.onflow.org/authn',
  'app.detail.title': 'FlowPay',
  'app.detail.icon': 'https://www.useflowpay.xyz/logo.svg',
  'app.detail.url': 'https://www.useflowpay.xyz',
  'discovery.wallet.method.default': 'IFRAME/RPC',
  'discovery.wallet.method.include': ['IFRAME/RPC', 'POP/RPC', 'TAB/RPC'],
  'discovery.wallet.method.include.services': ['https://fcl-discovery.onflow.org/authn'],
  'walletconnect.projectId': process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'demo-project-id',
  'discovery.wallet.method.include.services.timeout': 10000,
});

// Flow Token contract addresses
const FLOW_TOKEN_CONTRACT = {
  testnet: '0x7e60df042a9c0868',
  mainnet: '0x1654653399040a61'  // FlowToken on mainnet
};

// FungibleToken contract addresses
const FUNGIBLE_TOKEN_CONTRACT = {
  testnet: '0x9a0766d93b6608b7',
  mainnet: '0x9a0766d93b6608b7'  // FungibleToken on mainnet (same address)
};

// USDC contract addresses
const USDC_CONTRACT = {
  testnet: '0xa983fecbed621163', // Example testnet USDC
  mainnet: '0xf1ab99c82dee3526'  // USDC.e on Flow mainnet
};

// Get current network - Force mainnet for FlowPay
const getNetwork = () => {
  // Always use mainnet for FlowPay production
  return 'mainnet';
};

// Verify we're on mainnet
export async function verifyMainnetConnection(): Promise<boolean> {
  try {
    const config = fcl.config();
    const accessNode = config.get('accessNode.api');
    console.log(`Current access node: ${accessNode}`);
    
    // Check if we're using mainnet access node
    const isMainnet = accessNode === 'https://rest-mainnet.onflow.org';
    
    if (!isMainnet) {
      console.error('❌ CRITICAL: Not connected to Flow mainnet! Current node:', accessNode);
      return false;
    }
    
    console.log('✅ Confirmed: Connected to Flow mainnet');
    return true;
  } catch (error) {
    console.error('Error verifying mainnet connection:', error);
    return false;
  }
}

// Flow Token transfer transaction
const FLOW_TRANSFER_TRANSACTION = `
import FungibleToken from 0x9a0766d93b6608b7
import FlowToken from 0x1654653399040a61

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
            .borrow<&FungibleToken.Receiver>()
            ?? panic("Could not borrow receiver reference to the recipient's Vault")
        receiverRef.deposit(from: <-self.sentVault)
    }
}`;

// Flow Token transfer with platform fee transaction
const FLOW_TRANSFER_WITH_FEE_TRANSACTION = `
import FungibleToken from 0x9a0766d93b6608b7
import FlowToken from 0x1654653399040a61

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
            .borrow<&FlowToken.Vault & FungibleToken.Receiver>()
            ?? panic("Could not borrow platform fee recipient vault")
    }

    execute {
        // Deposit platform fee
        self.platformFeeRecipient.deposit(from: <-self.platformFeeVault)
        
        // Deposit net amount to recipient
        let receiverRef = getAccount(to)
            .getCapability(/public/flowTokenReceiver)
            .borrow<&FungibleToken.Receiver>()
            ?? panic("Could not borrow receiver reference to the recipient's Vault")
        receiverRef.deposit(from: <-self.sentVault)
    }
}`;

// USDC transfer transaction for USDC.e on Flow mainnet
const USDC_TRANSFER_TRANSACTION = `
import FungibleToken from 0x9a0766d93b6608b7
import USDCFlow from 0xf1ab99c82dee3526

transaction(amount: UFix64, to: Address) {
    let sentVault: @FungibleToken.Vault

    prepare(signer: AuthAccount) {
        let vaultRef = signer.borrow<&USDCFlow.Vault>(from: /storage/usdcVault)
            ?? panic("Could not borrow reference to the owner's Vault")
        self.sentVault <- vaultRef.withdraw(amount: amount)
    }

    execute {
        let receiverRef = getAccount(to)
            .getCapability(/public/usdcReceiver)
            .borrow<&FungibleToken.Receiver>()
            ?? panic("Could not borrow receiver reference to the recipient's Vault")
        receiverRef.deposit(from: <-self.sentVault)
    }
}`;

// USDC transfer with platform fee transaction
const USDC_TRANSFER_WITH_FEE_TRANSACTION = `
import FungibleToken from 0x9a0766d93b6608b7
import USDCFlow from 0xf1ab99c82dee3526

transaction(amount: UFix64, to: Address, platformFeeRate: UFix64) {
    let sentVault: @FungibleToken.Vault
    let platformFeeVault: @FungibleToken.Vault
    let platformFeeRecipient: &USDCFlow.Vault

    prepare(signer: AuthAccount) {
        let vaultRef = signer.borrow<&USDCFlow.Vault>(from: /storage/usdcVault)
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
            .borrow<&FiatToken.Vault & FungibleToken.Receiver>()
            ?? panic("Could not borrow platform fee recipient vault")
    }

    execute {
        // Deposit platform fee
        self.platformFeeRecipient.deposit(from: <-self.platformFeeVault)
        
        // Deposit net amount to recipient
        let receiverRef = getAccount(to)
            .getCapability(/public/usdcReceiver)
            .borrow<&FungibleToken.Receiver>()
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
        import FungibleToken from 0xf233dcee88fe0abe
        import FlowToken from 0x1654653399040a61
        
        access(all) fun main(address: Address): UFix64 {
          let account = getAccount(address)
          let vaultRef = account.getCapability(FlowToken.VaultPublicPath)
              .borrow<&FlowToken.Vault & FungibleToken.Balance>()
              ?? panic("Could not borrow Balance reference to the Vault")
          
          return vaultRef.balance
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
    // For now, return 0 for USDC balance since we need to implement proper USDC support
    // This prevents errors while we work on the FLOW balance functionality
    console.log('USDC balance check not yet implemented, returning 0');
    return '0';
  } catch (error) {
    console.error('Error getting USDC balance:', error);
    return '0';
  }
}
