# Vercel Environment Variables Setup

## Required Environment Variables

You need to set these environment variables in your Vercel project dashboard:

### 1. Database (Supabase) - REQUIRED
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

### 2. Flow Blockchain - REQUIRED
```
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_walletconnect_project_id
```

### 3. Email (Resend) - OPTIONAL
```
RESEND_API_KEY=your_resend_api_key
NEXT_PUBLIC_FROM_EMAIL=noreply@useflowpay.xyz
NEXT_PUBLIC_FROM_EMAIL_NAME=FlowPay
```

### 4. Rate Limiting (Upstash Redis) - OPTIONAL
```
UPSTASH_REDIS_REST_URL=your_upstash_redis_url
UPSTASH_REDIS_REST_TOKEN=your_upstash_redis_token
```

### 5. Application - REQUIRED
```
NEXT_PUBLIC_APP_URL=https://useflowpay.xyz
NODE_ENV=production
```

## How to Set Environment Variables in Vercel

1. Go to your Vercel dashboard
2. Select your FlowPay project
3. Go to Settings → Environment Variables
4. Add each variable with its value
5. Make sure to set them for "Production" environment
6. Redeploy your project after adding variables

## Current Issue

The API is returning 500 errors because the Supabase environment variables are not configured in Vercel. Once you add the required environment variables, the payment-links API should work correctly.

## Testing

After setting the environment variables:
1. Redeploy your project
2. Test the API: `GET https://useflowpay.xyz/api/payment-links?merchantId=0xe610aa56b2399957`
3. The response should be JSON instead of HTML

## Database Setup

Make sure your Supabase project has the required tables:
- `users` table with proper RLS policies
- `payment_links` table with proper RLS policies
- `payments` table with proper RLS policies

## Security Notes

- Never commit environment variables to your repository
- Use Vercel's environment variable system for production
- Keep your service role key secure and never expose it to the client
