// Test MongoDB connection in Vercel environment
import { MongoClient } from 'mongodb';

console.log('=== MongoDB Connection Test for Vercel ===');

// Test different MongoDB configurations
const configs = [
  {
    name: 'Minimal config',
    options: {}
  },
  {
    name: 'Basic TLS config',
    options: {
      tls: true
    }
  },
  {
    name: 'Full TLS config',
    options: {
      tls: true,
      tlsAllowInvalidCertificates: false,
      tlsAllowInvalidHostnames: false
    }
  },
  {
    name: 'Production config',
    options: {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 10000,
      maxIdleTimeMS: 30000,
      tls: true,
      tlsAllowInvalidCertificates: false,
      tlsAllowInvalidHostnames: false
    }
  }
];

async function testConfig(config) {
  try {
    console.log(`\n--- Testing: ${config.name} ---`);
    console.log('Options:', JSON.stringify(config.options, null, 2));
    
    const uri = process.env.MONGODB_URI || process.env.MONGO_URI;
    if (!uri) {
      console.log('❌ No MongoDB URI found');
      return;
    }
    
    console.log('URI length:', uri.length);
    console.log('URI starts with:', uri.substring(0, 20) + '...');
    
    const client = new MongoClient(uri, config.options);
    
    console.log('⏳ Connecting...');
    await client.connect();
    console.log('✅ Connected successfully!');
    
    const db = client.db();
    console.log('📁 Database name:', db.databaseName);
    
    const collections = await db.listCollections().toArray();
    console.log('📊 Collections:', collections.map(c => c.name));
    
    await client.close();
    console.log('✅ Disconnected successfully');
    
    return true;
  } catch (error) {
    console.log('❌ Error:', error.message);
    if (error.code) console.log('Error code:', error.code);
    return false;
  }
}

async function runTests() {
  for (const config of configs) {
    const success = await testConfig(config);
    if (success) {
      console.log(`\n🎉 ${config.name} WORKS! Use this configuration.`);
      break;
    }
  }
}

runTests().catch(console.error);
