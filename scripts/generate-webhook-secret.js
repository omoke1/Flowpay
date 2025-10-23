#!/usr/bin/env node

// Script to generate a secure webhook secret
const crypto = require('crypto');

function generateWebhookSecret() {
  // Generate 32 random bytes and convert to hex
  const randomBytes = crypto.randomBytes(32);
  const secret = 'whsec_' + randomBytes.toString('hex');
  
  console.log('🔐 Generated Webhook Secret:');
  console.log('');
  console.log(`WEBHOOK_SECRET=${secret}`);
  console.log('');
  console.log('📝 Add this to your .env.local file:');
  console.log('');
  console.log('# Webhook Configuration');
  console.log(`WEBHOOK_SECRET=${secret}`);
  console.log('WEBHOOK_TIMEOUT=30000');
  console.log('WEBHOOK_MAX_RETRIES=3');
  console.log('WEBHOOK_RETRY_DELAY=1000');
  console.log('');
  console.log('⚠️  Keep this secret secure and never commit it to version control!');
}

generateWebhookSecret();


