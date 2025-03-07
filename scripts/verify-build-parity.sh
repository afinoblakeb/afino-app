#!/bin/bash

# Script to verify build parity with Vercel

echo "🔍 Verifying build parity with Vercel..."

# Check if Prisma schema is in sync with the database
echo "📊 Checking Prisma schema..."
npx prisma validate || { echo "❌ Prisma schema validation failed"; exit 1; }

# Generate Prisma client
echo "🔄 Generating Prisma client..."
npx prisma generate || { echo "❌ Prisma client generation failed"; exit 1; }

# Clean install dependencies to match Vercel's fresh install
echo "🧹 Cleaning node_modules and package-lock.json..."
rm -rf node_modules package-lock.json

echo "📦 Installing dependencies..."
npm install || { echo "❌ Dependency installation failed"; exit 1; }

# Run TypeScript type checking
echo "🔍 Running TypeScript type checking..."
npx tsc --noEmit || { echo "❌ TypeScript type checking failed"; exit 1; }

# Run ESLint
echo "🔍 Running ESLint..."
npm run lint || { echo "❌ ESLint check failed"; exit 1; }

# Run the build
echo "🏗️ Running build..."
npm run build || { echo "❌ Build failed"; exit 1; }

echo "✅ Build parity verification completed successfully!"
echo "🚀 Your code should build successfully on Vercel." 