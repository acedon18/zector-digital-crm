// Quick cleanup script for remaining test data
import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

async function connectToDatabase() {
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
  return { client, db };
}

async function cleanRemainingTestData() {
  try {
    console.log('🧹 Cleaning remaining test data...');
    const { client, db } = await connectToDatabase();
    
    const visitsCollection = db.collection('visits');
    
    // Remove test-website.com visits
    const testWebsiteResult = await visitsCollection.deleteMany({
      domain: "test-website.com"
    });
    console.log(`✅ Deleted ${testWebsiteResult.deletedCount} test-website.com visits`);
    
    // Remove visits with null or undefined domains
    const nullDomainResult = await visitsCollection.deleteMany({
      $or: [
        { domain: null },
        { domain: "null" },
        { domain: "Unknown" },
        { domain: { $exists: false } }
      ]
    });
    console.log(`✅ Deleted ${nullDomainResult.deletedCount} visits with null/unknown domains`);
    
    // Remove visits from PowerShell testing
    const powerShellResult = await visitsCollection.deleteMany({
      userAgent: { $regex: /PowerShell/i }
    });
    console.log(`✅ Deleted ${powerShellResult.deletedCount} PowerShell test visits`);
    
    // Show remaining data
    const remainingVisits = await visitsCollection.countDocuments();
    console.log(`📊 Remaining visits: ${remainingVisits}`);
    
    if (remainingVisits > 0) {
      const sampleVisits = await visitsCollection.find().limit(3).toArray();
      console.log('📋 Sample remaining visits:');
      sampleVisits.forEach((visit, i) => {
        console.log(`  ${i + 1}. ${visit.domain} (${visit.startTime})`);
      });
    }
    
    await client.close();
    console.log('✅ Cleanup completed!');
    
  } catch (error) {
    console.error('❌ Cleanup failed:', error);
  }
}

cleanRemainingTestData();
