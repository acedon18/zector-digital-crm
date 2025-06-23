// Companies API endpoint - Get real company data from MongoDB with enrichment
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

// Function to enrich company data using our enrichment API
async function enrichCompanyData(domain) {
  try {
    const response = await fetch(`${process.env.VERCEL_URL ? 'https://' + process.env.VERCEL_URL : 'http://localhost:3000'}/api/enrich`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ domain })
    });
    
    if (response.ok) {
      const result = await response.json();
      if (result.success && result.data) {
        return result.data;
      }
    }
  } catch (error) {
    console.log(`Enrichment failed for ${domain}:`, error.message);
  }
  
  return null;
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
    
    // Get unique companies from visits collection
    const visitsCollection = db.collection('visits');
    const visits = await visitsCollection
      .find({ customerId: { $exists: true }, domain: { $exists: true } })
      .sort({ startTime: -1 })
      .limit(100)
      .toArray();
    
    // Aggregate company data
    const companiesMap = new Map();
    
    visits.forEach(visit => {
      const domain = visit.domain;
      if (!domain) return;
      
      if (!companiesMap.has(domain)) {
        companiesMap.set(domain, {
          id: visit.customerId || domain.replace(/[^a-zA-Z0-9]/g, '_'),
          name: domain.split('.')[0].charAt(0).toUpperCase() + domain.split('.')[0].slice(1),
          domain: domain,
          industry: 'Unknown',
          size: 'Unknown',
          location: { city: 'Unknown', country: 'Unknown' },
          lastVisit: visit.startTime,
          totalVisits: 1,
          score: 50,
          status: 'new',
          tags: ['Website Visitor'],
          phone: '',
          email: '',
          website: `https://${domain}`
        });
      } else {
        const company = companiesMap.get(domain);
        company.totalVisits += 1;
        company.lastVisit = new Date(Math.max(new Date(company.lastVisit), new Date(visit.startTime)));
        
        // Update status based on visits
        if (company.totalVisits >= 10) {
          company.status = 'hot';
          company.score = 90;
        } else if (company.totalVisits >= 5) {
          company.status = 'warm';
          company.score = 70;
        } else if (company.totalVisits >= 2) {
          company.status = 'cold';
          company.score = 40;
        }
      }
    });
    
    const companies = Array.from(companiesMap.values());
    
    // Enrich company data (for top companies to avoid rate limits)
    const topCompanies = companies.slice(0, 10); // Only enrich first 10 companies
    for (const company of topCompanies) {
      const enrichedData = await enrichCompanyData(company.domain);
      if (enrichedData) {
        company.name = enrichedData.name || company.name;
        company.industry = enrichedData.industry || company.industry;
        company.size = enrichedData.size || company.size;
        company.description = enrichedData.description;
        company.enriched = true;
        company.confidence = enrichedData.confidence;
        
        // Update status if enriched with high confidence
        if (enrichedData.confidence > 0.8) {
          company.tags.push('Verified Company');
        }
      }
    }
    
    return res.status(200).json({
      success: true,
      companies: companies,
      total: companies.length,
      enriched: topCompanies.filter(c => c.enriched).length,
      timestamp: new Date().toISOString()
    });
      } catch (error) {
    console.error('Companies API error:', error);
    
    // Return error as JSON instead of HTML
    return res.status(500).json({
      success: false,
      error: 'Database connection failed',
      details: error.message,
      companies: [],
      total: 0,
      fallback: true
    });
  }
}
