// Database status API endpoint - Inspect MongoDB collections and recent data
import { MongoClient } from 'mongodb';

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
    tls: true,
    tlsAllowInvalidCertificates: false,
    tlsAllowInvalidHostnames: false,
    retryWrites: true,
    w: 'majority'
  });
  
  await client.connect();
  const db = client.db();

  cachedClient = client;
  cachedDb = db;

  return { client, db };
}

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  try {
    const { db } = await connectToDatabase();
    
    // Get database name
    const dbName = db.databaseName;
    
    // Get all collections - simplified
    let collections = [];
    let collectionNames = [];
    try {
      collections = await db.listCollections().toArray();
      collectionNames = collections.map(c => c.name);
    } catch (error) {
      console.log('Could not list collections:', error.message);
    }
    
    // Basic visits collection stats
    const visitsCollection = db.collection('visits');
    const visitsTotal = await visitsCollection.countDocuments();
    
    // Basic events collection stats
    const eventsCollection = db.collection('events');
    const eventsTotal = await eventsCollection.countDocuments();
    
    // Recent visits (limit to 3 for simplicity)
    const recentVisits = await visitsCollection
      .find({})
      .sort({ createdAt: -1 })
      .limit(3)
      .toArray();
    
    // Recent events (limit to 3 for simplicity)
    const recentEvents = await eventsCollection
      .find({})
      .sort({ storedAt: -1 })
      .limit(3)
      .toArray();
    
    const status = {
      status: 'connected',
      timestamp: new Date().toISOString(),
      database: {
        name: dbName,
        collections: collectionNames,
        totalCollections: collections.length
      },
      visits: {
        total: visitsTotal,
        sampleData: recentVisits.map(visit => ({
          sessionId: visit.sessionId,
          customerId: visit.customerId,
          domain: visit.domain,
          startTime: visit.startTime,
          eventCount: visit.events?.length || 0
        }))
      },
      events: {
        total: eventsTotal,
        sampleData: recentEvents.map(event => ({
          event: event.event,
          domain: event.domain,
          url: event.url ? event.url.substring(0, 50) + '...' : 'unknown',
          timestamp: event.timestamp,
          customerId: event.customerId
        }))
      },
      environment: {
        nodeEnv: process.env.NODE_ENV || 'development',
        hasMongoUri: !!process.env.MONGO_URI,
        hasMongodbUri: !!process.env.MONGODB_URI,
        hasApolloKey: !!process.env.APOLLO_API_KEY
      }
    };
    
    return res.status(200).json(status);
    
  } catch (error) {
    console.error('Database status check error:', error);
    return res.status(500).json({
      status: 'error',
      error: 'Database connection or query failed',
      details: error.message,
      timestamp: new Date().toISOString(),
      environment: {
        nodeEnv: process.env.NODE_ENV || 'development',
        hasMongoUri: !!process.env.MONGO_URI,
        hasMongodbUri: !!process.env.MONGODB_URI
      }
    });
  }
}
