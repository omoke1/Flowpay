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

// Global configuration lock to prevent multiple FCL initializations
let fclConfiguring = false;
let fclConfigured = false;

// Global FCL configuration state that persists across module reloads
if (typeof window !== "undefined") {
  (window as any).__fclConfiguring = false;
  (window as any).__fclConfigured = false;
}

// FCL Configuration function (to be called once on client-side)
export const initializeFCL = async () => {
  if (typeof window === "undefined") return;
  
  // Use global window flags that persist across module reloads
  if ((window as any).__fclConfigured || (window as any).__fclInitialized) {
    console.log("FCL already configured, skipping...");
    return;
  }
  
  // Prevent multiple simultaneous configurations
  if ((window as any).__fclConfiguring || fclConfiguring) {
    console.log("FCL configuration already in progress, waiting...");
    // Wait for configuration to complete
    while ((window as any).__fclConfiguring || fclConfiguring) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    return;
  }
  
  // Check if FCL is already configured to prevent WalletConnect plugin errors
  try {
    const discoveryWallet = await fcl.config.get("discovery.wallet");
    if (discoveryWallet) {
      console.log("FCL already configured with discovery.wallet, skipping configuration...");
      (window as any).__fclInitialized = true;
      return;
    }
  } catch (e) {
    // FCL not configured yet, proceed with configuration
  }
  
  // Set configuration lock using global window flags
  fclConfiguring = true;
  (window as any).__fclConfiguring = true;
  
  // Double-check that FCL hasn't been configured elsewhere
  if (fclConfigured || (window as any).__fclConfigured) {
    console.log("FCL already configured, skipping...");
    fclConfiguring = false;
    (window as any).__fclConfiguring = false;
    return;
  }
  
  try {
    // Final check - if FCL is already configured, don't configure again
    try {
      const discoveryWallet = await fcl.config.get("discovery.wallet");
      if (discoveryWallet) {
        console.log("FCL already configured with discovery.wallet, skipping configuration...");
        (window as any).__fclInitialized = true;
        (window as any).__fclConfigured = true;
        fclConfigured = true;
        return;
      }
    } catch (e) {
      // FCL not configured yet, proceed
    }

    // Build complete configuration object ONCE to prevent WalletConnect plugin errors
    const walletConnectProjectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID;
    
    if (!walletConnectProjectId) {
      console.error("NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID is not set! Please get a real project ID from https://cloud.walletconnect.com/");
      throw new Error("WalletConnect Project ID is required");
    }

    // Complete FCL configuration - all at once to prevent multiple plugin initializations
    const fclConfig = {
      // Network configuration
      "flow.network": "testnet",
      "accessNode.api": "https://rest-testnet.onflow.org",
      
      // Wallet discovery configuration
      "discovery.wallet": "https://fcl-discovery.onflow.org/testnet/authn",
      "discovery.authn.endpoint": "https://fcl-discovery.onflow.org/api/testnet/authn",
      "discovery.wallet.method": "IFRAME/RPC",
      
      // WalletConnect configuration (required for wallet discovery)
      "walletconnect.projectId": walletConnectProjectId,
      
      // App details for wallet discovery (all at once)
      "app.detail.title": "FlowPay",
      "app.detail.icon": "https://useflowpay.xyz/logo.svg",
      "app.detail.description": "Professional payment platform for Flow blockchain",
      "app.detail.url": "https://useflowpay.xyz",
      
      // OpenID Connect scopes
      "service.OpenID.scopes": "email",
      
      // Transaction limits
      "fcl.limit": 1000,
      
      // Contract addresses for testnet
      "0xFlowToken": "0x7e60df042a9c0868",
      "0xFungibleToken": "0x9a0766d93b6608b7"
    };

    // Configure FCL with complete configuration - ONLY ONCE
    fcl.config(fclConfig);
    
    // Verify configuration was applied
    try {
      const appliedDiscoveryWallet = await fcl.config.get("discovery.wallet");
      console.log("FCL configuration applied successfully. discovery.wallet:", appliedDiscoveryWallet);
    } catch (e) {
      console.error("Failed to verify FCL configuration:", e);
    }
    
    console.log("FCL initialized successfully with complete configuration");
    (window as any).__fclInitialized = true;
    (window as any).__fclConfigured = true;
    fclConfigured = true;
  } catch (error) {
    console.error("FCL initialization failed:", error);
    // Don't try fallback configuration to avoid multiple plugin initializations
    throw error;
  } finally {
    // Always release the configuration lock
    fclConfiguring = false;
    (window as any).__fclConfiguring = false;
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

