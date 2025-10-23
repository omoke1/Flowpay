# Security Guide - FlowPay

## 🚨 CRITICAL: Never Commit Sensitive Keys

### ❌ NEVER COMMIT THESE FILES:
- `.env.local` - Contains all production secrets
- `.env.production` - Production environment variables
- `*.key` - Any private key files
- `secrets.json` - Any secrets file

### ✅ ALWAYS USE PLACEHOLDERS IN:
- Documentation files
- Template files
- Example configurations
- README files

## 🔐 Sensitive Information to Protect

### 1. Supabase Credentials
```env
# ❌ NEVER commit these real values:
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 2. Admin Payer Account
```env
# ❌ NEVER commit these real values:
NEXT_PUBLIC_ADMIN_PAYER_ADDRESS=0x...
ADMIN_PAYER_PRIVATE_KEY=xxx...
ADMIN_PAYER_ACCOUNT_INDEX=0
```

### 3. Admin Security
```env
# ❌ NEVER commit these real values:
ADMIN_WALLET_ADDRESS=0x...
ADMIN_SESSION_SECRET=your-admin-session-secret-here
ADMIN_API_KEY=your-admin-api-key-here
```

### 4. Email Service
```env
# ❌ NEVER commit these real values:
RESEND_API_KEY=your_resend_api_key_here
```

### 5. WalletConnect
```env
# ❌ NEVER commit these real values:
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_walletconnect_project_id
```

## 🛡️ Security Best Practices

### 1. Environment Variables
- ✅ Use `.env.local` for development (never commit)
- ✅ Use Vercel environment variables for production
- ✅ Use placeholder values in documentation
- ✅ Rotate keys regularly in production

### 2. Git Security
- ✅ Always check `.gitignore` includes `.env*`
- ✅ Never commit real API keys
- ✅ Use `git status` before committing
- ✅ If keys are exposed, rotate them immediately

### 3. Production Deployment
- ✅ Set environment variables in Vercel dashboard
- ✅ Never hardcode secrets in code
- ✅ Use different keys for dev/staging/production
- ✅ Monitor for exposed secrets

## 🚨 If Keys Are Exposed

### Immediate Actions:
1. **Rotate all exposed keys immediately**
2. **Check git history for other exposures**
3. **Update all production environments**
4. **Monitor for unauthorized access**

### Supabase Key Exposure:
1. Go to Supabase Dashboard → Settings → API
2. Generate new service role key
3. Update all environments with new key
4. Revoke old key

### Admin Key Exposure:
1. Generate new admin payer account
2. Update all environment variables
3. Transfer funds to new account
4. Revoke old account access

## 📋 Security Checklist

Before committing code:
- [ ] No real API keys in code
- [ ] No real private keys in code
- [ ] No real database URLs in code
- [ ] All sensitive values use placeholders
- [ ] `.env.local` is in `.gitignore`
- [ ] Documentation uses example values

## 🔍 How to Check for Exposed Secrets

### Search for real keys:
```bash
# Search for potential exposed keys
grep -r "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9" . --exclude-dir=node_modules
grep -r "0x[a-fA-F0-9]{40}" . --exclude-dir=node_modules
grep -r "sk_" . --exclude-dir=node_modules
grep -r "pk_" . --exclude-dir=node_modules
```

### Check git history:
```bash
# Check if sensitive files were ever committed
git log --name-only | grep -E "\.env|secrets|keys"
```

## 🚀 Production Security

### Environment Variables in Vercel:
1. Go to Vercel Dashboard → Project → Settings → Environment Variables
2. Add all required variables with real values
3. Set for Production, Preview, and Development
4. Never commit these values to git

### Monitoring:
- Set up alerts for failed authentication attempts
- Monitor database access logs
- Track API key usage
- Monitor for unusual activity

## 📞 Emergency Response

If secrets are exposed:
1. **Immediately rotate all affected keys**
2. **Check for unauthorized access**
3. **Update all environments**
4. **Notify team members**
5. **Review git history for other exposures**

Remember: **Security is everyone's responsibility!**
