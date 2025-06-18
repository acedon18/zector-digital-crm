// API route for lead discovery on Vercel serverless
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
    console.log('🔌 Connecting to MongoDB for lead discovery...');
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
const { Company, Visit } = require('../db/models.cjs');

// Lead discovery endpoint handler
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
    
    // Get query parameters
    const { industry, companySize, location, score, source, fromDate, toDate } = req.query;
    
    console.log('🔍 Lead discovery filters:', req.query);
    
    // Build MongoDB aggregation pipeline to find high-quality leads
    const pipeline = [
      // Match companies that have recent visits
      {
        $lookup: {
          from: 'visits',
          localField: '_id',
          foreignField: 'companyId',
          as: 'visits'
        }
      },
      // Filter out companies with no visits
      {
        $match: {
          'visits.0': { $exists: true }
        }
      },
      // Add computed fields
      {
        $addFields: {
          visitCount: { $size: '$visits' },
          lastVisit: { $max: '$visits.timestamp' },
          avgTimeOnSite: { $avg: '$visits.duration' },
          totalPageviews: { $sum: '$visits.pageviews' }
        }
      }
    ];
    
    // Add filters
    const matchConditions = {};
    
    if (industry) {
      const industries = industry.split(',');
      matchConditions.industry = { $in: industries };
    }
    
    if (companySize) {
      const sizes = companySize.split(',');
      matchConditions.size = { $in: sizes };
    }
    
    if (location) {
      const locations = location.split(',');
      matchConditions.$or = locations.map(loc => ({
        $or: [
          { location: { $regex: loc, $options: 'i' } },
          { country: { $regex: loc, $options: 'i' } }
        ]
      }));
    }
    
    if (fromDate || toDate) {
      const dateFilter = {};
      if (fromDate) dateFilter.$gte = new Date(fromDate);
      if (toDate) dateFilter.$lte = new Date(toDate);
      matchConditions.lastVisit = dateFilter;
    }
    
    // Quality filters for lead scoring
    matchConditions.visitCount = { $gte: 2 }; // At least 2 visits
    matchConditions.totalPageviews = { $gte: 3 }; // At least 3 pageviews
    
    if (Object.keys(matchConditions).length > 0) {
      pipeline.push({ $match: matchConditions });
    }
    
    // Sort by lead quality (visit count, recent activity)
    pipeline.push({
      $sort: {
        visitCount: -1,
        lastVisit: -1,
        totalPageviews: -1
      }
    });
    
    // Limit results
    pipeline.push({ $limit: 50 });
    
    console.log('📊 Running lead discovery pipeline...');
    
    // Execute the aggregation
    const leadCompanies = await Company.aggregate(pipeline);
    
    console.log(`🎯 Found ${leadCompanies.length} qualified leads`);
    
    // Transform to lead format
    const leads = leadCompanies.map(company => {
      // Calculate lead score
      let leadScore = 50; // Base score
      
      // Score based on engagement
      if (company.visitCount > 5) leadScore += 15;
      else if (company.visitCount > 2) leadScore += 10;
      
      if (company.totalPageviews > 10) leadScore += 10;
      else if (company.totalPageviews > 5) leadScore += 5;
      
      if (company.avgTimeOnSite > 180) leadScore += 10; // 3+ minutes
      else if (company.avgTimeOnSite > 60) leadScore += 5; // 1+ minute
      
      // Recent activity bonus
      const daysSinceLastVisit = (Date.now() - new Date(company.lastVisit)) / (1000 * 60 * 60 * 24);
      if (daysSinceLastVisit < 1) leadScore += 15;
      else if (daysSinceLastVisit < 7) leadScore += 10;
      else if (daysSinceLastVisit < 30) leadScore += 5;
      
      // Company information bonus
      if (company.email) leadScore += 10;
      if (company.phone) leadScore += 5;
      if (company.industry) leadScore += 5;
      if (company.size) leadScore += 3;
      
      // Cap at 100
      leadScore = Math.min(100, leadScore);
      
      // Apply score filter if specified
      if (score && leadScore < parseInt(score)) {
        return null;
      }
      
      return {
        id: `lead-${company._id}`,
        companyId: company._id.toString(),
        companyName: company.name,
        domain: company.domain,
        industry: company.industry,
        companySize: company.size,
        location: company.location,
        country: company.country,
        email: company.email,
        phone: company.phone,
        website: company.website,
        source: 'website',
        score: leadScore,
        createdAt: company.lastVisit,
        interactions: {
          websiteVisits: company.visitCount,
          totalPageviews: company.totalPageviews,
          averageTimeOnSite: Math.round(company.avgTimeOnSite || 0),
          lastVisit: company.lastVisit,
          downloadedContent: false, // Would need separate tracking
          formSubmissions: false,   // Would need separate tracking
          emailOpens: 0,           // Would need email integration
          emailClicks: 0           // Would need email integration
        }
      };
    }).filter(Boolean); // Remove null entries
    
    return res.status(200).json(leads);
    
  } catch (error) {
    console.error('❌ Error discovering leads:', error);
    return res.status(500).json({ 
      error: 'Failed to discover leads',
      details: error.message 
    });
  }
};
