#!/usr/bin/env node
/**
 * Test Frontend-Backend Connection
 * This script checks if the frontend can connect to the backend APIs
 */

// Load environment variables from .env.local
const fs = require('fs');
const path = require('path');

function loadEnvFile() {
  const envPath = path.join(__dirname, '.env.local');
  try {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const envVars = {};
    
    envContent.split('\n').forEach(line => {
      const cleanLine = line.trim();
      if (cleanLine && !cleanLine.startsWith('#')) {
        const [key, ...valueParts] = cleanLine.split('=');
        if (key && valueParts.length > 0) {
          envVars[key] = valueParts.join('=');
        }
      }
    });
    
    return envVars;
  } catch (error) {
    console.log('⚠️  No .env.local file found, using defaults');
    return {};
  }
}

async function testConnection() {
  console.log('🔍 Testing Frontend-Backend Connection...\n');
  
  const env = loadEnvFile();
  const apiUrl = env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
  
  console.log(`📡 API URL: ${apiUrl}`);
  console.log(`🔗 Testing connection to: ${apiUrl}\n`);
  
  // Test 1: Health Check
  console.log('1️⃣  Testing Health Endpoint...');
  try {
    const healthResponse = await fetch(`${apiUrl}/health`);
    if (healthResponse.ok) {
      const healthData = await healthResponse.json();
      console.log('✅ Health check passed');
      console.log(`   Status: ${healthResponse.status}`);
      console.log(`   Response:`, JSON.stringify(healthData, null, 2));
    } else {
      console.log(`❌ Health check failed with status: ${healthResponse.status}`);
    }
  } catch (error) {
    console.log(`❌ Health check failed: ${error.message}`);
  }
  
  console.log('\n');
  
  // Test 2: Root Endpoint
  console.log('2️⃣  Testing Root Endpoint...');
  try {
    const rootResponse = await fetch(`${apiUrl}/`);
    if (rootResponse.ok) {
      const rootData = await rootResponse.json();
      console.log('✅ Root endpoint accessible');
      console.log(`   Status: ${rootResponse.status}`);
      console.log(`   Response:`, JSON.stringify(rootData, null, 2));
    } else {
      console.log(`❌ Root endpoint failed with status: ${rootResponse.status}`);
    }
  } catch (error) {
    console.log(`❌ Root endpoint failed: ${error.message}`);
  }
  
  console.log('\n');
  
  // Test 3: API V1 Endpoints
  console.log('3️⃣  Testing API V1 Endpoints...');
  try {
    const v1Response = await fetch(`${apiUrl}/v1/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'invalidpassword'
      })
    });
    
    console.log('✅ API V1 endpoints accessible');
    console.log(`   Status: ${v1Response.status} (expected 400/401 for invalid credentials)`);
    
    if (v1Response.status === 422) {
      console.log('   📝 Validation errors (expected for invalid data)');
    } else if (v1Response.status === 401) {
      console.log('   🔒 Authentication failed (expected for invalid credentials)');
    }
    
  } catch (error) {
    console.log(`❌ API V1 endpoints failed: ${error.message}`);
  }
  
  console.log('\n');
  
  // Summary
  console.log('📊 Connection Test Summary:');
  console.log(`   📡 Backend URL: ${apiUrl}`);
  console.log(`   🌐 Environment: ${env.NEXT_PUBLIC_API_URL ? 'Configured' : 'Default (localhost)'}`);
  
  // Check if pointing to localhost vs production
  if (apiUrl.includes('localhost')) {
    console.log('\n⚠️  NOTICE: Frontend is configured to connect to localhost backend');
    console.log('   For production, update NEXT_PUBLIC_API_URL to your Render URL');
    console.log('   Example: https://creatorpulse-backend.onrender.com');
  } else {
    console.log('\n✅ Frontend is configured for production backend');
  }
}

// Add fetch polyfill for Node.js
if (typeof fetch === 'undefined') {
  global.fetch = require('node-fetch');
}

// Run the test
testConnection().catch(console.error);
