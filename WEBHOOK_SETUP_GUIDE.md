# Webhook Environment Variables Setup Guide

## Required Environment Variables

### 1. **WEBHOOK_SECRET** (Required)
This is the main secret key used for webhook signature verification.

```bash
# Generate a secure random secret (32+ characters)
WEBHOOK_SECRET=whsec_1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef
```

**How to generate:**
```bash
# Using Node.js
node -e "console.log('whsec_' + require('crypto').randomBytes(32).toString('hex'))"

# Using OpenSSL
openssl rand -hex 32

# Or use any secure random string generator
```

### 2. **Webhook Delivery Settings** (Optional)
These control webhook delivery behavior:

```bash
# Timeout for webhook delivery (milliseconds)
WEBHOOK_TIMEOUT=30000

# Maximum number of retry attempts
WEBHOOK_MAX_RETRIES=3

# Initial retry delay (milliseconds)
WEBHOOK_RETRY_DELAY=1000
```

### 3. **Database Setup** (Required)
Make sure your Supabase database has the required tables:

```sql
-- Run this in your Supabase SQL editor:
-- (Copy the contents of supabase-settings-tables.sql)
```

## Setting Up Environment Variables

### For Local Development (.env.local)

1. **Copy the template:**
```bash
cp env.template .env.local
```

2. **Edit .env.local and add your webhook secret:**
```bash
# Webhook secret (generate a secure random string)
WEBHOOK_SECRET=whsec_your_secure_random_string_here

# Optional webhook settings
WEBHOOK_TIMEOUT=30000
WEBHOOK_MAX_RETRIES=3
WEBHOOK_RETRY_DELAY=1000
```

### For Production (Vercel)

1. **Go to your Vercel dashboard**
2. **Select your project**
3. **Go to Settings > Environment Variables**
4. **Add the following variables:**

| Variable | Value | Environment |
|----------|-------|-------------|
| `WEBHOOK_SECRET` | `whsec_your_secure_random_string` | Production, Preview |
| `WEBHOOK_TIMEOUT` | `30000` | Production, Preview |
| `WEBHOOK_MAX_RETRIES` | `3` | Production, Preview |
| `WEBHOOK_RETRY_DELAY` | `1000` | Production, Preview |

## Webhook Endpoints

### 1. **Main Webhook Endpoint**
```
POST /api/webhook
```

**Headers required:**
- `X-Webhook-Signature`: `sha256=...` (HMAC-SHA256 signature)
- `X-Webhook-Event`: Event type (e.g., `payment.completed`)
- `X-Webhook-ID`: Unique webhook ID
- `Content-Type`: `application/json`

### 2. **Webhook Logs Endpoint**
```
GET /api/settings/webhook-logs?walletAddress=0x...
```

### 3. **Settings Endpoint**
```
GET /api/settings?walletAddress=0x...
PATCH /api/settings
```

## Testing Webhook Delivery

### 1. **Set up a test webhook URL**
```bash
# Use ngrok for local testing
ngrok http 3000

# Or use webhook.site for testing
# https://webhook.site/your-unique-url
```

### 2. **Configure webhook in settings:**
1. Go to Settings page
2. Add your webhook URL in the "Webhook URL" field
3. Save settings

### 3. **Test webhook delivery:**
1. Create a payment link
2. Make a test payment
3. Check webhook logs in Settings > Webhook Logs

## Webhook Event Types

### Payment Events
- `payment.completed` - When a payment is successfully completed
- `payment.failed` - When a payment fails
- `payment.refunded` - When a payment is refunded

### Payment Link Events
- `payment_link.created` - When a payment link is created
- `payment_link.updated` - When a payment link is updated
- `payment_link.deleted` - When a payment link is deleted

## Webhook Payload Example

```json
{
  "id": "evt_1234567890_abcdef",
  "type": "payment.completed",
  "data": {
    "payment": {
      "id": "payment_123",
      "linkId": "link_456",
      "payerAddress": "0x1234...5678",
      "amount": "100.00",
      "token": "FLOW",
      "txHash": "0xabcdef...",
      "status": "completed",
      "paidAt": "2024-01-01T00:00:00Z"
    },
    "merchant": {
      "id": "merchant_789",
      "walletAddress": "0x9876...5432"
    }
  },
  "timestamp": "2024-01-01T00:00:00Z",
  "merchantId": "0x9876...5432"
}
```

## Security Best Practices

### 1. **Always verify webhook signatures:**
```javascript
// Your webhook endpoint should verify the signature
const signature = request.headers.get('x-webhook-signature');
const isValid = webhookDeliveryService.verifyWebhookSignature(
  payload,
  signature,
  process.env.WEBHOOK_SECRET
);
```

### 2. **Use HTTPS for webhook URLs:**
- Never use HTTP in production
- Always use HTTPS endpoints
- Consider using webhook.site for testing

### 3. **Implement idempotency:**
- Use webhook IDs to prevent duplicate processing
- Store processed webhook IDs in your database

### 4. **Monitor webhook delivery:**
- Check webhook logs regularly
- Set up alerts for failed webhooks
- Monitor retry attempts

## Troubleshooting

### Common Issues

1. **Webhook not delivered:**
   - Check webhook URL is correct
   - Verify webhook endpoint is accessible
   - Check webhook logs for error details

2. **Signature verification failed:**
   - Ensure WEBHOOK_SECRET is set correctly
   - Verify signature format: `sha256=...`
   - Check payload is not modified

3. **Timeout errors:**
   - Increase WEBHOOK_TIMEOUT value
   - Check webhook endpoint response time
   - Consider using webhook queue for heavy processing

### Debug Commands

```bash
# Check environment variables
echo $WEBHOOK_SECRET

# Test webhook endpoint
curl -X POST http://localhost:3000/api/webhook \
  -H "Content-Type: application/json" \
  -H "X-Webhook-Signature: sha256=..." \
  -H "X-Webhook-Event: payment.completed" \
  -H "X-Webhook-ID: test_123" \
  -d '{"test": "data"}'
```

## Production Checklist

- [ ] WEBHOOK_SECRET is set and secure
- [ ] Database tables are created (run supabase-settings-tables.sql)
- [ ] Webhook URLs use HTTPS
- [ ] Webhook endpoints are accessible
- [ ] Signature verification is implemented
- [ ] Webhook logs are monitored
- [ ] Retry logic is configured
- [ ] Error handling is in place


