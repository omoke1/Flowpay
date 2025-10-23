# Supabase Tables Setup Guide

## Overview
The FlowPay application requires additional Supabase tables for settings, webhooks, and session management. These tables are not created automatically and need to be set up manually.

## Required Tables

The following tables need to be created in your Supabase database:

1. **user_settings** - Stores user preferences and API keys
2. **webhook_logs** - Stores webhook delivery attempts and logs
3. **session_tokens** - Stores JWT tokens for session management

## Setup Instructions

### Step 1: Access Supabase Dashboard
1. Go to [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Select your FlowPay project
3. Navigate to the **SQL Editor** tab

### Step 2: Execute SQL Script
1. Copy the contents of `supabase-settings-tables.sql`
2. Paste the SQL script into the SQL Editor
3. Click **Run** to execute the script

### Step 3: Verify Tables Creation
After running the script, you should see the following tables in your database:
- `user_settings`
- `webhook_logs` 
- `session_tokens`

## SQL Script Location
The SQL script is located at: `supabase-settings-tables.sql

## Fallback Behavior
If the tables don't exist, the application will:
- Return default settings for users (not persisted)
- Disable webhook logging (logs will be lost)
- Show warnings in the console

## Troubleshooting

### Error: "relation does not exist"
This means the tables haven't been created yet. Follow the setup instructions above.

### Error: "permission denied"
Make sure you're using the correct Supabase project and have the necessary permissions.

### Error: "duplicate key value"
The tables might already exist. Check if they're already created in your database.

## Verification
After setup, you can verify the tables exist by:
1. Going to **Table Editor** in Supabase Dashboard
2. Looking for the three new tables
3. Testing the API endpoints (they should work without 500 errors)

## Next Steps
Once the tables are created:
1. Restart your development server
2. Test the dashboard pages
3. Verify that settings, webhooks, and session management work correctly


