// Recent visitors API endpoint - Get recent website visitors from visits collection
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

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { db } = await connectToDatabase();
    
    // Get limit from query parameters (default: 15)
    const limit = parseInt(req.query.limit) || 15;
    
    // Get recent visitors by aggregating visits by domain
    const visitsCollection = db.collection('visits');
    const companiesCollection = db.collection('companies');
    
    // Aggregate visits by domain to get recent visitor companies
    const recentVisitorDomains = await visitsCollection.aggregate([
      // Match recent visits (last 30 days)
      {
        $match: {
          startTime: { 
            $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) 
          }
        }
      },
      // Group by domain and get visitor stats
      {
        $group: {
          _id: "$domain",
          lastVisit: { $max: "$startTime" },
          totalVisits: { $sum: 1 },
          totalDuration: { $sum: "$duration" },
          uniqueSessions: { $addToSet: "$sessionId" },
          sources: { $addToSet: "$referrer" },
          pages: { $push: "$pages" },
          locations: { $addToSet: "$location" }
        }
      },
      // Sort by most recent visit
      { $sort: { lastVisit: -1 } },
      // Limit results
      { $limit: limit }
    ]).toArray();

    console.log(`[VISITORS API] Found ${recentVisitorDomains.length} recent visitor domains`);

    // For each domain, try to get company information
    const visitors = await Promise.all(
      recentVisitorDomains.map(async (visitor) => {
        const domain = visitor._id;
        
        // Try to find company information for this domain
        let companyInfo = await companiesCollection.findOne({ domain: domain });
        
        // If no company info, create basic info from domain
        if (!companyInfo) {
          // Extract company name from domain
          const domainName = domain
            ? domain.replace(/^www\./, '').replace(/\.(com|net|org|es|co\.uk|de|fr)$/i, '')
            : 'Unknown';
          
          const capitalizedName = domainName.charAt(0).toUpperCase() + domainName.slice(1);
          
          companyInfo = {
            name: capitalizedName,
            domain: domain,
            industry: 'Unknown Industry',
            size: 'Unknown',
            location: { 
              city: visitor.locations?.[0]?.city || 'Unknown', 
              country: visitor.locations?.[0]?.country || 'Unknown' 
            }
          };
        }

        // Calculate engagement score based on visits and duration
        const avgDuration = visitor.totalDuration / visitor.totalVisits;
        const uniqueSessionCount = visitor.uniqueSessions.length;
        
        let score = 0;
        if (visitor.totalVisits > 5) score += 30;
        else if (visitor.totalVisits > 2) score += 20;
        else score += 10;
        
        if (avgDuration > 300) score += 25; // 5+ minutes
        else if (avgDuration > 120) score += 15; // 2+ minutes
        else if (avgDuration > 60) score += 10; // 1+ minute
        
        if (uniqueSessionCount > 3) score += 20;
        else if (uniqueSessionCount > 1) score += 10;
        
        // Determine status based on score and recency
        let status = 'cold';
        const daysSinceLastVisit = (Date.now() - new Date(visitor.lastVisit).getTime()) / (1000 * 60 * 60 * 24);
        
        if (score > 60 && daysSinceLastVisit < 1) status = 'hot';
        else if (score > 40 && daysSinceLastVisit < 3) status = 'warm';
        else if (daysSinceLastVisit < 7) status = 'warm';

        return {
          id: companyInfo._id?.toString() || `visitor-${domain}`,
          name: companyInfo.name || capitalizedName,
          domain: domain,
          industry: companyInfo.industry || 'Unknown Industry',
          size: companyInfo.size || 'Unknown',
          location: companyInfo.location || { 
            city: visitor.locations?.[0]?.city || 'Unknown', 
            country: visitor.locations?.[0]?.country || 'Unknown' 
          },
          lastVisit: visitor.lastVisit,
          totalVisits: visitor.totalVisits,
          uniqueSessions: uniqueSessionCount,
          avgDuration: Math.round(avgDuration),
          score: Math.min(score, 100),
          status: status,
          tags: [
            visitor.totalVisits > 5 ? 'High Activity' : 'Active',
            uniqueSessionCount > 1 ? 'Returning Visitor' : 'New Visitor'
          ],
          phone: companyInfo.phone || '',
          email: companyInfo.email || '',
          website: companyInfo.website || `https://${domain}`,
          // Additional visitor insights
          sources: visitor.sources.filter(s => s && s !== '').slice(0, 3),
          recentActivity: `${visitor.totalVisits} visits, ${uniqueSessionCount} sessions`
        };
      })
    );

    console.log(`[VISITORS API] Processed ${visitors.length} visitor companies with engagement data`);

    return res.status(200).json({
      success: true,
      source: 'real_data',
      visitors: visitors,
      total: visitors.length,
      timestamp: new Date().toISOString(),
      note: `Recent visitor companies aggregated from ${recentVisitorDomains.reduce((sum, v) => sum + v.totalVisits, 0)} visits`
    });

  } catch (error) {
    console.error('[VISITORS API] Error:', error);
    
    // Return empty array on error - no fallback data
    return res.status(500).json({
      success: false,
      source: 'error',
      visitors: [],
      total: 0,
      timestamp: new Date().toISOString(),
      error: error.message,
      note: 'Database connection failed. No fallback data provided.'
    });
  }
}
