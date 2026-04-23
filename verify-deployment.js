#!/usr/bin/env node

/**
 * Deployment Verification Script
 * Run this before deploying to check if all required configs are set
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 WheelShare Deployment Verification\n');

// Check backend .env
console.log('📦 Checking Backend Configuration...');
const backendEnvPath = path.join(__dirname, 'wheelshare-server', '.env');
if (fs.existsSync(backendEnvPath)) {
  const backendEnv = fs.readFileSync(backendEnvPath, 'utf8');
  const checks = {
    'MONGO_URI': backendEnv.includes('MONGO_URI='),
    'JWT_SECRET': backendEnv.includes('JWT_SECRET='),
    'ADMIN_SECRET': backendEnv.includes('ADMIN_SECRET='),
    'PORT': backendEnv.includes('PORT='),
    'ALLOWED_ORIGINS': backendEnv.includes('ALLOWED_ORIGINS='),
  };
  
  Object.entries(checks).forEach(([key, exists]) => {
    console.log(`  ${exists ? '✅' : '❌'} ${key}`);
  });
  
  // Check if using production MongoDB
  if (backendEnv.includes('mongodb://localhost')) {
    console.log('  ⚠️  WARNING: Using localhost MongoDB - update to MongoDB Atlas for production!');
  }
} else {
  console.log('  ❌ Backend .env file not found!');
}

// Check frontend .env.production
console.log('\n🎨 Checking Frontend Production Configuration...');
const frontendEnvPath = path.join(__dirname, 'wheelshare-client', '.env.production');
if (fs.existsSync(frontendEnvPath)) {
  const frontendEnv = fs.readFileSync(frontendEnvPath, 'utf8');
  const hasApiUrl = frontendEnv.includes('VITE_API_URL=');
  console.log(`  ${hasApiUrl ? '✅' : '❌'} VITE_API_URL`);
  
  if (frontendEnv.includes('localhost')) {
    console.log('  ⚠️  WARNING: Using localhost API - update to Render URL for production!');
  }
} else {
  console.log('  ❌ Frontend .env.production file not found!');
}

// Check if Dockerfiles exist
console.log('\n🐳 Checking Docker Configuration...');
const backendDockerfile = path.join(__dirname, 'wheelshare-server', 'Dockerfile');
const frontendDockerfile = path.join(__dirname, 'wheelshare-client', 'Dockerfile');
console.log(`  ${fs.existsSync(backendDockerfile) ? '✅' : '❌'} Backend Dockerfile`);
console.log(`  ${fs.existsSync(frontendDockerfile) ? '✅' : '❌'} Frontend Dockerfile`);

// Check package.json scripts
console.log('\n📜 Checking Package Scripts...');
const backendPackage = path.join(__dirname, 'wheelshare-server', 'package.json');
if (fs.existsSync(backendPackage)) {
  const pkg = JSON.parse(fs.readFileSync(backendPackage, 'utf8'));
  console.log(`  ${pkg.scripts?.start ? '✅' : '❌'} Backend start script`);
  console.log(`  ${pkg.dependencies?.['prom-client'] ? '✅' : '❌'} Prometheus metrics (prom-client)`);
} else {
  console.log('  ❌ Backend package.json not found!');
}

const frontendPackage = path.join(__dirname, 'wheelshare-client', 'package.json');
if (fs.existsSync(frontendPackage)) {
  const pkg = JSON.parse(fs.readFileSync(frontendPackage, 'utf8'));
  console.log(`  ${pkg.scripts?.build ? '✅' : '❌'} Frontend build script`);
} else {
  console.log('  ❌ Frontend package.json not found!');
}

console.log('\n📋 Deployment Checklist:');
console.log('  1. ☐ Create MongoDB Atlas account and get connection string');
console.log('  2. ☐ Deploy backend to Render with environment variables');
console.log('  3. ☐ Update .env.production with Render backend URL');
console.log('  4. ☐ Deploy frontend to Vercel');
console.log('  5. ☐ Update Render ALLOWED_ORIGINS with Vercel URL');
console.log('  6. ☐ Test admin login at /admin route');
console.log('  7. ☐ Test vehicle listing and booking flow');

console.log('\n📖 Read DEPLOYMENT.md for detailed step-by-step instructions\n');
