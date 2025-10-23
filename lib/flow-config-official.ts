// Official Flow configuration following the documentation
// https://developers.flow.com/blockchain-development-tutorials/cadence/getting-started/cadence-environment-setup

import { config } from '@onflow/fcl';

// Flow network configuration
const FLOW_CONFIG = {
  // Mainnet configuration (production - more stable)
  mainnet: {
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
    // No fallback to testnet - mainnet only
    'discovery.wallet.method.include.services.timeout': 10000,
  },
  // Testnet configuration for development (less stable)
  testnet: {
    'accessNode.api': 'https://rest-testnet.onflow.org',
    'discovery.wallet': 'https://fcl-discovery.onflow.org/testnet/authn',
    'discovery.authn.endpoint': 'https://fcl-discovery.onflow.org/testnet/authn',
    'app.detail.title': 'FlowPay',
    'app.detail.icon': 'https://www.useflowpay.xyz/logo.svg',
    'app.detail.url': 'https://www.useflowpay.xyz',
    'discovery.wallet.method.default': 'IFRAME/RPC',
    'discovery.wallet.method.include': ['IFRAME/RPC', 'POP/RPC', 'TAB/RPC'],
    'discovery.wallet.method.include.services': ['https://fcl-discovery.onflow.org/testnet/authn'],
    'walletconnect.projectId': process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'demo-project-id',
    'discovery.wallet.method.include.services.timeout': 10000,
  }
};

// Initialize Flow configuration
let isConfigured = false;

export function initializeFlowConfig() {
  if (isConfigured) {
    console.log("Flow already configured, skipping...");
    return;
  }
  
  // Use mainnet by default (more stable than testnet)
  // Testnet is often down, so we default to mainnet for better reliability
  const network = process.env.NEXT_PUBLIC_FLOW_NETWORK || 'mainnet';
  const flowConfig = FLOW_CONFIG[network];
  
  console.log(`ℹ️  Note: Testnet is often unstable. Using ${network} for better reliability.`);
  
  // Check if WalletConnect project ID is set
  if (!process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID === 'your_walletconnect_project_id') {
    console.warn('⚠️  WalletConnect Project ID not set! Please set NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID in your .env.local file');
    console.warn('   Get your project ID from: https://cloud.walletconnect.com/');
  }
  
  try {
    // Configure Flow with error handling
    config({
      'accessNode.api': flowConfig['accessNode.api'],
      'discovery.wallet': flowConfig['discovery.wallet'],
      'discovery.authn.endpoint': flowConfig['discovery.authn.endpoint'],
      'app.detail.title': flowConfig['app.detail.title'],
      'app.detail.icon': flowConfig['app.detail.icon'],
      'app.detail.url': flowConfig['app.detail.url'],
      'discovery.wallet.method.default': flowConfig['discovery.wallet.method.default'],
      'discovery.wallet.method.include': flowConfig['discovery.wallet.method.include'],
      'discovery.wallet.method.include.services': flowConfig['discovery.wallet.method.include.services'],
      'walletconnect.projectId': flowConfig['walletconnect.projectId'],
    });
    
    // Verify configuration was applied
    console.log("Flow configuration applied:", {
      'accessNode.api': flowConfig['accessNode.api'],
      'discovery.wallet': flowConfig['discovery.wallet'],
      'discovery.authn.endpoint': flowConfig['discovery.authn.endpoint'],
      'walletconnect.projectId': flowConfig['walletconnect.projectId'],
    });
    
    isConfigured = true;
    console.log(`Flow configured for ${network} network`);
    
  } catch (error) {
    console.error('Error configuring Flow:', error);
    console.warn('Flow configuration failed, but continuing with fallback...');
    
    // Fallback configuration
    try {
      config({
        'accessNode.api': flowConfig['accessNode.api'],
        'discovery.wallet': flowConfig['discovery.wallet'],
        'discovery.authn.endpoint': flowConfig['discovery.authn.endpoint'],
        'app.detail.title': 'FlowPay',
        'app.detail.icon': 'https://www.useflowpay.xyz/logo.svg',
        'app.detail.url': 'https://www.useflowpay.xyz',
        'walletconnect.projectId': flowConfig['walletconnect.projectId'],
      });
      
      isConfigured = true;
      console.log('Flow configured with fallback settings');
      
    } catch (fallbackError) {
      console.error('Fallback Flow configuration also failed:', fallbackError);
      console.warn('Flow may not work properly. Check your network connection and Flow services.');
    }
  }
}

// Export configuration for use in components
export { FLOW_CONFIG };
