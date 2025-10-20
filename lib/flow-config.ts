import * as fcl from "@onflow/fcl";

// Testnet contract addresses (from official Flow documentation)
export const CONTRACTS = {
  FungibleToken: "0x9a0766d93b6608b7",
  FlowToken: "0x7e60df042a9c0868",
  // USDC.e address on testnet - VERIFIED
  USDC: "0x0ae53cb6e3f42a79",
};

// Mainnet contract addresses (for production deployment)
export const MAINNET_CONTRACTS = {
  FungibleToken: "0xf233dcee88fe0abe",
  FlowToken: "0x1654653399040a61",
  // USDC.e address on mainnet - TO BE VERIFIED
  USDC: "0xTO_BE_VERIFIED",
};

/**
 * Get contract addresses based on environment
 */
export function getContractAddresses() {
  const isMainnet = process.env.NEXT_PUBLIC_FLOW_NETWORK === 'mainnet';
  return isMainnet ? MAINNET_CONTRACTS : CONTRACTS;
}

/**
 * Validate contract address format
 */
export function validateContractAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{16}$/.test(address);
}

// Singleton flag to ensure FCL is only initialized once
let fclInitialized = false;

// FCL Configuration function (to be called once on client-side)
export const initializeFCL = () => {
  if (typeof window === "undefined") return;
  
  // Prevent multiple initializations
  if (fclInitialized) {
    console.log("FCL already initialized, skipping...");
    return;
  }
  
  try {
    // Use the official FCL configuration pattern from Flow documentation
    fcl.config({
      // Network configuration
      "flow.network": "testnet",
      "accessNode.api": "https://rest-testnet.onflow.org",
      
      // Wallet discovery configuration
      "discovery.wallet": "https://fcl-discovery.onflow.org/testnet/authn",
      "discovery.authn.endpoint": "https://fcl-discovery.onflow.org/api/testnet/authn",
      "discovery.wallet.method": "IFRAME/RPC",
      
      // WalletConnect configuration (required for wallet discovery)
      // Get your project ID from: https://cloud.walletconnect.com/
      "walletconnect.projectId": process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "demo-project-id",
      
      // App details for wallet discovery
      "app.detail.title": "FlowPay",
      "app.detail.icon": "https://flowpay.app/logo.svg",
      "app.detail.description": "Professional payment platform for Flow blockchain",
      "app.detail.url": "https://flowpay.app",
      
      // OpenID Connect scopes
      "service.OpenID.scopes": "email",
      
      // Transaction limits
      "fcl.limit": 1000,
      
      // Contract addresses for testnet
      "0xFlowToken": "0x7e60df042a9c0868",
      "0xFungibleToken": "0x9a0766d93b6608b7"
    });
    
    fclInitialized = true;
    console.log("FCL initialized successfully");
  } catch (error) {
    console.warn("FCL configuration warning (non-critical):", error);
    // Fallback to minimal configuration
    try {
      fcl.config({
        "flow.network": "testnet",
        "accessNode.api": "https://rest-testnet.onflow.org",
        "discovery.wallet": "https://fcl-discovery.onflow.org/testnet/authn",
        "discovery.authn.endpoint": "https://fcl-discovery.onflow.org/api/testnet/authn",
        "walletconnect.projectId": process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "demo-project-id",
        "app.detail.title": "FlowPay",
        "app.detail.icon": "https://flowpay.app/logo.svg"
      });
      fclInitialized = true;
      console.log("FCL initialized with fallback configuration");
    } catch (fallbackError) {
      console.error("FCL initialization failed completely:", fallbackError);
    }
  }
};

// Utility functions for Flow transactions
export const formatFlowAddress = (address: string) => {
  if (!address) return "";
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

export const isValidFlowAddress = (address: string) => {
  return /^0x[a-fA-F0-9]{16}$/.test(address);
};

// Transaction templates
export const TRANSACTION_TEMPLATES = {
  transferFlow: `
    import FungibleToken from 0xFungibleToken
    import FlowToken from 0xFlowToken
    
    transaction(amount: UFix64, to: Address) {
      let sentVault: @FungibleToken.Vault
      
      prepare(signer: AuthAccount) {
        let vaultRef = signer.borrow<&FlowToken.Vault>(from: /storage/flowTokenVault)
          ?? panic("Could not borrow reference to the owner's Vault")
        self.sentVault = vaultRef.withdraw(amount: amount)
      }
      
      execute {
        let receiverRef = getAccount(to)
          .getCapability(/public/flowTokenReceiver)
          .borrow<&{FungibleToken.Receiver}>()
          ?? panic("Could not borrow reference to the receiver's public vault")
        receiverRef.deposit(from: self.sentVault)
      }
    }
  `,
  
  transferUSDC: `
    import FungibleToken from 0xFungibleToken
    import FiatToken from 0x0ae53cb6e3f42a79
    
    transaction(amount: UFix64, to: Address) {
      let sentVault: @FungibleToken.Vault
      
      prepare(signer: AuthAccount) {
        let vaultRef = signer.borrow<&FiatToken.Vault>(from: /storage/fiatTokenVault)
          ?? panic("Could not borrow reference to the owner's Vault")
        self.sentVault = vaultRef.withdraw(amount: amount)
      }
      
      execute {
        let receiverRef = getAccount(to)
          .getCapability(/public/fiatTokenReceiver)
          .borrow<&{FungibleToken.Receiver}>()
          ?? panic("Could not borrow reference to the receiver's public vault")
        receiverRef.deposit(from: self.sentVault)
      }
    }
  `
};

// Flow Port specific utilities
export const FLOW_PORT_CONFIG = {
  // Flow Port service URL
  serviceUrl: "https://port.onflow.org",
  // Supported authentication methods
  authMethods: ["email", "google", "discord"],
  // Default scopes for user data
  scopes: ["email", "profile"]
};

// Wallet type detection
export const getWalletType = (address: string): 'managed' | 'external' => {
  // Flow Port managed wallets typically have specific patterns
  // This is a simplified detection - in production you'd want more sophisticated logic
  return 'external'; // Default to external for now
};

export { fcl };

