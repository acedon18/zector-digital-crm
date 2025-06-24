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
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
    try {
    const { db } = await connectToDatabase();
    
    // Get companies directly from companies collection
    const companiesCollection = db.collection('companies');
    const companiesData = await companiesCollection
      .find({})
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
      website: company.website || `https://${company.domain}`
    }));
    
    // If we have real data, return it
    if (companies.length > 0) {
      console.log(`Returning ${companies.length} real companies from MongoDB`);
      return res.status(200).json({
        success: true,
        companies: companies,
        total: companies.length,
        timestamp: new Date().toISOString(),
        source: 'real_data',
        note: `Found ${companies.length} companies in database`
      });
    }
    
    // If no real data, return sample data for demonstration
    if (companies.length === 0) {
      console.log('No visits found in database, returning sample data');
      const sampleCompanies = [
        {
          id: 'comp-001',
          name: 'TechStart AB',
          domain: 'techstart.se',
          industry: 'Technology',
          size: '11-50',
          location: { city: 'Stockholm', country: 'Sweden' },
          lastVisit: new Date('2024-12-21T10:30:00.000Z'),
          totalVisits: 12,
          score: 85,
          status: 'hot',
          tags: ['Website Visitor', 'High Engagement'],
          phone: '+46 8 555 1234',
          email: 'contact@techstart.se',
          website: 'https://techstart.se'
        },
        {
          id: 'comp-002',
          name: 'Nordic Solutions',
          domain: 'nordicsolutions.com',
          industry: 'Consulting',
          size: '51-200',
          location: { city: 'Oslo', country: 'Norway' },
          lastVisit: new Date('2024-12-21T09:15:00.000Z'),
          totalVisits: 8,
          score: 70,
          status: 'warm',
          tags: ['Website Visitor', 'Potential Client'],
          phone: '+47 22 12 34 56',
          email: 'hello@nordicsolutions.com',
          website: 'https://nordicsolutions.com'
        },
        {
          id: 'comp-003',
          name: 'Danish Innovations',
          domain: 'danishinnovations.dk',
          industry: 'Manufacturing',
          size: '201-500',
          location: { city: 'Copenhagen', country: 'Denmark' },
          lastVisit: new Date('2024-12-21T08:45:00.000Z'),
          totalVisits: 3,
          score: 45,
          status: 'cold',
          tags: ['Website Visitor'],
          phone: '+45 33 12 34 56',
          email: 'info@danishinnovations.dk',
          website: 'https://danishinnovations.dk'
        },
        {
          id: 'comp-004',
          name: 'Finnish Design Co',
          domain: 'finnishdesign.fi',
          industry: 'Design',
          size: '1-10',
          location: { city: 'Helsinki', country: 'Finland' },
          lastVisit: new Date('2024-12-21T07:20:00.000Z'),
          totalVisits: 15,
          score: 92,
          status: 'hot',
          tags: ['Website Visitor', 'Design Partner'],
          phone: '+358 9 123 4567',
          email: 'studio@finnishdesign.fi',
          website: 'https://finnishdesign.fi'
        },
        {
          id: 'comp-005',
          name: 'Zector Digital',
          domain: 'zector.se',
          industry: 'Technology',
          size: '11-50',
          location: { city: 'Stockholm', country: 'Sweden' },
          lastVisit: new Date(),
          totalVisits: 25,
          score: 95,
          status: 'hot',
          tags: ['Website Visitor', 'CRM Provider'],
          phone: '+46 8 123 4567',
          email: 'contact@zector.se',
          website: 'https://zector.se'
        },
        {
          id: 'comp-006',
          name: 'Baltic Ventures',
          domain: 'balticventures.com',
          industry: 'Investment',
          size: '51-200',
          location: { city: 'Riga', country: 'Latvia' },
          lastVisit: new Date('2024-12-20T16:30:00.000Z'),
          totalVisits: 6,
          score: 65,
          status: 'warm',
          tags: ['Website Visitor', 'Investor'],
          phone: '+371 67 123 456',
          email: 'info@balticventures.com',
          website: 'https://balticventures.com'
        },
        {
          id: 'comp-007',
          name: 'Green Energy Solutions',
          domain: 'greenenergy.no',
          industry: 'Energy',
          size: '101-500',
          location: { city: 'Bergen', country: 'Norway' },
          lastVisit: new Date('2024-12-20T14:15:00.000Z'),
          totalVisits: 4,
          score: 55,
          status: 'cold',
          tags: ['Website Visitor', 'Sustainability'],
          phone: '+47 55 123 456',
          email: 'contact@greenenergy.no',
          website: 'https://greenenergy.no'
        }
      ];
      
      return res.status(200).json({
        success: true,
        companies: sampleCompanies,
        total: sampleCompanies.length,
        timestamp: new Date().toISOString(),
        source: 'sample_data',
        note: 'Showing sample companies for demonstration'
      });
    }
    
    return res.status(200).json({
      success: true,
      companies: companies,
      total: companies.length,
      timestamp: new Date().toISOString(),
      source: 'real_data',
      note: 'Data from MongoDB visits collection'
    });      } catch (error) {
    console.error('Companies API error:', error);
    
    // Return comprehensive error information for debugging
    return res.status(500).json({
      success: false,
      error: 'Database connection failed',
      details: error.message,
      companies: [],
      total: 0,
      fallback: true,
      timestamp: new Date().toISOString(),
      source: 'error_fallback',
      note: 'MongoDB connection failed. Check environment variables and network connectivity.',
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
