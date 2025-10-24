# 🔐 Admin Wallet Setup Guide

## Overview
FlowPay now supports real Flow account creation with admin wallet funding. This guide explains how to set up and fund your admin wallet.

## 🚀 Quick Setup

### 1. Create Admin Wallet
1. Create a new Flow wallet (use Blocto, Ledger, or any Flow wallet)
2. Fund it with FLOW tokens (recommended: 1-2 FLOW)
3. Get the wallet address and private key

### 2. Environment Variables
Add these to your `.env.local` file:

```bash
# Admin Wallet Configuration (REQUIRED)
ADMIN_WALLET_ADDRESS=0x1234567890abcdef...
ADMIN_WALLET_PRIVATE_KEY=your_private_key_here
```

### 3. Fund Admin Wallet
- **Minimum Balance:** 0.1 FLOW (for safety)
- **Recommended Balance:** 1-2 FLOW (for 500-1000 accounts)
- **Cost per Account:** ~0.002 FLOW (0.001 storage + 0.001 transaction)

## 💰 Cost Breakdown

| Item | Cost (FLOW) | Description |
|------|-------------|-------------|
| Storage Deposit | 0.001 | Required for new account storage |
| Transaction Fee | 0.001 | Network transaction cost |
| **Total per Account** | **0.002** | Complete account creation cost |

## 🔧 Configuration

### Admin Wallet Settings
```typescript
const ADMIN_WALLET = {
  address: process.env.ADMIN_WALLET_ADDRESS,
  privateKey: process.env.ADMIN_WALLET_PRIVATE_KEY,
  accountCreationCost: 0.002, // FLOW per account
  minimumBalance: 0.1 // Minimum admin balance
};
```

### Balance Monitoring
The system automatically:
- ✅ Checks admin balance before account creation
- ✅ Prevents account creation if insufficient funds
- ✅ Returns detailed error messages
- ✅ Estimates costs upfront

## 🛡️ Security Best Practices

### 1. Private Key Security
- **Never commit private keys to git**
- **Use environment variables only**
- **Consider using a hardware wallet for production**
- **Rotate keys regularly**

### 2. Balance Management
- **Monitor admin balance regularly**
- **Set up alerts for low balance**
- **Keep backup funding ready**
- **Use multiple admin wallets for high volume**

### 3. Production Deployment
- **Use Vercel environment variables**
- **Enable encryption for sensitive data**
- **Implement rate limiting**
- **Monitor transaction logs**

## 📊 Monitoring & Alerts

### Balance Checking
```typescript
// Check admin balance
const { balance, sufficient } = await checkAdminBalance();
console.log(`Admin balance: ${balance} FLOW`);
console.log(`Sufficient: ${sufficient}`);
```

### Cost Estimation
```typescript
// Estimate account creation cost
const cost = estimateAccountCreationCost();
console.log(`Cost per account: ${cost} FLOW`);
```

## 🚨 Error Handling

### Common Errors
1. **Insufficient Balance:** Admin wallet needs more FLOW
2. **Invalid Private Key:** Check private key format
3. **Network Issues:** Flow network connectivity problems
4. **Transaction Failed:** Account creation transaction failed

### Error Responses
```json
{
  "error": "Insufficient admin wallet balance",
  "details": "Admin wallet has 0.05 FLOW, but needs at least 0.1 FLOW",
  "adminBalance": "0.05",
  "requiredBalance": "0.1 FLOW"
}
```

## 🔄 Testing

### Test Account Creation
1. Fund admin wallet with test FLOW
2. Create test account via API
3. Verify account on Flowscan
4. Check database record

### Production Testing
1. Use small amounts initially
2. Monitor transaction success rates
3. Test error scenarios
4. Verify cost calculations

## 📈 Scaling

### High Volume Considerations
- **Multiple admin wallets**
- **Load balancing**
- **Queue management**
- **Cost optimization**

### Performance Tips
- **Batch account creation**
- **Optimize transaction fees**
- **Monitor network congestion**
- **Implement retry logic**

## 🆘 Troubleshooting

### Admin Wallet Issues
1. **Check environment variables**
2. **Verify wallet address format**
3. **Ensure sufficient balance**
4. **Test private key access**

### Transaction Issues
1. **Check Flow network status**
2. **Verify transaction parameters**
3. **Monitor gas prices**
4. **Implement retry logic**

## 📞 Support

For issues with admin wallet setup:
- Check Flow network status
- Verify environment variables
- Test with small amounts first
- Monitor transaction logs

---

**Ready to create real Flow accounts with FlowPay!** 🚀
