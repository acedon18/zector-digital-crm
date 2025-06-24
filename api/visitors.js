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
    
    // Return fallback data if database fails
    const fallbackVisitors = [
      {
        id: 'fallback-1',
        domain: 'example.com',
        sessionId: 'session_fallback_1',
        startTime: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
        lastVisit: new Date(Date.now() - 5 * 60 * 1000),
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        location: {
          ip: '192.168.1.1',
          country: 'Sweden',
          city: 'Stockholm'
        },
        pages: ['/'],
        events: [],
        eventCount: 0,
        duration: 300,
        referrer: 'https://google.com',
        source: 'search'
      },
      {
        id: 'fallback-2',
        domain: 'test-site.com',
        sessionId: 'session_fallback_2',
        startTime: new Date(Date.now() - 15 * 60 * 1000), // 15 minutes ago
        lastVisit: new Date(Date.now() - 15 * 60 * 1000),
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        location: {
          ip: '10.0.0.1',
          country: 'United States',
          city: 'New York'
        },
        pages: ['/', '/about'],
        events: ['page_view'],
        eventCount: 1,
        duration: 450,
        referrer: 'https://linkedin.com',
        source: 'social'
      }
    ];

    return res.status(200).json({
      success: true,
      source: 'fallback_data',
      visitors: fallbackVisitors.slice(0, limit),
      total: fallbackVisitors.length,
      timestamp: new Date().toISOString(),
      error: error.message,
      note: 'Fallback data due to database error'
    });
  }
}
