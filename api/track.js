// Enhanced tracking API endpoint with MongoDB storage
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
  // Enable CORS first
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Accept');
  res.setHeader('Access-Control-Max-Age', '86400'); // Cache preflight for 24 hours
  
  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  // Handle GET request (image beacon fallback)
  if (req.method === 'GET') {
    try {
      const trackingData = req.query.data ? JSON.parse(req.query.data) : null;
      
      if (trackingData) {
        console.log('Tracking data received via GET:', trackingData.event);
        // Store data for GET requests too
        await storeTrackingData(trackingData);
      }
      
      // Return 1x1 transparent pixel for image beacon
      res.setHeader('Content-Type', 'image/gif');
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      
      // 1x1 transparent GIF in base64
      const pixel = Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64');
      return res.status(200).send(pixel);
      
    } catch (error) {
      console.error('Error processing GET tracking request:', error);
      return res.status(400).json({ error: 'Invalid tracking data' });
    }
  }
    // Handle POST request (main tracking method)
  if (req.method === 'POST') {
    try {
      const trackingData = req.body;
      
      if (trackingData && trackingData.event) {
        console.log('📊 Tracking data received via POST:', trackingData.event, trackingData.customerId);
        
        // Store the tracking data in MongoDB (non-blocking)
        storeTrackingData(trackingData).catch(error => {
          console.error('Background storage error:', error);
        });
      }
      
      return res.status(200).json({
        success: true,
        message: 'Tracking data received and queued for storage',
        event: trackingData?.event || 'unknown',
        timestamp: new Date().toISOString()
      });
      
    } catch (error) {
      console.error('Error processing POST tracking request:', error);
      return res.status(500).json({ 
        error: 'Error processing tracking data',
        details: error.message 
      });
    }
  }
  
  // Handle other methods
  return res.status(405).json({ error: 'Method not allowed' });
}

async function storeTrackingData(trackingData) {
  try {
    const { db } = await connectToDatabase();
    
    // Extract basic info
    const {
      event,
      data = {},
      timestamp,
      url,
      referrer,
      userAgent,
      customerId,
      domain
    } = trackingData;

    // Generate session ID based on user agent + IP + date
    const sessionId = generateSessionId(userAgent, timestamp);
    
    // First, check if we have an existing visit for this session
    const visitsCollection = db.collection('visits');
    let visit = await visitsCollection.findOne({ sessionId });
    
    if (!visit) {
      // Create new visit
      visit = {
        sessionId,
        customerId,
        domain,
        userAgent,
        startTime: new Date(timestamp),
        referrer,
        pages: [],
        events: [],
        gdprCompliant: trackingData.anonymizeIp || true,
        createdAt: new Date()
      };
      
      await visitsCollection.insertOne(visit);
      console.log('Created new visit:', sessionId);
    }
    
    // Add the event to the visit
    const eventRecord = {
      eventType: event,
      timestamp: new Date(timestamp),
      data,
      url
    };
    
    // Update the visit with the new event
    const updateResult = await visitsCollection.updateOne(
      { sessionId },
      {
        $push: { events: eventRecord },
        $set: { 
          lastActivity: new Date(timestamp)
        }
      }
    );
    
    // If it's a page view, also add to pages array
    if (event === 'page_view') {
      await visitsCollection.updateOne(
        { sessionId },
        {
          $push: {
            pages: {
              url,
              title: data.title || '',
              timestamp: new Date(timestamp)
            }
          }
        }
      );
    }
    
    // Also store in a raw events collection for backup
    const eventsCollection = db.collection('events');
    await eventsCollection.insertOne({
      ...trackingData,
      sessionId,
      storedAt: new Date()
    });
    
    console.log('✅ Stored tracking event:', event, 'for session:', sessionId);
    
  } catch (error) {
    console.error('❌ Error storing tracking data to MongoDB:', error.message);
    
    // Fallback: just log the data for debugging
    console.log('📊 Tracking data (not stored):', JSON.stringify({
      event: trackingData.event,
      customerId: trackingData.customerId,
      domain: trackingData.domain,
      url: trackingData.url,
      timestamp: trackingData.timestamp
    }));
    
    // Don't throw the error - we want the API to still respond successfully
    // even if database storage fails
  }
}

function generateSessionId(userAgent = '', timestamp = '') {
  const date = new Date(timestamp).toDateString();
  const hash = simpleHash(userAgent + date);
  return `session_${hash}`;
}

function simpleHash(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(36);
}
