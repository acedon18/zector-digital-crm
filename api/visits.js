// Visits API endpoint - Get real visitor data from MongoDB with tenant filtering
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
    maxIdleTimeMs: 30000,
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
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Tenant-ID');
  
  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const { db } = await connectToDatabase();
    
    // Get tenantId from header or query parameter
    const tenantId = req.headers['x-tenant-id'] || req.query.tenantId || 'default-tenant';
    
    // Get visits filtered by tenant
    const visitsCollection = db.collection('visits');
    const query = { tenantId: tenantId };
    
    // Add date filtering if provided
    if (req.query.startDate || req.query.endDate) {
      query.startTime = {};
      if (req.query.startDate) {
        query.startTime.$gte = new Date(req.query.startDate);
      }
      if (req.query.endDate) {
        query.startTime.$lte = new Date(req.query.endDate);
      }
    }
    
    // Add domain filtering if provided
    if (req.query.domain) {
      query.domain = req.query.domain;
    }
    
    const limit = parseInt(req.query.limit) || 100;
    const skip = parseInt(req.query.skip) || 0;
    
    const visitsData = await visitsCollection
      .find(query)
      .sort({ startTime: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();
    
    // Convert MongoDB documents to the expected format
    const visits = visitsData.map(visit => ({
      id: visit._id.toString(),
      sessionId: visit.sessionId,
      tenantId: visit.tenantId,
      customerId: visit.customerId,
      domain: visit.domain,
      userAgent: visit.userAgent,
      startTime: visit.startTime,
      lastActivity: visit.lastActivity,
      referrer: visit.referrer,
      pages: visit.pages || [],
      events: visit.events || [],
      gdprCompliant: visit.gdprCompliant,
      
      // Derived data
      duration: visit.lastActivity && visit.startTime 
        ? Math.round((new Date(visit.lastActivity) - new Date(visit.startTime)) / 1000)
        : 0,
      pageViews: visit.pages ? visit.pages.length : 0,
      eventCount: visit.events ? visit.events.length : 0,
      
      // Browser/device info (parse from userAgent)
      browser: parseBrowserFromUserAgent(visit.userAgent),
      device: parseDeviceFromUserAgent(visit.userAgent),
      os: parseOSFromUserAgent(visit.userAgent),
      
      // Location info (if available)
      location: visit.location || { country: 'Unknown', city: 'Unknown' },
      
      // Lead scoring
      score: calculateLeadScore(visit),
      
      createdAt: visit.createdAt
    }));
    
    // Get total count for pagination
    const total = await visitsCollection.countDocuments(query);
    
    console.log(`Returning ${visits.length} visits for tenant ${tenantId} from MongoDB`);
    
    return res.status(200).json({
      success: true,
      visits: visits,
      total: total,
      tenantId: tenantId,
      pagination: {
        limit,
        skip,
        hasMore: total > skip + limit
      },
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Visits API error:', error);
    return res.status(500).json({ 
      error: 'Error fetching visits data',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

// Helper functions for parsing user agent
function parseBrowserFromUserAgent(userAgent = '') {
  if (userAgent.includes('Chrome')) return 'Chrome';
  if (userAgent.includes('Firefox')) return 'Firefox';
  if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) return 'Safari';
  if (userAgent.includes('Edge')) return 'Edge';
  if (userAgent.includes('Opera')) return 'Opera';
  return 'Unknown';
}

function parseDeviceFromUserAgent(userAgent = '') {
  if (userAgent.includes('Mobile') || userAgent.includes('Android')) return 'Mobile';
  if (userAgent.includes('Tablet') || userAgent.includes('iPad')) return 'Tablet';
  return 'Desktop';
}

function parseOSFromUserAgent(userAgent = '') {
  if (userAgent.includes('Windows')) return 'Windows';
  if (userAgent.includes('Mac OS')) return 'macOS';
  if (userAgent.includes('Linux')) return 'Linux';
  if (userAgent.includes('Android')) return 'Android';
  if (userAgent.includes('iOS')) return 'iOS';
  return 'Unknown';
}

// Calculate lead score based on visit behavior
function calculateLeadScore(visit) {
  let score = 0;
  
  // Base score for visiting
  score += 10;
  
  // Points for multiple pages
  if (visit.pages && visit.pages.length > 1) {
    score += Math.min(visit.pages.length * 5, 30);
  }
  
  // Points for time on site
  if (visit.lastActivity && visit.startTime) {
    const duration = (new Date(visit.lastActivity) - new Date(visit.startTime)) / 1000;
    if (duration > 30) score += 10;
    if (duration > 120) score += 15;
    if (duration > 300) score += 20;
  }
  
  // Points for events
  if (visit.events && visit.events.length > 0) {
    score += Math.min(visit.events.length * 3, 20);
  }
  
  // Points for return visits (if same customerId)
  if (visit.customerId) {
    score += 15;
  }
  
  // Bonus for specific page types
  if (visit.pages) {
    const hasContactPage = visit.pages.some(page => 
      page.url && (page.url.includes('contact') || page.url.includes('about'))
    );
    if (hasContactPage) score += 20;
    
    const hasPricingPage = visit.pages.some(page => 
      page.url && page.url.includes('pricing')
    );
    if (hasPricingPage) score += 25;
  }
  
  return Math.min(score, 100); // Cap at 100
}
