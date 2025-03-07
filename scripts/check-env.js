#!/usr/bin/env node

/**
 * Environment Variable Checker
 * 
 * This script checks if all required environment variables are set.
 * It's used in the CI pipeline to ensure that all necessary variables
 * are available before running the build.
 */

const requiredEnvVars = [
  'DATABASE_URL',
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY'
];

const missingEnvVars = [];

console.log('Checking environment variables...');

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    missingEnvVars.push(envVar);
    console.error(`❌ Missing required environment variable: ${envVar}`);
  } else {
    // Don't log the actual value for security reasons
    console.log(`✅ ${envVar} is set`);
  }
}

if (missingEnvVars.length > 0) {
  console.error(`\n❌ Missing ${missingEnvVars.length} required environment variables.`);
  console.error('Please set the following environment variables:');
  missingEnvVars.forEach(envVar => {
    console.error(`  - ${envVar}`);
  });
  
  // In CI, we want to continue even if environment variables are missing
  if (process.env.CI !== 'true') {
    process.exit(1);
  } else {
    console.warn('\n⚠️ Running in CI environment, continuing despite missing variables.');
  }
} else {
  console.log('\n✅ All required environment variables are set.');
} 