# 🚀 FlowPay Mainnet Migration Guide

## 🎯 Overview

This guide will help you migrate FlowPay from testnet to mainnet, enabling real transactions and on-chain tracking for production use.

## ✅ Pre-Migration Checklist

### **1. Environment Variables**
Ensure your `.env.local` has the correct mainnet configuration:

```env
# Flow Network Configuration
NEXT_PUBLIC_FLOW_NETWORK=mainnet
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_walletconnect_project_id

# Supabase Database (Required)
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Admin Configuration
NEXT_PUBLIC_ADMIN_PAYER_ADDRESS=0x...
ADMIN_PAYER_PRIVATE_KEY=xxx...
NEXT_PUBLIC_PLATFORM_FEE_RECIPIENT=0x...
```

### **2. Mainnet Contract Addresses**
The application is already configured with correct mainnet addresses:

- **FlowToken**: `0x1654653399040a61`
- **FungibleToken**: `0x9a0766d93b6608b7`
- **USDC**: `0x3c5959b568896393`

### **3. Network Configuration**
Flow provider is configured for mainnet:
- **Access Node**: `https://rest-mainnet.onflow.org`
- **Discovery Wallet**: `https://fcl-discovery.onflow.org/authn`
- **Network**: Mainnet (production)

## 🔧 Migration Steps

### **Step 1: Update Environment Variables**

1. **Set Network to Mainnet:**
   ```env
   NEXT_PUBLIC_FLOW_NETWORK=mainnet
   ```

2. **Verify Supabase Configuration:**
   - Ensure your Supabase project is set up
   - Run the database setup scripts
   - Test database connectivity

3. **Update Admin Configuration:**
   - Set up admin payer account on mainnet
   - Configure platform fee recipient address
   - Test admin functionality

### **Step 2: Test Mainnet Configuration**

1. **Start Development Server:**
   ```bash
   npm run dev
   ```

2. **Test Wallet Connection:**
   - Connect with a mainnet Flow wallet
   - Verify user creation in database
   - Test payment link creation

3. **Test Payment Flow:**
   - Create a payment link
   - Process a test payment
   - Verify transaction on blockchain

### **Step 3: Deploy to Production**

1. **Build Application:**
   ```bash
   npm run build
   ```

2. **Deploy to Vercel:**
   - Set environment variables in Vercel dashboard
   - Deploy application
   - Test production functionality

3. **Configure Domain:**
   - Set up custom domain
   - Update CORS settings
   - Test payment links

## 🔍 On-Chain Transaction Tracking

### **Flowscan (Primary Explorer)**
- **URL**: https://flowscan.org
- **Features**: 
  - Real-time transaction monitoring
  - Block explorer
  - Contract verification
  - Account analysis

### **Flow View (Account Details)**
- **URL**: https://flowview.app
- **Features**:
  - Detailed account information
  - Balance tracking
  - Storage analysis
  - Staking details

### **Transaction Monitoring**
1. **Get Transaction Hash:**
   ```javascript
   const txHash = await fcl.mutate({
     cadence: FLOW_TRANSFER_TRANSACTION,
     args: [fcl.arg(amount, fcl.t.UFix64), fcl.arg(recipient, fcl.t.Address)]
   });
   ```

2. **Track on Flowscan:**
   - Visit: `https://flowscan.org/transaction/${txHash}`
   - Monitor transaction status
   - Verify completion

3. **Account Monitoring:**
   - Visit: `https://flowscan.org/account/${address}`
   - Track balance changes
   - Monitor transaction history

## 🛡️ Security Considerations

### **1. Private Key Management**
- ✅ **Never expose private keys** in code
- ✅ **Use environment variables** for sensitive data
- ✅ **Rotate keys regularly** in production
- ✅ **Use hardware wallets** for admin accounts

### **2. Transaction Verification**
- ✅ **Verify all transactions** on blockchain
- ✅ **Implement transaction monitoring**
- ✅ **Set up alerts** for failed transactions
- ✅ **Monitor gas fees** and network congestion

### **3. Rate Limiting**
- ✅ **Implement rate limiting** for API endpoints
- ✅ **Monitor transaction frequency**
- ✅ **Set up abuse detection**
- ✅ **Implement circuit breakers**

## 📊 Production Monitoring

### **1. Transaction Metrics**
- **Success Rate**: Monitor successful vs failed transactions
- **Gas Fees**: Track gas costs and optimization opportunities
- **Processing Time**: Monitor transaction confirmation times
- **Volume**: Track daily/weekly transaction volumes

### **2. Error Monitoring**
- **Failed Transactions**: Track and analyze failures
- **Network Issues**: Monitor Flow network status
- **User Errors**: Track common user mistakes
- **System Errors**: Monitor application errors

### **3. Performance Metrics**
- **Response Times**: API and transaction response times
- **Throughput**: Transactions per second capacity
- **Uptime**: Application availability monitoring
- **User Experience**: Payment completion rates

## 🚀 Go-Live Checklist

### **Pre-Launch**
- [ ] Environment variables configured for mainnet
- [ ] Supabase database set up and tested
- [ ] Admin accounts configured
- [ ] Payment links tested end-to-end
- [ ] Transaction tracking verified
- [ ] Security audit completed
- [ ] Performance testing done

### **Launch Day**
- [ ] Deploy to production
- [ ] Monitor transaction processing
- [ ] Verify payment completions
- [ ] Check blockchain explorer
- [ ] Monitor error rates
- [ ] User feedback collection

### **Post-Launch**
- [ ] Daily transaction monitoring
- [ ] Weekly performance reviews
- [ ] Monthly security audits
- [ ] Quarterly feature updates
- [ ] User feedback analysis

## 🔗 Useful Links

### **Flow Blockchain Resources**
- **Flowscan**: https://flowscan.org
- **Flow View**: https://flowview.app
- **Flow Status**: https://status.flow.com
- **Flow Documentation**: https://developers.flow.com

### **FlowPay Resources**
- **Production Setup**: `SUPABASE_PRODUCTION_SETUP.md`
- **Security Guide**: `SECURITY_GUIDE.md`
- **Webhook Setup**: `WEBHOOK_SETUP_GUIDE.md`
- **Admin Setup**: `ADMIN_SECURITY_SETUP.md`

## 🎉 Success Metrics

### **Technical Metrics**
- ✅ **99.9% uptime** for payment processing
- ✅ **< 30 seconds** average transaction time
- ✅ **< 1% failure rate** for payments
- ✅ **Real-time monitoring** of all transactions

### **Business Metrics**
- ✅ **User adoption** of payment links
- ✅ **Transaction volume** growth
- ✅ **Revenue tracking** through platform fees
- ✅ **Customer satisfaction** with payment experience

## 🆘 Troubleshooting

### **Common Issues**
1. **Transaction Failures**: Check gas fees and network congestion
2. **Wallet Connection**: Verify Flow Discovery API status
3. **Database Errors**: Check Supabase connectivity
4. **Payment Processing**: Verify contract addresses

### **Support Resources**
- **Flow Discord**: https://discord.gg/flow
- **Flow Forum**: https://forum.flow.com
- **FlowPay Documentation**: Check project README
- **GitHub Issues**: Report bugs and feature requests

---

**🎯 Ready for Mainnet!** Your FlowPay application is now configured for production use with real transactions and on-chain tracking capabilities.
