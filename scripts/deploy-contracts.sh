#!/bin/bash

# FlowPay Smart Contract Deployment Script
# This script deploys FlowPay contracts to Flow mainnet
# Run this to make FlowPay truly on-chain for judge verification

set -e

echo "🚀 FlowPay Contract Deployment to Flow Mainnet"
echo "=============================================="

# Check if Flow CLI is installed
if ! command -v flow &> /dev/null; then
    echo "❌ Flow CLI not found. Please install it first:"
    echo "   https://developers.flow.com/tools/flow-cli/install"
    exit 1
fi

# Check if we're on mainnet
echo "🔍 Verifying Flow network configuration..."
flow config get

# Create deployment account if it doesn't exist
echo "📝 Creating deployment account..."
if ! flow accounts get flowpay-deployer &> /dev/null; then
    echo "Creating new deployment account..."
    flow accounts create --key 0x$(openssl rand -hex 32) --name flowpay-deployer
else
    echo "Deployment account already exists"
fi

# Deploy FlowPayPlatform contract
echo "📦 Deploying FlowPayPlatform contract..."
flow contracts deploy contracts/FlowPayPlatform.cdc \
    --network mainnet \
    --account flowpay-deployer \
    --args-json '{"platformFeeRecipient": "0x1234567890abcdef"}'

# Get contract address
PLATFORM_ADDRESS=$(flow contracts get FlowPayPlatform --network mainnet)
echo "✅ FlowPayPlatform deployed at: $PLATFORM_ADDRESS"

# Deploy PaymentProcessor contract
echo "📦 Deploying PaymentProcessor contract..."
flow contracts deploy contracts/PaymentProcessor.cdc \
    --network mainnet \
    --account flowpay-deployer

# Get contract address
PROCESSOR_ADDRESS=$(flow contracts get PaymentProcessor --network mainnet)
echo "✅ PaymentProcessor deployed at: $PROCESSOR_ADDRESS"

# Deploy FlowPayTokenVault contract
echo "📦 Deploying FlowPayTokenVault contract..."
flow contracts deploy contracts/FlowPayTokenVault.cdc \
    --network mainnet \
    --account flowpay-deployer

# Get contract address
VAULT_ADDRESS=$(flow contracts get FlowPayTokenVault --network mainnet)
echo "✅ FlowPayTokenVault deployed at: $VAULT_ADDRESS"

# Create deployment summary
echo "📋 Deployment Summary"
echo "===================="
echo "Network: Flow Mainnet"
echo "FlowPayPlatform: $PLATFORM_ADDRESS"
echo "PaymentProcessor: $PROCESSOR_ADDRESS"
echo "FlowPayTokenVault: $VAULT_ADDRESS"
echo ""
echo "🔗 Flowscan Links:"
echo "Platform: https://flowscan.org/contract/$PLATFORM_ADDRESS"
echo "Processor: https://flowscan.org/contract/$PROCESSOR_ADDRESS"
echo "Vault: https://flowscan.org/contract/$VAULT_ADDRESS"
echo ""
echo "✅ FlowPay is now deployed on Flow mainnet!"
echo "Judges can verify your project is truly on-chain using these addresses."
