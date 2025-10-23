# FlowPay Admin Security Setup

## 🔒 **Separate Admin Domain Setup**

### **Production Setup:**
- **Admin URL**: `https://admin.useflowpay.xyz` (or your custom admin domain)
- **User URL**: `https://useflowpay.xyz` (main application)

### **Development Setup:**
- **Admin URL**: `http://localhost:3002/admin`
- **User URL**: `http://localhost:3002` (main application)

## 🛡️ **Admin Security Features**

### **1. Separate Authentication**
- ✅ **Admin-only wallet connection**
- ✅ **No user registration on admin domain**
- ✅ **Separate session management**
- ✅ **Admin wallet whitelist**

### **2. Access Control**
- ✅ **Middleware protection** for `/admin/*` routes
- ✅ **API route protection** for `/api/admin/*`
- ✅ **Admin wallet verification**
- ✅ **Session timeout handling**

### **3. Security Headers**
- ✅ **CORS protection** for admin routes
- ✅ **X-Frame-Options** to prevent clickjacking
- ✅ **Content Security Policy** for admin pages
- ✅ **Rate limiting** for admin endpoints

## 🔧 **Setup Instructions**

### **Step 1: Configure Admin Wallet**

**Add to your `.env.local`:**
```env
# Admin Security Configuration
ADMIN_WALLET_ADDRESS=0x1234567890abcdef...
ADMIN_SESSION_SECRET=your-secret-key-here
ADMIN_SESSION_TIMEOUT=3600

# Admin API Protection
ADMIN_API_KEY=your-admin-api-key
```

### **Step 2: Set Up Admin Wallet Whitelist**

**Run this SQL in Supabase:**
```sql
-- Create admin wallets table
CREATE TABLE IF NOT EXISTS admin_wallets (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    wallet_address VARCHAR(255) UNIQUE NOT NULL,
    admin_name VARCHAR(255) NOT NULL,
    permissions JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add your admin wallet
INSERT INTO admin_wallets (wallet_address, admin_name, permissions) VALUES
('0x1234567890abcdef...', 'Main Admin', '{"all": true}');

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_admin_wallets_address ON admin_wallets(wallet_address);
CREATE INDEX IF NOT EXISTS idx_admin_wallets_active ON admin_wallets(is_active);
```

### **Step 3: Configure Domain Routing**

**For Production (Vercel):**
1. **Add custom domain** for admin: `admin.useflowpay.xyz`
2. **Configure DNS** to point to your Vercel deployment
3. **Set environment variables** in Vercel dashboard

**For Development:**
- Admin is accessible at `http://localhost:3002/admin`
- Main app at `http://localhost:3002`

### **Step 4: Admin Wallet Connection**

**The admin system requires:**
1. **Flow wallet connection** (only admin wallets allowed)
2. **Wallet signature verification**
3. **Admin session creation**
4. **Permission validation**

## 🔐 **Security Best Practices**

### **1. Admin Wallet Management**
- ✅ **Use hardware wallets** for admin accounts
- ✅ **Rotate admin wallets** regularly
- ✅ **Monitor admin activity** logs
- ✅ **Set up alerts** for admin actions

### **2. Access Control**
- ✅ **IP whitelisting** (optional)
- ✅ **Time-based access** restrictions
- ✅ **Multi-signature** requirements for critical actions
- ✅ **Audit logging** for all admin actions

### **3. Environment Security**
- ✅ **Separate admin environment** variables
- ✅ **Encrypted admin sessions**
- ✅ **Secure admin API keys**
- ✅ **Regular security audits**

## 📋 **Admin Features**

### **Dashboard Features:**
- 📊 **Platform Statistics** (users, transactions, fees)
- ⚙️ **Configuration Management** (admin payer, fee rates)
- 👥 **User Management** (view users, account creation)
- 💰 **Fee Management** (platform fee tracking)
- 🔒 **Security Settings** (admin access, permissions)

### **API Endpoints:**
- `GET /api/admin/stats` - Platform statistics
- `GET /api/admin/config` - Admin configuration
- `PUT /api/admin/config` - Update configuration
- `POST /api/admin/auth/login` - Admin authentication
- `POST /api/admin/auth/logout` - Admin logout

## 🚨 **Security Warnings**

### **Critical Security Notes:**
1. **Never expose admin routes** to public users
2. **Always verify admin wallet** signatures
3. **Log all admin actions** for audit trails
4. **Use HTTPS** for all admin communications
5. **Regular security updates** and monitoring

### **Admin Wallet Requirements:**
- **Sufficient FLOW balance** for account funding
- **Hardware wallet** recommended for production
- **Backup wallet** for emergency access
- **Regular security audits** of admin wallets

## 🔧 **Troubleshooting**

### **Common Issues:**

**"Admin access denied"**
- Check if wallet is in admin whitelist
- Verify wallet signature
- Check admin session status

**"Configuration update failed"**
- Verify admin permissions
- Check API authentication
- Review error logs

**"Statistics not loading"**
- Check database connections
- Verify admin API access
- Review Supabase permissions

## 📞 **Support**

For admin security issues:
1. Check admin wallet whitelist
2. Verify environment variables
3. Review admin session logs
4. Contact support with specific error messages

---

**⚠️ IMPORTANT**: Keep your admin wallet secure and never share admin access credentials. The admin system has full control over the platform.
