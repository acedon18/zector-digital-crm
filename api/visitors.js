// Recent visitors API endpoint - Get recent website visitors from visits collection
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
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
    connectTimeoutMS: 10000,
    maxIdleTimeMS: 30000,
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

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { db } = await connectToDatabase();
    
    // Get limit from query parameters (default: 15)
    const limit = parseInt(req.query.limit) || 15;
    
    // Get recent visitors from visits collection
    const visitsCollection = db.collection('visits');
    
    // Get recent visits, sorted by startTime
    const recentVisits = await visitsCollection
      .find({})
      .sort({ startTime: -1 })
      .limit(limit)
      .toArray();

    // Transform visits data to match expected visitor format
    const visitors = recentVisits.map(visit => ({
      id: visit._id.toString(),
      domain: visit.domain || 'Unknown',
      sessionId: visit.sessionId,
      startTime: visit.startTime,
      lastVisit: visit.startTime, // Use startTime as lastVisit for compatibility
      userAgent: visit.userAgent || '',
      location: {
        ip: visit.ip || 'Unknown',
        country: visit.location?.country || 'Unknown',
        city: visit.location?.city || 'Unknown'
      },
      pages: visit.pages || [],
      events: visit.events || [],
      eventCount: visit.eventCount || 0,
      duration: visit.duration || 0,
      referrer: visit.referrer || '',
      source: visit.source || 'direct'
    }));

    console.log(`[VISITORS API] Found ${visitors.length} recent visitors`);

    return res.status(200).json({
      success: true,
      source: 'real_data',
      visitors: visitors,
      total: visitors.length,
      timestamp: new Date().toISOString(),
      note: 'Recent visitors from MongoDB visits collection'
    });

  } catch (error) {
    console.error('[VISITORS API] Error:', error);
    
    // Return empty array on error - no fallback data
    return res.status(500).json({
      success: false,
      source: 'error',
      visitors: [],
      total: 0,
      timestamp: new Date().toISOString(),
      error: error.message,
      note: 'Database connection failed. No fallback data provided.'
    });
  }
}
