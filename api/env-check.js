// Environment Variables Checker för Vercel deployment
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
  
  try {
    // Check environment variables
    const envStatus = {
      NODE_ENV: process.env.NODE_ENV || 'not set',
      VERCEL: process.env.VERCEL || 'not set',
      VERCEL_ENV: process.env.VERCEL_ENV || 'not set',
      
      // MongoDB variables
      MONGO_URI: process.env.MONGO_URI ? 'SET (length: ' + process.env.MONGO_URI.length + ')' : 'NOT SET',
      MONGODB_URI: process.env.MONGODB_URI ? 'SET (length: ' + process.env.MONGODB_URI.length + ')' : 'NOT SET',
      
      // Other environment variables
      VITE_USE_REAL_DATA: process.env.VITE_USE_REAL_DATA || 'not set',
      VITE_API_ENDPOINT: process.env.VITE_API_ENDPOINT || 'not set',
      
      // API Keys (masked for security)
      VITE_HUNTER_API_KEY: process.env.VITE_HUNTER_API_KEY ? 'SET (starts with: ' + process.env.VITE_HUNTER_API_KEY.substring(0, 4) + '...)' : 'NOT SET',
      VITE_IPINFO_TOKEN: process.env.VITE_IPINFO_TOKEN ? 'SET (starts with: ' + process.env.VITE_IPINFO_TOKEN.substring(0, 4) + '...)' : 'NOT SET',
      VITE_APOLLO_API_KEY: process.env.VITE_APOLLO_API_KEY ? 'SET (starts with: ' + process.env.VITE_APOLLO_API_KEY.substring(0, 4) + '...)' : 'NOT SET',
    };
    
    // Test MongoDB connection if available
    let mongoStatus = 'NOT TESTED';
    if (process.env.MONGO_URI || process.env.MONGODB_URI) {
      try {        const { MongoClient } = await import('mongodb');
        const uri = process.env.MONGO_URI || process.env.MONGODB_URI;        const client = new MongoClient(uri, {
          serverSelectionTimeoutMS: 5000
        });
        
        await client.connect();
        const db = client.db();
        const collections = await db.listCollections().toArray();
        
        mongoStatus = {
          connection: 'SUCCESS',
          database: db.databaseName || 'default',
          collections: collections.map(c => c.name),
          collectionsCount: collections.length
        };
        
        await client.close();
      } catch (error) {
        mongoStatus = {
          connection: 'FAILED',
          error: error.message
        };
      }
    }
    
    return res.status(200).json({
      success: true,
      timestamp: new Date().toISOString(),
      environment: envStatus,
      mongodb: mongoStatus,
      deployment: {
        platform: 'Vercel',
        region: process.env.VERCEL_REGION || 'unknown',
        runtime: process.version || 'unknown'
      }
    });
    
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
}
