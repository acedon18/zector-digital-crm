// API route for getting company data on Vercel serverless
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
    console.log('🔌 Connecting to MongoDB for companies...');
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
const { Company } = require('../db/models.cjs');

// Companies endpoint handler
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
    const { status, industry, search } = req.query;
    
    // Build MongoDB query
    let query = {};
    
    if (status && status !== 'all') {
      query.status = status;
    }
    
    if (industry && industry !== 'all') {
      query.industry = industry;
    }
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { domain: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { website: { $regex: search, $options: 'i' } }
      ];
    }
    
    console.log('🔍 Querying companies with:', query);
    
    // Query companies from database
    const companies = await Company.find(query)
      .limit(100) // Limit to 100 results
      .sort({ createdAt: -1 }) // Sort by newest first
      .lean(); // Return plain objects
    
    console.log(`📊 Found ${companies.length} companies`);
    
    // Transform the data to match the expected format
    const transformedCompanies = companies.map(company => ({
      id: company._id.toString(),
      name: company.name,
      domain: company.domain,
      industry: company.industry,
      size: company.size,
      location: company.location,
      country: company.country,
      status: company.status || 'cold',
      email: company.email,
      phone: company.phone,
      website: company.website,
      visitCount: company.visitCount || 0,
      lastVisit: company.lastVisit,
      firstVisit: company.firstVisit,
      createdAt: company.createdAt,
      updatedAt: company.updatedAt
    }));
    
    return res.status(200).json(transformedCompanies);
    
  } catch (error) {
    console.error('❌ Error fetching companies:', error);
    return res.status(500).json({ 
      error: 'Failed to fetch companies',
      details: error.message 
    });
  }
};
