// FlowPay Contract Verification Script
// This script verifies that FlowPay contracts are deployed on Flow mainnet
// Use this to prove to judges that your project is truly on-chain

const { execSync } = require('child_process');

// FlowPay contract addresses (update these after deployment)
const FLOWPAY_CONTRACTS = {
  MAINNET: {
    PLATFORM: '0x1234567890abcdef', // Update with actual address
    PROCESSOR: '0xabcdef1234567890', // Update with actual address
    VAULT: '0x9876543210fedcba'     // Update with actual address
  },
  TESTNET: {
    PLATFORM: '0x1111111111111111',
    PROCESSOR: '0x2222222222222222',
    VAULT: '0x3333333333333333'
  }
};

// Verification function
async function verifyFlowPayDeployment() {
  console.log('🔍 FlowPay Contract Verification');
  console.log('================================');
  
  try {
    // Check if Flow CLI is available
    try {
      execSync('flow version', { stdio: 'pipe' });
    } catch (error) {
      console.error('❌ Flow CLI not found. Please install it first.');
      return false;
    }
    
    // Verify each contract
    const contracts = [
      { name: 'FlowPayPlatform', address: FLOWPAY_CONTRACTS.MAINNET.PLATFORM },
      { name: 'PaymentProcessor', address: FLOWPAY_CONTRACTS.MAINNET.PROCESSOR },
      { name: 'FlowPayTokenVault', address: FLOWPAY_CONTRACTS.MAINNET.VAULT }
    ];
    
    let allVerified = true;
    
    for (const contract of contracts) {
      try {
        console.log(`\n🔍 Verifying ${contract.name}...`);
        
        // Check if contract exists
        const result = execSync(
          `flow contracts get ${contract.name} --network mainnet`,
          { encoding: 'utf8', stdio: 'pipe' }
        );
        
        if (result.includes(contract.address)) {
          console.log(`✅ ${contract.name} verified at ${contract.address}`);
          console.log(`🔗 Flowscan: https://flowscan.org/contract/${contract.address}`);
        } else {
          console.log(`❌ ${contract.name} verification failed`);
          allVerified = false;
        }
      } catch (error) {
        console.log(`❌ ${contract.name} not found on mainnet`);
        allVerified = false;
      }
    }
    
    // Generate verification report
    console.log('\n📋 Verification Report');
    console.log('====================');
    
    if (allVerified) {
      console.log('✅ All FlowPay contracts verified on Flow mainnet!');
      console.log('\n🎯 Judge Verification Links:');
      console.log(`Platform Contract: https://flowscan.org/contract/${FLOWPAY_CONTRACTS.MAINNET.PLATFORM}`);
      console.log(`Processor Contract: https://flowscan.org/contract/${FLOWPAY_CONTRACTS.MAINNET.PROCESSOR}`);
      console.log(`Vault Contract: https://flowscan.org/contract/${FLOWPAY_CONTRACTS.MAINNET.VAULT}`);
      
      console.log('\n📊 Contract Metrics:');
      console.log('- Platform fee collection: 0.5%');
      console.log('- Payment processing: Real-time');
      console.log('- Token management: FLOW & USDC');
      console.log('- Network: Flow Mainnet');
      
      return true;
    } else {
      console.log('❌ Some contracts failed verification');
      console.log('Please check your deployment and try again.');
      return false;
    }
    
  } catch (error) {
    console.error('❌ Verification failed:', error.message);
    return false;
  }
}

// Run verification
if (require.main === module) {
  verifyFlowPayDeployment()
    .then(success => {
      if (success) {
        console.log('\n🎉 FlowPay is successfully deployed on Flow mainnet!');
        console.log('Judges can now verify your project is truly on-chain.');
      } else {
        console.log('\n❌ Verification failed. Please check your deployment.');
        process.exit(1);
      }
    })
    .catch(error => {
      console.error('❌ Verification error:', error);
      process.exit(1);
    });
}

module.exports = { verifyFlowPayDeployment, FLOWPAY_CONTRACTS };
