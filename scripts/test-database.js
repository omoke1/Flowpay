#!/usr/bin/env node

/**
 * Database Connection Test Script
 * 
 * This script tests the Supabase connection and checks if tables exist.
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Read .env.local file manually
function loadEnvFile() {
  const envPath = path.join(process.cwd(), '.env.local');
  if (!fs.existsSync(envPath)) {
    console.log('❌ .env.local file not found');
    return {};
  }
  
  const envContent = fs.readFileSync(envPath, 'utf8');
  const envVars = {};
  
  envContent.split('\n').forEach(line => {
    const [key, ...valueParts] = line.split('=');
    if (key && valueParts.length > 0) {
      envVars[key.trim()] = valueParts.join('=').trim();
    }
  });
  
  return envVars;
}

const envVars = loadEnvFile();

async function testDatabase() {
  console.log('🔍 Testing Supabase Database Connection...\n');
  
  // Check environment variables
  const supabaseUrl = envVars.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = envVars.SUPABASE_SERVICE_ROLE_KEY;
  
  console.log('📋 Environment Variables:');
  console.log(`NEXT_PUBLIC_SUPABASE_URL: ${supabaseUrl ? '✅ Set' : '❌ Missing'}`);
  console.log(`SUPABASE_SERVICE_ROLE_KEY: ${supabaseKey ? '✅ Set' : '❌ Missing'}`);
  
  if (!supabaseUrl || !supabaseKey) {
    console.log('\n❌ Missing required environment variables!');
    console.log('Please check your .env.local file.');
    return;
  }
  
  if (supabaseUrl.includes('your-project-id') || supabaseKey.includes('your_')) {
    console.log('\n❌ Placeholder values detected!');
    console.log('Please update your .env.local with real Supabase credentials.');
    return;
  }
  
  try {
    // Create Supabase client
    const supabase = createClient(supabaseUrl, supabaseKey);
    console.log('\n🔗 Supabase client created successfully');
    
    // Test connection by checking if users table exists
    console.log('\n📊 Testing database tables...');
    
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*')
      .limit(1);
    
    if (usersError) {
      console.log('❌ Users table error:', usersError.message);
      
      if (usersError.message.includes('relation "users" does not exist')) {
        console.log('\n📝 Database tables need to be created!');
        console.log('Please run the SQL script in scripts/setup-database.sql in your Supabase SQL Editor.');
        console.log('\nSteps:');
        console.log('1. Go to your Supabase dashboard');
        console.log('2. Click on "SQL Editor" in the sidebar');
        console.log('3. Copy and paste the contents of scripts/setup-database.sql');
        console.log('4. Click "Run" to execute the script');
        return;
      }
    } else {
      console.log('✅ Users table exists and is accessible');
    }
    
    // Test other tables
    const tables = ['payment_links', 'payments', 'user_settings', 'webhook_logs', 'session_tokens'];
    
    for (const table of tables) {
      const { error } = await supabase
        .from(table)
        .select('*')
        .limit(1);
      
      if (error) {
        console.log(`❌ ${table} table error:`, error.message);
      } else {
        console.log(`✅ ${table} table exists and is accessible`);
      }
    }
    
    console.log('\n🎉 Database connection test completed!');
    
  } catch (error) {
    console.log('\n❌ Database connection failed:', error.message);
    console.log('\nTroubleshooting:');
    console.log('1. Check your Supabase project URL');
    console.log('2. Verify your service role key');
    console.log('3. Ensure your Supabase project is active');
    console.log('4. Check your internet connection');
  }
}

testDatabase().catch(console.error);
