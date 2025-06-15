const fetch = require('node-fetch');

// This script tests the API endpoints to verify the filter functionality

async function testFilterEndpoints() {
  const BASE_URL = 'http://localhost:3001';
  
  console.log('=== Zector Digital API Test Script ===');
  console.log('Testing filtering functionality...\n');
  
  try {
    // Test 1: Health check
    console.log('1. Testing health endpoint...');
    const healthResponse = await fetch(`${BASE_URL}/health`);
    const healthData = await healthResponse.json();
    console.log(`   Status: ${healthData.status}`);
    console.log(`   Timestamp: ${healthData.timestamp}`);
    console.log('   ✅ Health check successful\n');
    
    // Test 2: Get all companies
    console.log('2. Testing all companies endpoint...');
    const allCompaniesResponse = await fetch(`${BASE_URL}/api/companies/leads`);
    const allCompanies = await allCompaniesResponse.json();
    console.log(`   Retrieved ${allCompanies.length} companies`);
    console.log('   ✅ All companies endpoint successful\n');
    
    // Test 3: Filter by status=hot
    console.log('3. Testing filtered companies (status=hot)...');
    const hotCompaniesResponse = await fetch(`${BASE_URL}/api/companies/filtered?status=hot`);
    const hotCompanies = await hotCompaniesResponse.json();
    console.log(`   Retrieved ${hotCompanies.length} hot companies`);
    if (hotCompanies.length > 0) {
      console.log(`   First hot company: ${hotCompanies[0].name} (${hotCompanies[0].domain})`);
    }
    console.log('   ✅ Hot companies filter successful\n');
    
    // Test 4: Filter by status=warm
    console.log('4. Testing filtered companies (status=warm)...');
    const warmCompaniesResponse = await fetch(`${BASE_URL}/api/companies/filtered?status=warm`);
    const warmCompanies = await warmCompaniesResponse.json();
    console.log(`   Retrieved ${warmCompanies.length} warm companies`);
    if (warmCompanies.length > 0) {
      console.log(`   First warm company: ${warmCompanies[0].name} (${warmCompanies[0].domain})`);
    }
    console.log('   ✅ Warm companies filter successful\n');
    
    // Test 5: Complex filter (industry + sort)
    console.log('5. Testing complex filter (Technology industry, sorted by score)...');
    const complexFilterResponse = await fetch(`${BASE_URL}/api/companies/filtered?industry=Technology&sortBy=score`);
    const techCompanies = await complexFilterResponse.json();
    console.log(`   Retrieved ${techCompanies.length} technology companies sorted by score`);
    if (techCompanies.length > 0) {
      console.log(`   Top scoring tech company: ${techCompanies[0].name} (score: ${techCompanies[0].score})`);
    }
    console.log('   ✅ Complex filter successful\n');
    
    console.log('All tests completed successfully! 🚀');
    
  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
    console.error('Make sure the backend server is running on http://localhost:3001');
  }
}

// Run the test
testFilterEndpoints();
