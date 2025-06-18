// API route for tracking on Vercel serverless
const { MongoClient } = require('mongodb');
const mongoose = require('mongoose');
require('dotenv').config();

// Initialize MongoDB connection
let cachedDb = null;

async function connectToDatabase() {
  if (cachedDb) {
    return cachedDb;
  }
  
  const mongoURI = process.env.MONGO_URI || 
                   process.env.MONGODB_URI || 
                   'mongodb://localhost:27017/zector-digital-crm';
  
  try {
    // Setup MongoDB connection
    console.log('🔌 Connecting to MongoDB...', mongoURI ? 'URI provided' : 'No URI found');
    const client = await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    cachedDb = client.connection.db;
    console.log('📊 MongoDB Connected Successfully!', cachedDb.databaseName);
    return cachedDb;
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error.message);
    console.error('🔍 MongoDB URI available:', !!process.env.MONGO_URI || !!process.env.MONGODB_URI);
    return null;
  }
}

// Import models
const { Company, Visit, Customer, TrackingScript } = require('../db/models.cjs');

// Track endpoint handler
module.exports = async (req, res) => {  // Enable CORS - allow specifically zectordigital.es and www.zectordigital.es
  const allowedOrigins = ['https://zectordigital.es', 'https://www.zectordigital.es', 'http://zectordigital.es', 'http://www.zectordigital.es'];
  const origin = req.headers.origin;
  
  // Allow all origins during development and testing
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  
  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed, use POST' });
  }
  
  try {
    // Connect to database
    const db = await connectToDatabase();
    let dbConnected = !!db;
    
    console.log('📊 Received tracking data:', req.body);
    
    const trackingData = req.body;
    
    // Extract real IP address
    const ip = req.headers['x-forwarded-for'] || 
               req.headers['x-real-ip'] ||
               req.socket.remoteAddress ||
               '127.0.0.1';

    trackingData.ip = ip;
    trackingData.timestamp = new Date().toISOString();
    
    // Validate required fields
    if (!trackingData.customerId || !trackingData.domain || !trackingData.event) {
      console.error('❌ Missing required tracking fields');
      return res.status(400).json({ 
        error: 'Missing required fields: customerId, domain, event',
        success: false
      });
    }

    console.log('✅ Valid tracking data received:', {
      event: trackingData.event,
      customerId: trackingData.customerId,
      domain: trackingData.domain,
      ip: trackingData.ip
    });
    
    // If DB is connected, store data in MongoDB
    if (dbConnected) {
      // Find or create tracking script
      let trackingScript = await TrackingScript.findOne({
        customerId: trackingData.customerId,
        domain: trackingData.domain
      });
      
      if (!trackingScript) {
        // Create new tracking script record
        trackingScript = new TrackingScript({
          customerId: trackingData.customerId,
          domain: trackingData.domain,
          scriptId: `script_${Date.now()}`,
          isActive: true,
          settings: {
            gdprCompliant: trackingData.anonymizeIp || true,
            anonymizeIp: trackingData.anonymizeIp || true
          }
        });
        await trackingScript.save();
      } else {
        // Update last activity
        trackingScript.lastActivity = new Date();
        await trackingScript.save();
      }
      
      // Create a session ID if not provided
      const sessionId = trackingData.sessionId || `session_${Date.now()}_${ip.replace(/\./g, '_')}`;
      
      // Find or create a session
      let session = await Visit.findOne({ sessionId: sessionId });
      
      if (!session) {
        session = new Visit({
          sessionId: sessionId,
          customerId: trackingData.customerId,
          domain: trackingData.domain,
          ipAddress: ip,
          anonymizedIp: trackingData.anonymizeIp ? ip.replace(/\.\d+$/, '.0') : ip,
          userAgent: trackingData.userAgent,
          referrer: trackingData.referrer,
          startTime: new Date(),
          pages: [],
          events: []
        });
      }
      
      // Process specific events
      if (trackingData.event === 'page_view') {
        // Add page view to session
        session.pages.push({
          url: trackingData.url || '/',
          title: trackingData.data?.title || 'Unknown',
          timestamp: new Date(trackingData.timestamp),
          timeOnPage: 0,
          scrollDepth: 0,
          interactions: 0
        });
        
        // Try to find existing company by domain
        const companyDomain = trackingData.domain;
        let company = await Company.findOne({ domain: companyDomain });
        
        if (!company) {
          // Create new company record with basic info
          company = new Company({
            domain: companyDomain,
            firstVisit: new Date(),
            lastVisit: new Date(),
            totalVisits: 1,
            score: 50,
            status: 'cold'
          });
        } else {
          // Update existing company
          company.lastVisit = new Date();
          company.totalVisits += 1;
          
          // Simple scoring logic
          if (company.totalVisits > 10) {
            company.status = 'hot';
            company.score = Math.min(100, company.score + 5);
          } else if (company.totalVisits > 3) {
            company.status = 'warm';
            company.score = Math.min(90, company.score + 3);
          }
        }
        
        // Save the updates
        await company.save();
        session.companyId = company._id;
      } else {
        // Add other event types to session
        session.events.push({
          eventType: trackingData.event,
          timestamp: new Date(trackingData.timestamp),
          data: trackingData.data || {}
        });
      }
      
      // Update session and save
      session.lastActivity = new Date();
      await session.save();
      
      // Return success
      return res.status(200).json({ 
        success: true, 
        message: 'Tracking data processed successfully' 
      });
    } else {
      // If DB connection failed, return warning but still 200 status
      console.warn('⚠️ Database connection not available, tracking data not stored');
      return res.status(200).json({ 
        success: true, 
        warning: 'Database connection not available, tracking data not stored',
        message: 'Tracking received but not stored' 
      });
    }
  } catch (error) {
    console.error('Tracking endpoint error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: 'Failed to process tracking data',
      details: error.message
    });
  }
};
