// Test different MongoDB connection string formats
import { MongoClient } from 'mongodb';

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  const baseUri = process.env.MONGODB_URI || process.env.MONGO_URI;
  
  if (!baseUri) {
    return res.status(500).json({
      error: 'No MongoDB URI found',
      timestamp: new Date().toISOString()
    });
  }
  
  // Test different connection string variations
  const testUris = [
    {
      name: 'Original URI',
      uri: baseUri
    },
    {
      name: 'With retryWrites and w=majority',
      uri: baseUri.includes('?') 
        ? `${baseUri}&retryWrites=true&w=majority`
        : `${baseUri}?retryWrites=true&w=majority`
    },
    {
      name: 'With full recommended params',
      uri: baseUri.includes('?') 
        ? `${baseUri}&retryWrites=true&w=majority&tls=true`
        : `${baseUri}?retryWrites=true&w=majority&tls=true`
    },
    {
      name: 'Minimal with just retryWrites',
      uri: baseUri.includes('?') 
        ? `${baseUri}&retryWrites=true`
        : `${baseUri}?retryWrites=true`
    }
  ];
  
  const results = [];
  
  for (const test of testUris) {
    try {
      console.log(`Testing: ${test.name}`);
      const client = new MongoClient(test.uri, {
        serverSelectionTimeoutMS: 3000
      });
      
      await client.connect();
      const db = client.db();
      const collections = await db.listCollections().toArray();
      await client.close();
      
      results.push({
        name: test.name,
        status: 'SUCCESS',
        database: db.databaseName,
        collectionsCount: collections.length,
        collections: collections.map(c => c.name).slice(0, 5) // First 5 only
      });
      
      // If one works, we can stop testing
      break;
      
    } catch (error) {
      results.push({
        name: test.name,
        status: 'FAILED',
        error: error.message,
        errorCode: error.code || 'Unknown'
      });
    }
  }
  
  return res.status(200).json({
    success: true,
    timestamp: new Date().toISOString(),
    baseUriLength: baseUri.length,
    baseUriHasQuery: baseUri.includes('?'),
    testResults: results,
    recommendation: results.find(r => r.status === 'SUCCESS') 
      ? `Use: ${results.find(r => r.status === 'SUCCESS').name}`
      : 'All connection attempts failed. Check MongoDB Atlas configuration.'
  });
}
