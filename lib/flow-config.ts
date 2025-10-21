import * as fcl from "@onflow/fcl";

// Configure FCL immediately at module load time - BEFORE any async operations
// This prevents the WalletConnect plugin from being loaded with incremental configurations
if (typeof window !== "undefined" && !((window as any).__fclConfigured)) {
  const walletConnectProjectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID;
  
  if (walletConnectProjectId) {
    // Configure FCL synchronously with complete configuration
    fcl.config({
      "flow.network": "testnet",
      "accessNode.api": "https://rest-testnet.onflow.org",
      "discovery.wallet": "https://fcl-discovery.onflow.org/testnet/authn",
      "discovery.authn.endpoint": "https://fcl-discovery.onflow.org/api/testnet/authn",
      "discovery.wallet.method": "IFRAME/RPC",
      "walletconnect.projectId": walletConnectProjectId,
      "app.detail.title": "FlowPay",
      "app.detail.icon": "https://www.useflowpay.xyz/logo.svg",
      "app.detail.description": "Professional payment platform for Flow blockchain",
      "app.detail.url": "https://www.useflowpay.xyz",
      "service.OpenID.scopes": "email",
      "fcl.limit": 1000,
      "0xFlowToken": "0x7e60df042a9c0868",
      "0xFungibleToken": "0x9a0766d93b6608b7",
      // Fix wallet discovery - use POP/RPC for mobile wallets
      "discovery.wallet.method.default": "POP/RPC",
      "discovery.wallet.method.include": ["POP/RPC", "IFRAME/RPC", "TAB/RPC"],
      // Add explicit wallet services for better discovery
      "discovery.wallet.method.include.services": ["https://fcl-discovery.onflow.org/testnet/authn"]
    });
    
    (window as any).__fclConfigured = true;
    console.log("FCL configured synchronously at module load");
  }
}

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

// FCL Configuration function (simplified - just verify configuration)
export const initializeFCL = async () => {
  if (typeof window === "undefined") return;
  
  // FCL is already configured at module load time
  console.log("FCL configuration check - already configured at module load");
  
  // Verify configuration was applied
  try {
    const discoveryWallet = await fcl.config.get("discovery.wallet");
    if (discoveryWallet) {
      console.log("FCL configuration verified. discovery.wallet:", discoveryWallet);
    } else {
      console.warn("FCL configuration issue: discovery.wallet not set");
    }
    
    // Debug wallet discovery
    try {
      const discoveryAuthn = await fcl.config.get("discovery.authn.endpoint");
      console.log("Discovery authn endpoint:", discoveryAuthn);
    } catch (e) {
      console.warn("Could not get discovery authn endpoint:", e);
    }
  } catch (e) {
    console.error("Failed to verify FCL configuration:", e);
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

// Magic.link specific utilities
export const MAGIC_CONFIG = {
  // Magic.link service URL
  serviceUrl: "https://auth.magic.link",
  // Supported authentication methods
  authMethods: ["email", "magic_link"],
  // Default scopes for user data
  scopes: ["email", "profile"]
};

// Wallet type detection
export const getWalletType = (address: string): 'managed' | 'external' => {
  // Magic.link managed wallets typically have specific patterns
  // This is a simplified detection - in production you'd want more sophisticated logic
  return 'external'; // Default to external for now
};

export { fcl };

