#!/bin/bash

# Webhook Setup Script for FlowPay
echo "🔧 Setting up webhook environment variables..."

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    echo "📝 Creating .env.local from template..."
    cp env.template .env.local
    echo "✅ Created .env.local"
else
    echo "✅ .env.local already exists"
fi

# Generate webhook secret
echo "🔐 Generating webhook secret..."
WEBHOOK_SECRET=$(node -e "console.log('whsec_' + require('crypto').randomBytes(32).toString('hex'))")

# Add webhook configuration to .env.local
echo "" >> .env.local
echo "# Webhook Configuration" >> .env.local
echo "WEBHOOK_SECRET=$WEBHOOK_SECRET" >> .env.local
echo "WEBHOOK_TIMEOUT=30000" >> .env.local
echo "WEBHOOK_MAX_RETRIES=3" >> .env.local
echo "WEBHOOK_RETRY_DELAY=1000" >> .env.local

echo "✅ Webhook environment variables configured!"
echo ""
echo "📋 Next steps:"
echo "1. Run the Supabase SQL script: supabase-settings-tables.sql"
echo "2. Start your development server: npm run dev"
echo "3. Test webhook delivery in the Settings page"
echo ""
echo "🔐 Your webhook secret: $WEBHOOK_SECRET"
echo "⚠️  Keep this secret secure and never commit it to version control!"


