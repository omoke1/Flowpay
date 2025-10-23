# Webhook Setup Script for FlowPay (PowerShell)
Write-Host "🔧 Setting up webhook environment variables..." -ForegroundColor Green

# Check if .env.local exists
if (-not (Test-Path ".env.local")) {
    Write-Host "📝 Creating .env.local from template..." -ForegroundColor Yellow
    Copy-Item "env.template" ".env.local"
    Write-Host "✅ Created .env.local" -ForegroundColor Green
} else {
    Write-Host "✅ .env.local already exists" -ForegroundColor Green
}

# Generate webhook secret using Node.js
Write-Host "🔐 Generating webhook secret..." -ForegroundColor Yellow
$WEBHOOK_SECRET = & node -e "console.log('whsec_' + require('crypto').randomBytes(32).toString('hex'))"

# Add webhook configuration to .env.local
Add-Content -Path ".env.local" -Value ""
Add-Content -Path ".env.local" -Value "# Webhook Configuration"
Add-Content -Path ".env.local" -Value "WEBHOOK_SECRET=$WEBHOOK_SECRET"
Add-Content -Path ".env.local" -Value "WEBHOOK_TIMEOUT=30000"
Add-Content -Path ".env.local" -Value "WEBHOOK_MAX_RETRIES=3"
Add-Content -Path ".env.local" -Value "WEBHOOK_RETRY_DELAY=1000"

Write-Host "✅ Webhook environment variables configured!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Next steps:" -ForegroundColor Cyan
Write-Host "1. Run the Supabase SQL script: supabase-settings-tables.sql" -ForegroundColor White
Write-Host "2. Start your development server: npm run dev" -ForegroundColor White
Write-Host "3. Test webhook delivery in the Settings page" -ForegroundColor White
Write-Host ""
Write-Host "🔐 Your webhook secret: $WEBHOOK_SECRET" -ForegroundColor Yellow
Write-Host "⚠️  Keep this secret secure and never commit it to version control!" -ForegroundColor Red