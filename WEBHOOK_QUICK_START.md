# 🚀 Webhook Quick Start Guide

## 1. Generate Webhook Secret

### Option A: Using the setup script (Recommended)
```bash
# Windows PowerShell
.\scripts\setup-webhooks.ps1

# Or manually run the Node.js script
node scripts/generate-webhook-secret.js
```

### Option B: Manual setup
1. Copy `env.template` to `.env.local`
2. Add your webhook secret:
```bash
WEBHOOK_SECRET=whsec_your_secure_random_string_here
WEBHOOK_TIMEOUT=30000
WEBHOOK_MAX_RETRIES=3
WEBHOOK_RETRY_DELAY=1000
```

## 2. Create Database Tables

Run this SQL in your Supabase dashboard:
```sql
-- Copy and paste the contents of supabase-settings-tables.sql
```

## 3. Test Webhook Delivery

### Set up a test webhook URL:
- Use [webhook.site](https://webhook.site) for testing
- Or use ngrok: `ngrok http 3000`

### Configure in Settings:
1. Go to Settings page
2. Add your webhook URL
3. Save settings

### Test payment:
1. Create a payment link
2. Make a test payment
3. Check webhook logs in Settings

## 4. Environment Variables Summary

| Variable | Description | Example |
|----------|-------------|---------|
| `WEBHOOK_SECRET` | Secret for signature verification | `whsec_abc123...` |
| `WEBHOOK_TIMEOUT` | Delivery timeout (ms) | `30000` |
| `WEBHOOK_MAX_RETRIES` | Max retry attempts | `3` |
| `WEBHOOK_RETRY_DELAY` | Base retry delay (ms) | `1000` |

## 5. Webhook Endpoints

- **Main webhook**: `POST /api/webhook`
- **Webhook logs**: `GET /api/settings/webhook-logs`
- **Settings**: `GET /api/settings`

## 6. Security Notes

- ✅ Always use HTTPS for webhook URLs
- ✅ Keep `WEBHOOK_SECRET` secure
- ✅ Verify webhook signatures
- ✅ Monitor webhook delivery logs

## 7. Troubleshooting

### Webhook not delivered?
- Check webhook URL is accessible
- Verify signature verification
- Check webhook logs for errors

### Need help?
- Check `WEBHOOK_SETUP_GUIDE.md` for detailed instructions
- Review webhook logs in Settings page
- Test with webhook.site first


