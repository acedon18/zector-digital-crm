// Database status API endpoint - Inspect MongoDB collections and recent data
import { MongoClient } from 'mongodb';

let cachedClient = null;
let cachedDb = null;

async function connectToDatabase() {
  try {
    if (cachedClient && cachedDb) {
      return { client: cachedClient, db: cachedDb };
    }

    const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI;
    if (!MONGO_URI) {
      console.error('[DB STATUS] MongoDB URI not found in environment variables');
      throw new Error('MongoDB URI not found in environment variables');
    }

    const client = new MongoClient(MONGO_URI);
    await client.connect();
    const db = client.db();

    cachedClient = client;
    cachedDb = db;

    return { client, db };
  } catch (err) {
    console.error('[DB STATUS] Error connecting to MongoDB:', err);
    throw err;
  }
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
    
    // Get all collections
    const collections = await db.listCollections().toArray();
    const collectionNames = collections.map(c => c.name);
    
    // Check visits collection
    const visitsCollection = db.collection('visits');
    const totalVisits = await visitsCollection.countDocuments();
    const recentVisits = await visitsCollection.countDocuments({
      createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
    });
    
    // Check events collection
    const eventsCollection = db.collection('events');
    const totalEvents = await eventsCollection.countDocuments();
    const recentEvents = await eventsCollection.countDocuments({
      storedAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
    });
    
    // Get some sample data
    const sampleVisits = await visitsCollection.find({}).limit(3).toArray();
    const sampleEvents = await eventsCollection.find({}).limit(3).toArray();
    
    const status = {
      status: 'connected',
      timestamp: new Date().toISOString(),
      database: {
        name: dbName,
        collections: collectionNames,
        totalCollections: collections.length
      },
      visits: {
        total: totalVisits,
        recent24h: recentVisits,
        sample: sampleVisits.map(v => ({
          sessionId: v.sessionId,
          domain: v.domain,
          startTime: v.startTime,
          eventCount: v.events?.length || 0
        }))
      },
      events: {
        total: totalEvents,
        recent24h: recentEvents,
        sample: sampleEvents.map(e => ({
          event: e.event,
          domain: e.domain,
          timestamp: e.timestamp
        }))
      },
      environment: {
        nodeEnv: process.env.NODE_ENV || 'development',
        hasMongoUri: !!process.env.MONGO_URI,
        hasMongodbUri: !!process.env.MONGODB_URI
      }
    };
    
    return res.status(200).json(status);
  } catch (error) {
    console.error('[DB STATUS] Handler error:', error);
    return res.status(500).json({
      status: 'error',
      error: 'Database connection failed',
      details: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
      environment: {
        nodeEnv: process.env.NODE_ENV || 'development',
        hasMongoUri: !!process.env.MONGO_URI,
        hasMongodbUri: !!process.env.MONGODB_URI
      }
    });
  }
}