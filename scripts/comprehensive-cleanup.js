// Advanced database cleanup - Remove ALL forms of mock data
// This script performs a comprehensive cleanup of test/demo/mock data

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

async function comprehensiveCleanup() {
  try {
    console.log('🚀 Starting comprehensive database cleanup...');
    const { client, db } = await connectToDatabase();
    
    // Get all collections
    const collections = await db.listCollections().toArray();
    console.log(`Found ${collections.length} collections:`, collections.map(c => c.name));
    
    let totalDeleted = 0;
    
    // Define comprehensive mock data patterns
    const mockPatterns = {
      domains: [
        'example.com', 'test.com', 'demo.com', 'sample.com', 'fake.com', 
        'mock.com', 'localhost', '127.0.0.1', 'acme.com', 'company.com',
        'business.com', 'testsite.com', 'demosite.com', 'placeholder.com'
      ],
      names: [
        /example/i, /test/i, /demo/i, /sample/i, /fake/i, /mock/i,
        /acme/i, /unknown/i, /placeholder/i, /dummy/i, /temp/i
      ],
      emails: [
        /example\.com$/i, /test\.com$/i, /demo\.com$/i, /fake\.com$/i,
        /mock\.com$/i, /placeholder\.com$/i, /sample\.com$/i
      ],
      ips: [
        '192.168.1.1', '127.0.0.1', '0.0.0.0', '10.0.0.1', '172.16.0.1'
      ]
    };
    
    // Clean each collection
    for (const collection of collections) {
      const collectionName = collection.name;
      console.log(`\n🧹 Cleaning collection: ${collectionName}`);
      
      const coll = db.collection(collectionName);
      const totalBefore = await coll.countDocuments();
      console.log(`  Total documents before cleanup: ${totalBefore}`);
      
      if (totalBefore === 0) {
        console.log(`  ⏭️  Skipping empty collection`);
        continue;
      }
      
      let deleteQuery = { $or: [] };
      
      // Build delete query based on collection type
      if (collectionName === 'companies') {
        deleteQuery.$or = [
          { domain: { $in: mockPatterns.domains } },
          { $or: mockPatterns.names.map(pattern => ({ name: { $regex: pattern } })) },
          { $or: mockPatterns.emails.map(pattern => ({ email: { $regex: pattern } })) },
          { name: { $in: ['Unknown Company', 'Test Company', 'Demo Company'] } },
          { industry: { $in: ['Unknown Industry', 'Test Industry'] } }
        ];
      } else if (collectionName === 'visitors') {
        deleteQuery.$or = [
          { domain: { $in: mockPatterns.domains } },
          { ipAddress: { $in: mockPatterns.ips } },
          { $or: mockPatterns.emails.map(pattern => ({ email: { $regex: pattern } })) },
          { company: { $in: ['Unknown Company', 'Test Company', 'Demo Company'] } }
        ];
      } else if (collectionName === 'visits') {
        deleteQuery.$or = [
          { domain: { $in: mockPatterns.domains } },
          { referrer: { $regex: /example\.com|test\.com|demo\.com/i } },
          { 'pages.url': { $regex: /example\.com|test\.com|demo\.com/i } }
        ];
      } else {
        // Generic cleanup for other collections
        deleteQuery.$or = [
          { domain: { $in: mockPatterns.domains } },
          { $or: mockPatterns.names.map(pattern => ({ name: { $regex: pattern } })) }
        ];
      }
      
      // Find documents that match mock patterns
      const mockDocs = await coll.find(deleteQuery).toArray();
      console.log(`  Found ${mockDocs.length} mock documents to delete`);
      
      if (mockDocs.length > 0) {
        // Show sample of what will be deleted
        console.log(`  Sample mock data to be deleted:`);
        mockDocs.slice(0, 3).forEach((doc, i) => {
          const identifier = doc.name || doc.domain || doc.email || doc._id;
          console.log(`    ${i + 1}. ${identifier}`);
        });
        
        // Delete the mock documents
        const deleteResult = await coll.deleteMany(deleteQuery);
        console.log(`  ✅ Deleted ${deleteResult.deletedCount} mock documents`);
        totalDeleted += deleteResult.deletedCount;
      }
      
      const totalAfter = await coll.countDocuments();
      console.log(`  Total documents after cleanup: ${totalAfter}`);
    }
    
    // Final summary
    console.log(`\n📊 CLEANUP SUMMARY:`);
    console.log(`  Total mock documents deleted: ${totalDeleted}`);
    
    // Show remaining real data
    console.log(`\n📈 Remaining REAL data:`);
    for (const collection of collections) {
      const coll = db.collection(collection.name);
      const count = await coll.countDocuments();
      console.log(`  ${collection.name}: ${count} documents`);
      
      if (count > 0 && count <= 10) {
        const samples = await coll.find().limit(3).toArray();
        samples.forEach((doc, i) => {
          const identifier = doc.name || doc.domain || doc.email || doc._id;
          console.log(`    ${i + 1}. ${identifier}`);
        });
      }
    }
    
    await client.close();
    console.log('\n✅ Database cleanup completed successfully!');
    
  } catch (error) {
    console.error('❌ Database cleanup failed:', error);
    throw error;
  }
}

// Run the comprehensive cleanup
comprehensiveCleanup()
  .then(() => {
    console.log('\n🎉 All mock data has been removed from your database!');
    console.log('Your CRM will now only show real visitors and leads.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Cleanup failed:', error);
    process.exit(1);
  });
