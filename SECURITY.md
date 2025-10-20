# FlowPay Security Documentation

## 🔐 Security Overview

FlowPay implements multiple layers of security to protect users, transactions, and data. This document outlines the security measures implemented and best practices for deployment.

## 🛡️ Security Features Implemented

### 1. Transaction Verification
- **On-chain verification**: All transactions are verified against the Flow blockchain
- **Amount validation**: Transaction amounts are verified against payment link amounts
- **Recipient validation**: Transaction recipients are verified against merchant addresses
- **Status checking**: Only sealed transactions are accepted

### 2. Rate Limiting
- **API protection**: All API endpoints are protected with rate limiting
- **Endpoint-specific limits**: Different limits for different operations
- **IP-based limiting**: Rate limits are applied per IP address
- **Redis-backed**: Uses Upstash Redis for distributed rate limiting

### 3. Input Validation & Sanitization
- **Zod schemas**: Comprehensive validation schemas for all inputs
- **XSS protection**: DOMPurify sanitization for all text inputs
- **SQL injection prevention**: Parameterized queries via Supabase
- **URL validation**: Proper URL validation for redirects and webhooks

### 4. CORS & CSRF Protection
- **CORS configuration**: Proper cross-origin resource sharing setup
- **Same-origin validation**: CSRF protection via same-origin policy
- **Security headers**: Comprehensive security headers via Next.js config

### 5. Webhook Security
- **Payload validation**: Comprehensive webhook payload validation
- **Origin checking**: Request origin validation
- **User agent filtering**: Bot and crawler detection
- **Event validation**: Proper event structure validation

### 6. Error Logging & Monitoring
- **Structured logging**: Comprehensive error logging with context
- **Security event logging**: Special logging for security events
- **Transaction logging**: Detailed transaction verification logs
- **Rate limit logging**: Rate limiting event tracking

## 🔧 Security Configuration

### Environment Variables Required

```bash
# Database
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Rate Limiting
UPSTASH_REDIS_REST_URL=your_redis_url
UPSTASH_REDIS_REST_TOKEN=your_redis_token

# Flow Blockchain
NEXT_PUBLIC_FLOW_NETWORK=testnet
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id

# Transak
NEXT_PUBLIC_TRANSAK_API_KEY=your_transak_key
TRANSAK_API_SECRET=your_transak_secret

# Email
RESEND_API_KEY=your_resend_key
```

### Rate Limiting Configuration

| Endpoint | Limit | Window |
|----------|-------|--------|
| General API | 100 requests | 1 minute |
| Payment Creation | 10 requests | 1 minute |
| Payment Link Creation | 20 requests | 1 minute |
| Webhooks | 50 requests | 1 minute |
| Settings Operations | 5 requests | 1 minute |

## 🚨 Security Monitoring

### Logged Events

1. **Transaction Verification**
   - Successful verifications
   - Failed verifications with details
   - Amount mismatches
   - Recipient mismatches

2. **Security Events**
   - Rate limit violations
   - Invalid input attempts
   - Webhook verification failures
   - Suspicious activity

3. **API Events**
   - Request/response logging
   - Error tracking
   - Performance monitoring

### Alert Conditions

- Multiple failed transaction verifications
- Rate limit violations from same IP
- Invalid webhook attempts
- Database errors
- Email sending failures

## 🔍 Security Testing

### Manual Testing Checklist

- [ ] Test transaction verification with invalid hashes
- [ ] Test rate limiting with multiple requests
- [ ] Test input validation with malicious inputs
- [ ] Test CORS with different origins
- [ ] Test webhook verification with invalid payloads
- [ ] Test error handling and logging

### Automated Testing

```bash
# Run security tests
npm run test:security

# Run rate limiting tests
npm run test:rate-limit

# Run input validation tests
npm run test:validation
```

## 🚀 Deployment Security

### Pre-deployment Checklist

- [ ] All environment variables configured
- [ ] Rate limiting service (Upstash) configured
- [ ] Database RLS policies enabled
- [ ] Security headers configured
- [ ] Error logging configured
- [ ] Contract addresses verified
- [ ] Webhook endpoints secured

### Production Security

1. **Environment**
   - Use production environment variables
   - Enable HTTPS only
   - Configure proper CORS origins
   - Set up monitoring and alerts

2. **Database**
   - Enable RLS policies
   - Regular backups
   - Monitor for suspicious queries
   - Use connection pooling

3. **Monitoring**
   - Set up error tracking (Sentry)
   - Monitor rate limiting
   - Track security events
   - Set up alerts for anomalies

## 🔐 Best Practices

### For Developers

1. **Never store private keys** - Always use FCL for signing
2. **Validate on server** - Never trust client-side validation alone
3. **Log security events** - Always log suspicious activity
4. **Use environment variables** - Never commit secrets to code
5. **Test edge cases** - Test with invalid inputs and edge cases
6. **Keep dependencies updated** - Regular security patches

### For Deployment

1. **Use HTTPS only** - Never allow HTTP in production
2. **Configure CORS properly** - Restrict to known origins
3. **Set up monitoring** - Monitor for security events
4. **Regular backups** - Backup database regularly
5. **Update dependencies** - Keep all packages updated
6. **Review logs** - Regularly review security logs

## 🆘 Incident Response

### Security Incident Procedure

1. **Immediate Response**
   - Identify the scope of the incident
   - Isolate affected systems if necessary
   - Document the incident

2. **Investigation**
   - Review logs and monitoring data
   - Identify the root cause
   - Assess the impact

3. **Remediation**
   - Fix the security issue
   - Update security measures
   - Test the fix

4. **Post-incident**
   - Document lessons learned
   - Update security procedures
   - Notify stakeholders if required

### Contact Information

- **Security Team**: security@flowpay.app
- **Emergency Contact**: +1-XXX-XXX-XXXX
- **Bug Bounty**: security@flowpay.app

## 📚 Additional Resources

- [Flow Security Best Practices](https://docs.onflow.org/security/)
- [Next.js Security](https://nextjs.org/docs/advanced-features/security-headers)
- [Supabase Security](https://supabase.com/docs/guides/auth/row-level-security)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)

## 🔄 Security Updates

This document is regularly updated as new security measures are implemented. Last updated: December 2024.

For security questions or to report vulnerabilities, please contact: security@flowpay.app
