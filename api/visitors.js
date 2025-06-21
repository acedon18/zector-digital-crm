// Visitors API endpoint - Get real visitor data from MongoDB
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

  const client = new MongoClient(MONGO_URI);
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
    
    // Get recent visits from MongoDB
    const visitsCollection = db.collection('visits');
    const recentVisits = await visitsCollection
      .find({})
      .sort({ startTime: -1 })
      .limit(50)
      .toArray();
    
    // Transform the data for the frontend
    const visitors = recentVisits.map(visit => ({
      id: visit._id.toString(),
      sessionId: visit.sessionId,
      customerId: visit.customerId,
      domain: visit.domain,
      startTime: visit.startTime,
      lastActivity: visit.lastActivity || visit.startTime,
      referrer: visit.referrer,
      userAgent: visit.userAgent,
      pages: visit.pages || [],
      events: visit.events || [],
      totalPages: (visit.pages || []).length,
      totalEvents: (visit.events || []).length,
      isActive: visit.lastActivity && (new Date() - new Date(visit.lastActivity)) < 30 * 60 * 1000 // Active if within 30 mins
    }));
    
    return res.status(200).json({
      success: true,
      visitors,
      total: visitors.length,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Visitors API error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch visitors',
      details: error.message
    });
  }
}
