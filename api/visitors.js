// API route for getting visitor data on Vercel serverless
const mongoose = require('mongoose');
require('dotenv').config();

// Initialize MongoDB connection
let cachedDb = null;

async function connectToDatabase() {
  if (cachedDb) {
    return cachedDb;
  }
  
  const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/zector-digital-crm';
  
  try {
    console.log('🔌 Connecting to MongoDB for visitors...');
    const client = await mongoose.connect(mongoURI);
    cachedDb = client.connection.db;
    console.log('📊 MongoDB Connected Successfully!');
    return cachedDb;
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error.message);
    return null;
  }
}

// Import models
const { Visit, Company } = require('../db/models.cjs');

// Visitors endpoint handler
module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed, use GET' });
  }
  
  try {
    // Connect to database
    const db = await connectToDatabase();
    if (!db) {
      return res.status(500).json({ error: 'Database connection failed' });
    }
    
    // Get query parameters for time range
    const { start, end } = req.query;
    
    // Build time filter
    let timeFilter = {};
    if (start && end) {
      timeFilter.timestamp = {
        $gte: new Date(parseInt(start)),
        $lte: new Date(parseInt(end))
      };
    }
    
    console.log('🔍 Querying visitors with filter:', timeFilter);
    
    // Get visits with company information
    const visits = await Visit.aggregate([
      { $match: timeFilter },
      {
        $lookup: {
          from: 'companies',
          localField: 'companyId',
          foreignField: '_id',
          as: 'company'
        }
      },
      {
        $sort: { timestamp: -1 }
      },
      {
        $limit: 100
      }
    ]);
    
    console.log(`📊 Found ${visits.length} visits`);
    
    // Transform visits to visitor data format
    const visitorMap = new Map();
    
    visits.forEach(visit => {
      const visitorId = visit.visitorId || visit.ip || 'anonymous';
      
      if (!visitorMap.has(visitorId)) {
        visitorMap.set(visitorId, {
          id: visitorId,
          ipAddress: visit.ip,
          userAgent: visit.userAgent,
          firstSeen: visit.timestamp,
          lastSeen: visit.timestamp,
          totalVisits: 0,
          totalPageviews: 0,
          averageTimeOnSite: 0,
          events: [],
          company: visit.company && visit.company.length > 0 ? {
            id: visit.company[0]._id.toString(),
            name: visit.company[0].name,
            domain: visit.company[0].domain,
            industry: visit.company[0].industry,
            size: visit.company[0].size,
            location: visit.company[0].location,
            country: visit.company[0].country,
            status: visit.company[0].status || 'cold'
          } : null,
          enrichmentStatus: visit.company && visit.company.length > 0 ? 'complete' : 'pending'
        });
      }
      
      const visitor = visitorMap.get(visitorId);
      
      // Update visitor stats
      visitor.totalVisits++;
      visitor.totalPageviews += visit.pageviews || 1;
      visitor.lastSeen = Math.max(visitor.lastSeen, visit.timestamp);
      visitor.firstSeen = Math.min(visitor.firstSeen, visit.timestamp);
      
      // Add event data
      visitor.events.push({
        timestamp: visit.timestamp,
        eventType: visit.event || 'page_view',
        path: visit.path,
        title: visit.title,
        duration: visit.duration,
        referrer: visit.referrer,
        customerId: visit.customerId,
        domain: visit.domain
      });
    });
    
    // Convert map to array and calculate averages
    const visitors = Array.from(visitorMap.values()).map(visitor => {
      // Calculate average time on site
      const totalDuration = visitor.events.reduce((sum, event) => sum + (event.duration || 0), 0);
      visitor.averageTimeOnSite = visitor.totalVisits > 0 ? totalDuration / visitor.totalVisits : 0;
      
      return visitor;
    });
    
    return res.status(200).json(visitors);
    
  } catch (error) {
    console.error('❌ Error fetching visitors:', error);
    return res.status(500).json({ 
      error: 'Failed to fetch visitors',
      details: error.message 
    });
  }
};
