// Database cleanup script - Remove all mock/demo/test data
// This script will remove companies and visitors with fake domains like example.com, test.com, etc.

import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

let cachedClient = null;
let cachedDb = null;

async function connectToDatabase() {
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb };
  }

  const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI;
  if (!MONGO_URI) {
    throw new Error('MongoDB URI not found in environment variables');
  }

  const client = new MongoClient(MONGO_URI, {
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
    connectTimeoutMS: 10000,
    maxIdleTimeMs: 30000,
    tls: true,
    tlsAllowInvalidCertificates: false,
    tlsAllowInvalidHostnames: false
  });
  
  await client.connect();
  const db = client.db();

  cachedClient = client;
  cachedDb = db;

  return { client, db };
}

// List of mock/demo/test domains and patterns to remove
const MOCK_DOMAINS = [
  'example.com',
  'test.com', 
  'demo.com',
  'sample.com',
  'fake.com',
  'mock.com',
  'localhost',
  '127.0.0.1',
  'acme.com',
  'company.com',
  'business.com'
];

const MOCK_NAME_PATTERNS = [
  /example/i,
  /test/i,
  /demo/i,
  /sample/i,
  /fake/i,
  /mock/i,
  /acme/i,
  /unknown/i,
  /placeholder/i
];

async function cleanMockData() {
  try {
    console.log('🧹 Starting database cleanup - removing mock/demo data...');
    
    const { db } = await connectToDatabase();
    
    // Clean companies collection
    console.log('\n📊 Cleaning companies collection...');
    const companiesCollection = db.collection('companies');
    
    // Find mock companies by domain
    const mockCompaniesByDomain = await companiesCollection.find({
      domain: { $in: MOCK_DOMAINS }
    }).toArray();
    
    console.log(`Found ${mockCompaniesByDomain.length} companies with mock domains`);
    
    // Find mock companies by name patterns
    const mockCompaniesByName = await companiesCollection.find({
      $or: MOCK_NAME_PATTERNS.map(pattern => ({ name: { $regex: pattern } }))
    }).toArray();
    
    console.log(`Found ${mockCompaniesByName.length} companies with mock names`);
    
    // Delete mock companies by domain
    if (mockCompaniesByDomain.length > 0) {
      const domainDeleteResult = await companiesCollection.deleteMany({
        domain: { $in: MOCK_DOMAINS }
      });
      console.log(`✅ Deleted ${domainDeleteResult.deletedCount} companies with mock domains`);
    }
    
    // Delete mock companies by name patterns
    if (mockCompaniesByName.length > 0) {
      const nameDeleteResult = await companiesCollection.deleteMany({
        $or: MOCK_NAME_PATTERNS.map(pattern => ({ name: { $regex: pattern } }))
      });
      console.log(`✅ Deleted ${nameDeleteResult.deletedCount} companies with mock names`);
    }
    
    // Clean visitors collection
    console.log('\n👥 Cleaning visitors collection...');
    const visitorsCollection = db.collection('visitors');
    
    // Find mock visitors by domain
    const mockVisitorsByDomain = await visitorsCollection.find({
      domain: { $in: MOCK_DOMAINS }
    }).toArray();
    
    console.log(`Found ${mockVisitorsByDomain.length} visitors with mock domains`);
    
    // Delete mock visitors
    if (mockVisitorsByDomain.length > 0) {
      const visitorsDeleteResult = await visitorsCollection.deleteMany({
        domain: { $in: MOCK_DOMAINS }
      });
      console.log(`✅ Deleted ${visitorsDeleteResult.deletedCount} visitors with mock domains`);
    }
    
    // Clean visits collection
    console.log('\n🔍 Cleaning visits collection...');
    const visitsCollection = db.collection('visits');
    
    // Find mock visits by domain
    const mockVisitsByDomain = await visitsCollection.find({
      domain: { $in: MOCK_DOMAINS }
    }).toArray();
    
    console.log(`Found ${mockVisitsByDomain.length} visits with mock domains`);
    
    // Delete mock visits
    if (mockVisitsByDomain.length > 0) {
      const visitsDeleteResult = await visitsCollection.deleteMany({
        domain: { $in: MOCK_DOMAINS }
      });
      console.log(`✅ Deleted ${visitsDeleteResult.deletedCount} visits with mock domains`);
    }
    
    // Summary of remaining real data
    console.log('\n📈 Summary of remaining REAL data:');
    const remainingCompanies = await companiesCollection.countDocuments();
    const remainingVisitors = await visitorsCollection.countDocuments();
    const remainingVisits = await visitsCollection.countDocuments();
    
    console.log(`📊 Companies: ${remainingCompanies}`);
    console.log(`👥 Visitors: ${remainingVisitors}`);
    console.log(`🔍 Visits: ${remainingVisits}`);
    
    // Show sample of remaining data (first 5 companies)
    if (remainingCompanies > 0) {
      console.log('\n📋 Sample of remaining companies:');
      const sampleCompanies = await companiesCollection.find().limit(5).toArray();
      sampleCompanies.forEach((company, index) => {
        console.log(`  ${index + 1}. ${company.name || 'Unknown'} (${company.domain || 'no-domain'})`);
      });
    }
    
    console.log('\n✅ Database cleanup completed! Only real visitor data remains.');
    
  } catch (error) {
    console.error('❌ Error during database cleanup:', error);
    throw error;
  }
}

// Run the cleanup
cleanMockData()
  .then(() => {
    console.log('\n🎉 Cleanup completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Cleanup failed:', error);
    process.exit(1);
  });
