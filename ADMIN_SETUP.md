# FlowPay Admin Setup Guide

## Overview

This guide explains how to set up the admin payer account for email-based Flow account creation and configure the platform fee system.

## Prerequisites

1. **Flow Wallet**: You need a Flow wallet with sufficient FLOW balance
2. **Flow CLI**: Install Flow CLI for account management
3. **Environment Variables**: Configure your `.env.local` file

## Step 1: Create Admin Payer Account

### Option A: Use Existing Flow Wallet
If you already have a Flow wallet:

1. Get your wallet address and private key
2. Ensure it has sufficient FLOW balance (recommend 10+ FLOW for testing)

### Option B: Create New Flow Account
If you need to create a new account:

```bash
# Install Flow CLI
npm install -g @onflow/cli

# Create new account
flow accounts create

# Fund the account (testnet)
flow accounts add-contract FlowToken --signer testnet-account
```

## Step 2: Configure Environment Variables

Add these variables to your `.env.local` file:

```env
# Admin Payer Account Configuration
NEXT_PUBLIC_ADMIN_PAYER_ADDRESS=0x1234567890abcdef...  # Your Flow address
ADMIN_PAYER_PRIVATE_KEY=your_private_key_here...      # Your private key (KEEP SECRET!)
ADMIN_PAYER_ACCOUNT_INDEX=0                          # Key index (usually 0)

# Platform Fee Configuration
NEXT_PUBLIC_PLATFORM_FEE_RECIPIENT=0x9876543210...   # Where 0.5% fees go
```

## Step 3: Fund Requirements

### For Testnet
- **Per new account**: 0.011 FLOW (0.001 for storage + 0.01 for operations)
- **Gas fees**: ~0.001 FLOW per transaction
- **Recommended balance**: 1-2 FLOW for testing

### For Mainnet
- **Per new account**: 0.011 FLOW (0.001 for storage + 0.01 for operations)
- **Gas fees**: ~0.001 FLOW per transaction
- **Recommended balance**: 10+ FLOW for production

## Step 4: Platform Fee Configuration

### Setting Up Platform Fee Recipient

1. **Create a dedicated wallet** for platform fees
2. **Set the address** in `NEXT_PUBLIC_PLATFORM_FEE_RECIPIENT`
3. **Monitor the balance** regularly

### Fee Structure
- **Platform fee**: 0.5% of all transactions
- **Applied to**: FLOW and USDC transfers
- **Automatic**: Fees are deducted automatically from payments

## Step 5: Testing the Setup

### Test Account Creation
1. Start your development server
2. Open the registration modal
3. Choose "Create Email Wallet"
4. Enter test email and name
5. Verify account creation in Flow testnet explorer

### Test Platform Fees
1. Create a payment link
2. Make a test payment
3. Verify 0.5% fee is deducted
4. Check platform fee recipient balance

## Step 6: Production Deployment

### Security Checklist
- [ ] Private key stored securely (never in code)
- [ ] Environment variables set in production
- [ ] Platform fee recipient address verified
- [ ] Admin account has sufficient balance
- [ ] Rate limiting configured
- [ ] Error monitoring enabled

### Monitoring
- **Account creation costs**: Track FLOW spent per account
- **Platform fee collection**: Monitor fee recipient balance
- **Error rates**: Watch for failed account creations
- **Gas costs**: Monitor transaction fees

## Troubleshooting

### Common Issues

**"Insufficient funds" error**
- Check admin payer account balance
- Ensure account has enough FLOW for new accounts + gas

**"Account creation failed" error**
- Verify private key is correct
- Check network connectivity
- Ensure account has proper permissions

**"Platform fee recipient not found" error**
- Verify `NEXT_PUBLIC_PLATFORM_FEE_RECIPIENT` address
- Ensure recipient account exists and is funded

### Debug Steps
1. Check console logs for detailed error messages
2. Verify environment variables are loaded
3. Test with Flow testnet first
4. Use Flow CLI to verify account status

## Cost Analysis

### Per New User Account
- **Storage cost**: 0.001 FLOW (one-time)
- **Initial funding**: 0.01 FLOW (for operations)
- **Gas fees**: ~0.001 FLOW
- **Total**: ~0.012 FLOW per account

### Platform Revenue
- **Fee rate**: 0.5% of all transactions
- **Example**: 100 FLOW payment = 0.5 FLOW platform fee
- **Break-even**: ~24 payments per new account

## Security Best Practices

1. **Never commit private keys** to version control
2. **Use environment variables** for all sensitive data
3. **Rotate keys regularly** in production
4. **Monitor account activity** for suspicious transactions
5. **Set up alerts** for low balances
6. **Use hardware wallets** for mainnet admin accounts

## Support

For issues with account creation or platform fees:
1. Check the console logs
2. Verify your Flow account balance
3. Test on Flow testnet first
4. Contact support with specific error messages

---

**Important**: Keep your private keys secure and never share them. The admin payer account has significant FLOW balance and should be protected accordingly.
