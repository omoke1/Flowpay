#!/usr/bin/env node

/**
 * Check Database Schema Script
 * 
 * This script checks the actual schema of the users table.
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

async function checkSchema() {
  console.log('🔍 Checking Database Schema...\n');
  
  const supabaseUrl = envVars.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = envVars.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    console.log('❌ Missing environment variables');
    return;
  }
  
  try {
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Try to get the table schema
    console.log('📊 Checking users table schema...');
    
    // First, let's try to select from the table to see what columns exist
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .limit(1);
    
    if (error) {
      console.log('❌ Error querying users table:', error.message);
      console.log('Error code:', error.code);
      console.log('Error details:', error.details);
      console.log('Error hint:', error.hint);
      return;
    }
    
    console.log('✅ Users table is accessible');
    console.log('📋 Sample data structure:', data.length > 0 ? Object.keys(data[0]) : 'No data in table');
    
    // Try to insert a test record to see what happens
    console.log('\n🧪 Testing insert operation...');
    const testData = {
      address: '0x1234567890abcdef',
      name: 'Test User',
      email: 'test@example.com',
      role: 'user',
      account_funded_by: 'test'
    };
    
    const { data: insertData, error: insertError } = await supabase
      .from('users')
      .insert([testData])
      .select();
    
    if (insertError) {
      console.log('❌ Insert error:', insertError.message);
      console.log('Error code:', insertError.code);
      console.log('Error details:', insertError.details);
      console.log('Error hint:', insertError.hint);
    } else {
      console.log('✅ Insert successful:', insertData);
      
      // Clean up test data
      await supabase
        .from('users')
        .delete()
        .eq('address', '0x1234567890abcdef');
      console.log('🧹 Test data cleaned up');
    }
    
  } catch (error) {
    console.log('❌ Unexpected error:', error.message);
  }
}

checkSchema().catch(console.error);
