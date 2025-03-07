#!/usr/bin/env node

/**
 * This script checks if all required environment variables are set.
 * It's useful for debugging CI/CD issues.
 */

const requiredEnvVars = [
  'DATABASE_URL',
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
];

console.log('Checking environment variables...');

const missingVars = requiredEnvVars.filter(varName => {
  const value = process.env[varName];
  const isMissing = !value;
  
  console.log(`${varName}: ${isMissing ? 'MISSING' : 'SET'}`);
  
  return isMissing;
});

if (missingVars.length > 0) {
  console.error('\nMissing environment variables:');
  missingVars.forEach(varName => console.error(`- ${varName}`));
  console.error('\nPlease set these variables in your .env file or in your CI/CD environment.');
  process.exit(1);
} else {
  console.log('\nAll required environment variables are set!');
  process.exit(0);
} 