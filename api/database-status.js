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
    
    // Get all collections
    const collections = await db.listCollections().toArray();
    const collectionNames = collections.map(c => c.name);
    
    // Inspect visits collection
    const visitsCollection = db.collection('visits');
    const visitsStats = {
      total: await visitsCollection.countDocuments(),
      recent: await visitsCollection.countDocuments({
        createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } // Last 24 hours
      }),
      domains: await visitsCollection.distinct('domain'),
      recentVisits: await visitsCollection
        .find({})
        .sort({ createdAt: -1 })
        .limit(5)
        .toArray()
    };
    
    // Inspect events collection
    const eventsCollection = db.collection('events');
    const eventsStats = {
      total: await eventsCollection.countDocuments(),
      recent: await eventsCollection.countDocuments({
        storedAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } // Last 24 hours
      }),
      eventTypes: await eventsCollection.distinct('event'),
      recentEvents: await eventsCollection
        .find({})
        .sort({ storedAt: -1 })
        .limit(5)
        .toArray()
    };
    
    // Get unique customer IDs and domains
    const uniqueCustomers = await visitsCollection.distinct('customerId');
    const uniqueDomains = await visitsCollection.distinct('domain');
    
    // Sample tracking data from the last 24 hours
    const recentTrackingData = await eventsCollection
      .find({
        storedAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
      })
      .sort({ storedAt: -1 })
      .limit(10)
      .toArray();
    
    // Get session statistics
    const sessionStats = await visitsCollection.aggregate([
      {
        $group: {
          _id: null,
          totalSessions: { $sum: 1 },
          avgEventsPerSession: { $avg: { $size: '$events' } },
          avgPagesPerSession: { $avg: { $size: '$pages' } }
        }
      }
    ]).toArray();
    
    const status = {
      status: 'connected',
      timestamp: new Date().toISOString(),
      database: {
        name: dbName,
        collections: collectionNames,
        totalCollections: collections.length
      },
      visits: {
        ...visitsStats,
        sampleData: visitsStats.recentVisits.map(visit => ({
          sessionId: visit.sessionId,
          customerId: visit.customerId,
          domain: visit.domain,
          startTime: visit.startTime,
          eventCount: visit.events?.length || 0,
          pageCount: visit.pages?.length || 0,
          lastActivity: visit.lastActivity
        }))
      },
      events: {
        ...eventsStats,
        sampleData: eventsStats.recentEvents.map(event => ({
          event: event.event,
          domain: event.domain,
          url: event.url,
          timestamp: event.timestamp,
          storedAt: event.storedAt,
          sessionId: event.sessionId
        }))
      },
      analytics: {
        uniqueCustomers: uniqueCustomers.length,
        uniqueDomains: uniqueDomains.length,
        domains: uniqueDomains,
        sessions: sessionStats.length > 0 ? sessionStats[0] : {
          totalSessions: 0,
          avgEventsPerSession: 0,
          avgPagesPerSession: 0
        }
      },
      recentActivity: {
        trackingData: recentTrackingData.map(data => ({
          event: data.event,
          domain: data.domain,
          url: data.url,
          timestamp: data.timestamp,
          userAgent: data.userAgent ? data.userAgent.substring(0, 50) + '...' : 'unknown',
          customerId: data.customerId
        }))
      },
      environment: {
        nodeEnv: process.env.NODE_ENV || 'development',
        hasMongoUri: !!process.env.MONGO_URI,
        hasMongodbUri: !!process.env.MONGODB_URI,
        hasApolloKey: !!process.env.APOLLO_API_KEY,
        hasHunterKey: !!process.env.HUNTER_API_KEY
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
