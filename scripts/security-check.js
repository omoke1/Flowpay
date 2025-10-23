#!/usr/bin/env node

/**
 * Security Check Script
 * 
 * This script checks for exposed secrets and sensitive information
 * in the codebase to prevent accidental commits.
 */

const fs = require('fs');
const path = require('path');

// Patterns that indicate exposed secrets
const SECRET_PATTERNS = [
  // JWT tokens (Supabase keys)
  {
    pattern: /eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/g,
    name: 'JWT Token (Supabase Key)',
    severity: 'HIGH'
  },
  
  // Private keys
  {
    pattern: /private[_-]?key[_-]?[=:]\s*[a-fA-F0-9]{64,}/gi,
    name: 'Private Key',
    severity: 'CRITICAL'
  },
  
  // API keys
  {
    pattern: /(api[_-]?key|apikey)[_-]?[=:]\s*[a-zA-Z0-9]{20,}/gi,
    name: 'API Key',
    severity: 'HIGH'
  },
  
  // Supabase URLs with real project IDs
  {
    pattern: /https:\/\/[a-z0-9]{20,}\.supabase\.co/gi,
    name: 'Supabase Project URL',
    severity: 'MEDIUM'
  },
  
  // Flow addresses (might be sensitive)
  {
    pattern: /0x[a-fA-F0-9]{16,}/g,
    name: 'Flow Address',
    severity: 'LOW'
  },
  
  // Email addresses (might be sensitive)
  {
    pattern: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
    name: 'Email Address',
    severity: 'LOW'
  }
];

// Files to exclude from scanning
const EXCLUDE_PATTERNS = [
  'node_modules',
  '.git',
  '.next',
  'dist',
  'build',
  'coverage',
  '.env.local',
  '.env.production',
  'package-lock.json',
  'yarn.lock'
];

function shouldExcludeFile(filePath) {
  return EXCLUDE_PATTERNS.some(pattern => filePath.includes(pattern));
}

function scanFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const issues = [];
    
    SECRET_PATTERNS.forEach(({ pattern, name, severity }) => {
      const matches = content.match(pattern);
      if (matches) {
        matches.forEach(match => {
          // Skip if it's clearly a placeholder
          if (match.includes('your-') || match.includes('placeholder') || match.includes('example')) {
            return;
          }
          
          issues.push({
            file: filePath,
            pattern: name,
            severity,
            match: match.substring(0, 50) + (match.length > 50 ? '...' : ''),
            line: content.substring(0, content.indexOf(match)).split('\n').length
          });
        });
      }
    });
    
    return issues;
  } catch (error) {
    console.warn(`Warning: Could not read file ${filePath}: ${error.message}`);
    return [];
  }
}

function scanDirectory(dirPath) {
  const issues = [];
  
  try {
    const items = fs.readdirSync(dirPath);
    
    for (const item of items) {
      const fullPath = path.join(dirPath, item);
      const stat = fs.statSync(fullPath);
      
      if (shouldExcludeFile(fullPath)) {
        continue;
      }
      
      if (stat.isDirectory()) {
        issues.push(...scanDirectory(fullPath));
      } else if (stat.isFile() && (item.endsWith('.js') || item.endsWith('.ts') || item.endsWith('.tsx') || item.endsWith('.md') || item.endsWith('.json'))) {
        issues.push(...scanFile(fullPath));
      }
    }
  } catch (error) {
    console.warn(`Warning: Could not scan directory ${dirPath}: ${error.message}`);
  }
  
  return issues;
}

function main() {
  console.log('🔍 Security Check - Scanning for exposed secrets...\n');
  
  const issues = scanDirectory('.');
  
  if (issues.length === 0) {
    console.log('✅ No exposed secrets found!');
    return;
  }
  
  // Group by severity
  const critical = issues.filter(i => i.severity === 'CRITICAL');
  const high = issues.filter(i => i.severity === 'HIGH');
  const medium = issues.filter(i => i.severity === 'MEDIUM');
  const low = issues.filter(i => i.severity === 'LOW');
  
  console.log('🚨 SECURITY ISSUES FOUND:\n');
  
  if (critical.length > 0) {
    console.log('🔴 CRITICAL ISSUES:');
    critical.forEach(issue => {
      console.log(`  ${issue.file}:${issue.line} - ${issue.pattern}`);
      console.log(`    Match: ${issue.match}`);
    });
    console.log('');
  }
  
  if (high.length > 0) {
    console.log('🟠 HIGH SEVERITY:');
    high.forEach(issue => {
      console.log(`  ${issue.file}:${issue.line} - ${issue.pattern}`);
      console.log(`    Match: ${issue.match}`);
    });
    console.log('');
  }
  
  if (medium.length > 0) {
    console.log('🟡 MEDIUM SEVERITY:');
    medium.forEach(issue => {
      console.log(`  ${issue.file}:${issue.line} - ${issue.pattern}`);
      console.log(`    Match: ${issue.match}`);
    });
    console.log('');
  }
  
  if (low.length > 0) {
    console.log('🟢 LOW SEVERITY:');
    low.forEach(issue => {
      console.log(`  ${issue.file}:${issue.line} - ${issue.pattern}`);
      console.log(`    Match: ${issue.match}`);
    });
    console.log('');
  }
  
  console.log('📋 RECOMMENDATIONS:');
  console.log('1. Remove or replace all exposed secrets with placeholders');
  console.log('2. Add sensitive files to .gitignore');
  console.log('3. Rotate any exposed keys immediately');
  console.log('4. Check git history for other exposures');
  console.log('5. Set up pre-commit hooks to prevent future exposures');
  
  if (critical.length > 0 || high.length > 0) {
    console.log('\n🚨 DO NOT COMMIT until all critical and high severity issues are fixed!');
    process.exit(1);
  }
}

main();
