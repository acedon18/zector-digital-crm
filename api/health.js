// Health check API endpoint for debugging
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
    console.log('🔌 Health check: Connecting to MongoDB...');
    const client = await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    cachedDb = client.connection.db;
    console.log('📊 Health check: MongoDB Connected Successfully!');
    return cachedDb;
  } catch (error) {
    console.error('❌ Health check: MongoDB Connection Error:', error.message);
    return null;
  }
}

// Import models to test
const { Company, Visit, Customer, TrackingScript } = require('../db/models.cjs');

// Health check endpoint
module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  try {
    const startTime = Date.now();
    
    // Test database connection
    const db = await connectToDatabase();
    const dbConnected = !!db;
    
    let status = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      database: {
        connected: dbConnected,
        name: db ? db.databaseName : 'disconnected'
      },
      environment: {
        hasMongoUri: !!process.env.MONGO_URI,
        hasMongodbUri: !!process.env.MONGODB_URI,
        nodeEnv: process.env.NODE_ENV || 'development'
      },
      responseTime: Date.now() - startTime
    };
    
    if (dbConnected) {
      try {
        // Test collections
        const companyCount = await Company.countDocuments();
        const visitCount = await Visit.countDocuments();
        const customerCount = await Customer.countDocuments();
        const scriptCount = await TrackingScript.countDocuments();
        
        status.collections = {
          companies: companyCount,
          visits: visitCount,
          customers: customerCount,
          trackingScripts: scriptCount
        };
        
        // Test sample company data
        const sampleCompany = await Company.findOne().lean();
        status.sampleData = {
          hasCompanies: companyCount > 0,
          sampleCompany: sampleCompany ? {
            id: sampleCompany._id,
            name: sampleCompany.name,
            domain: sampleCompany.domain,
            hasLocation: !!sampleCompany.location
          } : null
        };
        
      } catch (queryError) {
        status.database.queryError = queryError.message;
        status.status = 'warning';
      }
    } else {
      status.status = 'error';
      status.error = 'Database connection failed';
    }
    
    const statusCode = status.status === 'error' ? 500 : 200;
    return res.status(statusCode).json(status);
    
  } catch (error) {
    console.error('❌ Health check error:', error);
    return res.status(500).json({
      status: 'error',
      error: 'Health check failed',
      details: error.message,
      timestamp: new Date().toISOString()
    });
  }
};
