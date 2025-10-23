# FlowPay Smart Contract Deployment Guide

This guide will help you deploy FlowPay smart contracts to Flow mainnet, making your project truly on-chain and verifiable by judges.

## 🎯 **Why Deploy Smart Contracts?**

Unlike Ethereum/Base where you can easily verify on-chain projects, Flow requires smart contract deployment to prove your project is truly blockchain-based. This deployment will:

- ✅ **Prove FlowPay is on-chain** (not just a frontend)
- ✅ **Enable judge verification** via Flowscan
- ✅ **Show real transaction data** and contract interactions
- ✅ **Demonstrate platform fee collection** on-chain
- ✅ **Provide contract addresses** for verification

## 📋 **Prerequisites**

### 1. Install Flow CLI
```bash
# macOS
brew install flow-cli

# Linux/Windows
curl -fsSL https://raw.githubusercontent.com/onflow/flow-cli/master/install.sh | sh
```

### 2. Create Flow Account
```bash
# Create a new Flow account for deployment
flow accounts create --key 0x$(openssl rand -hex 32) --name flowpay-deployer
```

### 3. Fund Your Account
- Get FLOW tokens from [Flow Faucet](https://faucet.onflow.org/)
- Or buy FLOW on exchanges like Coinbase, Binance, etc.

## 🚀 **Deployment Steps**

### Step 1: Deploy Contracts
```bash
# Make deployment script executable
chmod +x scripts/deploy-contracts.sh

# Run deployment
./scripts/deploy-contracts.sh
```

### Step 2: Verify Deployment
```bash
# Install Node.js dependencies
npm install

# Run verification
node scripts/verify-deployment.js
```

### Step 3: Update Frontend
After deployment, update your frontend to use the deployed contract addresses:

```typescript
// Update lib/flow-transactions.ts
const FLOWPAY_CONTRACTS = {
  MAINNET: {
    PLATFORM: '0x1234567890abcdef', // Your deployed address
    PROCESSOR: '0xabcdef1234567890', // Your deployed address
    VAULT: '0x9876543210fedcba'     // Your deployed address
  }
};
```

## 🔍 **Judge Verification**

### Contract Addresses
After deployment, you'll get contract addresses like:
- **FlowPayPlatform**: `0x1234567890abcdef`
- **PaymentProcessor**: `0xabcdef1234567890`
- **FlowPayTokenVault**: `0x9876543210fedcba`

### Flowscan Links
Judges can verify your contracts at:
- **Platform**: https://flowscan.org/contract/0x1234567890abcdef
- **Processor**: https://flowscan.org/contract/0xabcdef1234567890
- **Vault**: https://flowscan.org/contract/0x9876543210fedcba

### What Judges Can See
1. **Contract Code**: Full Cadence smart contract source code
2. **Transaction History**: All payments processed through your contracts
3. **Platform Fees**: Real fee collection on-chain
4. **User Activity**: Actual user interactions with your contracts
5. **Volume Metrics**: Total volume processed through your platform

## 📊 **Contract Features**

### FlowPayPlatform Contract
- **Platform fee collection** (0.5%)
- **Fee vault management**
- **Transaction processing**
- **Metrics tracking**

### PaymentProcessor Contract
- **Payment record management**
- **Transaction status tracking**
- **User payment history**
- **Platform metrics**

### FlowPayTokenVault Contract
- **FLOW token storage**
- **USDC token storage**
- **Vault management**
- **Transaction tracking**

## 🎯 **For Hackathon Judges**

### How to Verify FlowPay is On-Chain

1. **Check Contract Addresses**: Use the provided contract addresses
2. **Visit Flowscan**: Click the Flowscan links to see contracts
3. **Review Contract Code**: See the full Cadence smart contract code
4. **Check Transaction History**: View real transactions processed
5. **Verify Platform Fees**: See actual fee collection on-chain

### Key Metrics to Look For
- **Total Transactions**: Number of payments processed
- **Total Volume**: Amount of FLOW/USDC processed
- **Platform Fees**: Fees collected by the platform
- **Active Users**: Number of unique users
- **Contract Interactions**: Real on-chain activity

## 🔧 **Troubleshooting**

### Common Issues

1. **"Flow CLI not found"**
   ```bash
   # Install Flow CLI
   curl -fsSL https://raw.githubusercontent.com/onflow/flow-cli/master/install.sh | sh
   ```

2. **"Insufficient funds"**
   ```bash
   # Get FLOW tokens from faucet
   # Visit: https://faucet.onflow.org/
   ```

3. **"Contract deployment failed"**
   ```bash
   # Check network connection
   flow config get
   
   # Verify account has funds
   flow accounts get flowpay-deployer
   ```

### Getting Help
- **Flow Documentation**: https://developers.flow.com/
- **Flow Discord**: https://discord.gg/flow
- **Flowscan**: https://flowscan.org/

## ✅ **Success Checklist**

- [ ] Flow CLI installed
- [ ] Flow account created and funded
- [ ] Contracts deployed to mainnet
- [ ] Deployment verified
- [ ] Frontend updated with contract addresses
- [ ] Judge verification links ready
- [ ] Contract metrics documented

## 🎉 **Result**

After successful deployment, FlowPay will be:
- ✅ **Truly on-chain** with deployed smart contracts
- ✅ **Verifiable by judges** via Flowscan
- ✅ **Processing real transactions** on Flow mainnet
- ✅ **Collecting platform fees** on-chain
- ✅ **Trackable and transparent** for all users

Your FlowPay project will now be a legitimate blockchain application, not just a frontend!
