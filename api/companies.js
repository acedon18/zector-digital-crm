// Companies API endpoint - Get real company data from MongoDB
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
  }  const client = new MongoClient(MONGO_URI, {
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
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Tenant-ID');
  
  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }  try {
    const { db } = await connectToDatabase();
    
    // Get tenantId from header or query parameter
    const tenantId = req.headers['x-tenant-id'] || req.query.tenantId || 'default-tenant';
    
    // Get companies filtered by tenant
    const companiesCollection = db.collection('companies');
    const query = { tenantId: tenantId };
    
    const companiesData = await companiesCollection
      .find(query)
      .sort({ lastVisit: -1 })
      .limit(100)
      .toArray();
    
    // Convert MongoDB documents to the expected format
    const companies = companiesData.map(company => ({
      id: company._id.toString(),
      name: company.name,
      domain: company.domain,
      industry: company.industry || 'Unknown',
      size: company.size || 'Unknown',
      location: company.location || { city: 'Unknown', country: 'Unknown' },
      lastVisit: company.lastVisit,
      totalVisits: company.totalVisits || 0,
      score: company.score || 50,
      status: company.status || 'new',
      tags: company.tags || [],
      phone: company.phone || '',
      email: company.email || '',
      website: company.website || `https://${company.domain}`,
      tenantId: company.tenantId
    }));
    
    // If we have real data, return it
    if (companies.length > 0) {
      console.log(`Returning ${companies.length} real companies for tenant ${tenantId} from MongoDB`);
      return res.status(200).json({
        success: true,
        companies: companies,
        total: companies.length,
        tenantId: tenantId,
        timestamp: new Date().toISOString(),
        source: 'real_data',
        note: `Found ${companies.length} companies in database`
      });
    }
    
    // No mock data - return empty array when no real data exists
    console.log('No companies found in database - returning empty array');
    return res.status(200).json({
      success: true,
      companies: [],
      total: 0,
      tenantId: tenantId,
      timestamp: new Date().toISOString(),
      source: 'real_data',
      note: 'No companies found in database'
    });      } catch (error) {
    console.error('Companies API error:', error);
    
    // Return empty array on error - no fallback data
    return res.status(500).json({
      success: false,
      error: 'Database connection failed',
      details: error.message,
      companies: [],
      total: 0,
      fallback: false,
      timestamp: new Date().toISOString(),
      source: 'error',
      note: 'MongoDB connection failed. No fallback data provided.',
      troubleshooting: {
        mongoUri: process.env.MONGO_URI ? 'SET (length: ' + process.env.MONGO_URI.length + ')' : 'NOT SET',
        mongodbUri: process.env.MONGODB_URI ? 'SET (length: ' + process.env.MONGODB_URI.length + ')' : 'NOT SET',
        error_type: error.message.includes('SSL') || error.message.includes('TLS') ? 'SSL_ERROR' : 
                   error.message.includes('Authentication') ? 'AUTH_ERROR' :
                   error.message.includes('timeout') ? 'TIMEOUT_ERROR' : 
                   error.message.includes('ENOTFOUND') ? 'DNS_ERROR' : 'UNKNOWN_ERROR',
        suggested_fix: error.message.includes('SSL') || error.message.includes('TLS') ? 
                      'Update MongoDB connection with SSL parameters' :
                      error.message.includes('Authentication') ? 
                      'Check MongoDB username/password' : 
                      'Check MongoDB URI format and network connectivity'
      }
    });
  }
}
