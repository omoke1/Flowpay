import * as fcl from "@onflow/fcl";

// Testnet contract addresses
export const CONTRACTS = {
  FungibleToken: "0x9a0766d93b6608b7",
  FlowToken: "0x0ae53cb6e3f42a79",
  // USDC.e address on testnet (to be updated with actual address)
  USDC: "0x0ae53cb6e3f42a79",
};

// FCL Configuration function (to be called once on client-side)
export const initializeFCL = () => {
  if (typeof window === "undefined") return;
  
  fcl.config({
    "accessNode.api": "https://rest-testnet.onflow.org",
    "discovery.wallet": "https://fcl-discovery.onflow.org/testnet/authn",
    "discovery.authn.endpoint": "https://fcl-discovery.onflow.org/api/testnet/authn",
    "app.detail.title": "FlowPay",
    "app.detail.icon": "https://flowpay.app/logo.svg",
    "service.OpenID.scopes": "email",
    // Additional configuration for better UX
    "fcl.limit": 1000,
    "fcl.eventPollRate": 2000,
    // Network configuration
    "flow.network": "testnet",
    // Flow Port configuration for managed wallets
    "fcl.port": "https://port.onflow.org"
  });
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
    import FungibleToken from 0x9a0766d93b6608b7
    import FlowToken from 0x0ae53cb6e3f42a79
    
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
    import FungibleToken from 0x9a0766d93b6608b7
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

