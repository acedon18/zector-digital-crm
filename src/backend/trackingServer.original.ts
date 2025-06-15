// Backend Tracking Endpoint - Handle incoming visitor data
// This would typically be implemented in your backend (Node.js/Express, Python/Django, etc.)

import express, { Request, Response, Application } from 'express';
import cors from 'cors';
import { realVisitorTrackingService } from '../services/realVisitorTrackingService';
import mongoose, { Document } from 'mongoose';
import dotenv from 'dotenv';

// Initialize environment variables
dotenv.config();

// Define MongoDB query interface for type safety
interface CompanyQuery {
  status?: string;
  industry?: string;
  minConfidence?: string;
  score?: { $gte: number };
  $or?: Array<Record<string, RegExp | string | boolean | number>>;
}

// Define sort options interface
interface SortOptions {
  score?: number;
  totalVisits?: number;
  lastVisit?: number;
}

// Create Express app
const app = express();
app.use(cors());
app.use(express.json());

// MongoDB connection setup (mirroring the Node.js implementation)
const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/zector-digital-crm';
    
    console.log('🔌 TypeScript: Connecting to MongoDB...');
    await mongoose.connect(mongoURI);
    console.log('📊 TypeScript: MongoDB Connected Successfully!');
    return true;
  } catch (error) {
    console.error('❌ TypeScript: MongoDB Connection Error:', error);
    // Fallback to in-memory storage in case of connection failure
    return false;
  }
};

// Define simplified schemas for this TypeScript implementation
const companySchema = new mongoose.Schema({
  name: String,
  domain: { type: String, required: true, index: true },
  industry: String,
  size: String,
  location: {
    city: String,
    country: String
  },
  phone: String,
  email: String,
  website: String,
  firstVisit: { type: Date, default: Date.now },
  lastVisit: { type: Date, default: Date.now },
  totalVisits: { type: Number, default: 1 },
  score: { type: Number, default: 50 },
  status: {
    type: String,
    enum: ['hot', 'warm', 'cold'],
    default: 'cold'
  },
  tags: [String]
});

const Company = mongoose.model('Company', companySchema);

const app = express();

app.use(cors());
app.use(express.json());

// Global database connection flag
let dbConnected = false;

// Connect to MongoDB
connectDB().then(connected => {
  dbConnected = connected;
});

// Main tracking endpoint that receives data from your website
app.post('/track', async (req, res) => {
  try {
    const trackingData = req.body;
    
    // Extract real IP address (considering proxies/load balancers)
    const ip = req.headers['x-forwarded-for'] as string || 
               req.headers['x-real-ip'] as string ||
               req.connection.remoteAddress ||
               req.ip;

    // Add IP to tracking data
    trackingData.ip = ip;
    
    // Validate required fields
    if (!trackingData.customerId || !trackingData.domain || !trackingData.event) {
      return res.status(400).json({ 
        error: 'Missing required fields: customerId, domain, event' 
      });
    }

    // Process the tracking data
    await realVisitorTrackingService.processTrackingData(trackingData);

    res.status(200).json({ 
      success: true, 
      message: 'Tracking data processed successfully' 
    });

  } catch (error) {
    console.error('Tracking endpoint error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: 'Failed to process tracking data' 
    });
  }
});

// API endpoints for the dashboard
app.get('/api/visitors/realtime', async (req, res) => {
  try {
    if (dbConnected) {
      // Use MongoDB for real-time visitor data
      const cutoff = new Date(Date.now() - 30 * 60 * 1000); // Last 30 minutes
      const recentCompanies = await Company.find({ lastVisit: { $gte: cutoff } })
        .sort({ lastVisit: -1 })
        .limit(50)
        .lean();
      
      // Transform to expected format
      const visitors = recentCompanies.map(company => ({
        sessionId: `session_${company._id}`,
        ip: '192.168.0.1', // Anonymized for privacy
        currentPage: '/',
        startTime: company.firstVisit,
        lastActivity: company.lastVisit,
        pageViews: company.totalVisits,
        companyInfo: {
          name: company.name || company.domain,
          domain: company.domain,
          industry: company.industry,
          size: company.size,
          confidence: company.score / 100,
          phone: company.phone,
          email: company.email,
          website: company.website
        },
        isActive: true
      }));
      
      res.json(visitors);
    } else {
      const visitors = await realVisitorTrackingService.getRealTimeVisitors();
      res.json(visitors);
    }
  } catch (error) {
    console.error('Real-time visitors error:', error);
    res.status(500).json({ error: 'Failed to get real-time visitors' });
  }
});

app.get('/api/visitors/sessions', async (req, res) => {
  try {
    const { from, to, domain, hasCompanyInfo } = req.query;
    
    const filters: {
      from?: Date;
      to?: Date;
      domain?: string;
      hasCompanyInfo?: boolean;
    } = {};
    if (from) filters.from = new Date(from as string);
    if (to) filters.to = new Date(to as string);
    if (domain) filters.domain = domain as string;
    if (hasCompanyInfo) filters.hasCompanyInfo = hasCompanyInfo === 'true';

    const sessions = await realVisitorTrackingService.getVisitorSessions(filters);
    res.json(sessions);
  } catch (error) {
    console.error('Visitor sessions error:', error);
    res.status(500).json({ error: 'Failed to get visitor sessions' });
  }
});

app.get('/api/companies/leads', async (req, res) => {
  try {
    const { minConfidence, industry, size, hasContactInfo, status } = req.query;
    
    if (dbConnected) {
      // Build MongoDB query
      const query: any = {};
      
      if (status) {
        query.status = status;
      }
      
      if (industry) {
        query.industry = industry;
      }
      
      if (minConfidence) {
        query.score = { $gte: parseInt(minConfidence as string) };
      }
      
      if (hasContactInfo === 'true') {
        query.$or = [
          { email: { $exists: true, $ne: null } },
          { phone: { $exists: true, $ne: null } }
        ];
      }
      
      // Fetch from MongoDB
      const companies = await Company.find(query)
        .sort({ lastVisit: -1, score: -1 })
        .limit(50)
        .lean();
      
      // Transform to expected format
      const formattedCompanies = companies.map(company => ({
        id: company._id.toString(),
        name: company.name || `Unknown (${company.domain})`,
        domain: company.domain,
        industry: company.industry || 'Unknown',
        size: company.size || 'Unknown',
        location: company.location || { city: 'Unknown', country: 'Unknown' },
        lastVisit: company.lastVisit,
        totalVisits: company.totalVisits,
        score: company.score,
        status: company.status,
        tags: company.tags || [],
        phone: company.phone,
        email: company.email,
        website: company.website || `https://${company.domain}`
      }));
      
      res.json(formattedCompanies);
    } else {
      // Fallback to service
      const filters: {
        minConfidence?: number;
        industry?: string;
        size?: string;
        hasContactInfo?: boolean;
      } = {};
      if (minConfidence) filters.minConfidence = parseFloat(minConfidence as string);
      if (industry) filters.industry = industry as string;
      if (size) filters.size = size as string;
      if (hasContactInfo) filters.hasContactInfo = hasContactInfo === 'true';

      const companies = await realVisitorTrackingService.getCompanyLeads(filters);
      
      // Filter by status if provided
      let filteredCompanies = companies;
      if (status) {
        filteredCompanies = companies.filter(c => c.status === status);
      }
      
      res.json(filteredCompanies);
    }
  } catch (error) {
    console.error('Company leads error:', error);
    res.status(500).json({ error: 'Failed to get company leads' });
  }
});

// API endpoints for companies (Lead Tracking)
app.get('/api/visitors/companies', async (req, res) => {
  try {
    const { minConfidence, industry, status } = req.query;
    
    if (dbConnected) {
      // Reuse the MongoDB query from companies/leads
      res.redirect(`/api/companies/leads?${req.originalUrl.split('?')[1] || ''}`);
    } else {
      const filters: {
        minConfidence?: number;
        industry?: string;
        size?: string;
        hasContactInfo?: boolean;
      } = {};
      if (minConfidence) filters.minConfidence = parseFloat(minConfidence as string);
      if (industry) filters.industry = industry as string;

      let companies = await realVisitorTrackingService.getCompanyLeads(filters);
      
      // Filter by status if provided
      if (status) {
        companies = companies.filter(c => c.status === status);
      }
      
      res.json(companies);
    }
  } catch (error) {
    console.error('Company leads error:', error);
    res.status(500).json({ error: 'Failed to get companies' });
  }
});

app.get('/api/visitors/companies/enriched', async (req, res) => {
  try {
    const { minConfidence, industry, status } = req.query;
    
    if (dbConnected) {
      // Build MongoDB query
      const query: any = {};
      
      if (status) {
        query.status = status;
      }
      
      if (industry) {
        query.industry = industry;
      }
      
      if (minConfidence) {
        query.score = { $gte: parseInt(minConfidence as string) };
      }
      
      // Fetch from MongoDB
      const companies = await Company.find(query)
        .sort({ lastVisit: -1, score: -1 })
        .limit(50)
        .lean();
      
      // Transform to enriched format
      const enrichedData = companies.map(company => ({
        company: {
          id: company._id.toString(),
          name: company.name || `Unknown (${company.domain})`,
          domain: company.domain,
          industry: company.industry || 'Unknown',
          size: company.size || 'Unknown',
          location: company.location || { city: 'Unknown', country: 'Unknown' },
          lastVisit: company.lastVisit,
          totalVisits: company.totalVisits,
          score: company.score,
          status: company.status,
          tags: company.tags || [],
          phone: company.phone,
          email: company.email,
          website: company.website || `https://${company.domain}`
        },
        platformData: {},
        enrichmentScore: company.score / 100 * Math.random() + 0.5,
        lastEnriched: new Date()
      }));
      
      res.json(enrichedData);
    } else {
      const filters: {
        minConfidence?: number;
        industry?: string;
        size?: string;
        hasContactInfo?: boolean;
      } = {};
      if (minConfidence) filters.minConfidence = parseFloat(minConfidence as string);
      if (industry) filters.industry = industry as string;

      let companies = await realVisitorTrackingService.getCompanyLeads(filters);
      
      // Filter by status if provided
      if (status) {
        companies = companies.filter(c => c.status === status);
      }
      
      // Mock enriched data structure for now
      const enrichedData = companies.map(company => ({
        company,
        platformData: {},
        enrichmentScore: Math.random() * 100,
        lastEnriched: new Date()
      }));
      
      res.json(enrichedData);
    }
  } catch (error) {
    console.error('Enriched companies error:', error);
    res.status(500).json({ error: 'Failed to get enriched companies' });
  }
});

app.get('/api/visitors/companies/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    if (dbConnected) {
      // Fetch from MongoDB
      try {
        const company = await Company.findById(id).lean();
        
        if (!company) {
          return res.status(404).json({ error: 'Company not found' });
        }
        
        // Transform to expected format
        const formattedCompany = {
          id: company._id.toString(),
          name: company.name || `Unknown (${company.domain})`,
          domain: company.domain,
          industry: company.industry || 'Unknown',
          size: company.size || 'Unknown',
          location: company.location || { city: 'Unknown', country: 'Unknown' },
          lastVisit: company.lastVisit,
          totalVisits: company.totalVisits,
          score: company.score,
          status: company.status,
          tags: company.tags || [],
          phone: company.phone,
          email: company.email,
          website: company.website || `https://${company.domain}`
        };
        
        res.json(formattedCompany);
      } catch (err) {
        return res.status(404).json({ error: 'Company not found' });
      }
    } else {
      const companies = await realVisitorTrackingService.getCompanyLeads();
      const company = companies.find(c => c.id === id);
      
      if (!company) {
        return res.status(404).json({ error: 'Company not found' });
      }
      
      res.json(company);
    }
  } catch (error) {
    console.error('Get company error:', error);
    res.status(500).json({ error: 'Failed to get company' });
  }
});

app.get('/api/visitors/companies/recent', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;
    
    if (dbConnected) {
      // Fetch from MongoDB
      const recentCompanies = await Company.find({})
        .sort({ lastVisit: -1 })
        .limit(limit)
        .lean();
      
      // Transform to expected format
      const formattedCompanies = recentCompanies.map(company => ({
        id: company._id.toString(),
        name: company.name || `Unknown (${company.domain})`,
        domain: company.domain,
        industry: company.industry || 'Unknown',
        size: company.size || 'Unknown',
        location: company.location || { city: 'Unknown', country: 'Unknown' },
        lastVisit: company.lastVisit,
        totalVisits: company.totalVisits,
        score: company.score,
        status: company.status,
        tags: company.tags || [],
        phone: company.phone,
        email: company.email,
        website: company.website || `https://${company.domain}`
      }));
      
      res.json(formattedCompanies);
    } else {
      let companies = await realVisitorTrackingService.getCompanyLeads();
      companies = companies.sort((a, b) => b.lastVisit.getTime() - a.lastVisit.getTime()).slice(0, limit);
      res.json(companies);
    }
  } catch (error) {
    console.error('Recent visitors error:', error);
    res.status(500).json({ error: 'Failed to get recent visitors' });
  }
});

app.get('/api/visitors/companies/hot', async (req, res) => {
  try {
    if (dbConnected) {
      // Fetch from MongoDB
      const hotCompanies = await Company.find({ 
        status: 'hot',
        score: { $gte: 70 }
      })
      .sort({ score: -1, lastVisit: -1 })
      .limit(10)
      .lean();
      
      // Transform to expected format
      const formattedCompanies = hotCompanies.map(company => ({
        id: company._id.toString(),
        name: company.name || `Unknown (${company.domain})`,
        domain: company.domain,
        industry: company.industry || 'Unknown',
        size: company.size || 'Unknown',
        location: company.location || { city: 'Unknown', country: 'Unknown' },
        lastVisit: company.lastVisit,
        totalVisits: company.totalVisits,
        score: company.score,
        status: company.status,
        tags: company.tags || [],
        phone: company.phone,
        email: company.email,
        website: company.website || `https://${company.domain}`
      }));
      
      res.json(formattedCompanies);
    } else {
      let companies = await realVisitorTrackingService.getCompanyLeads();
      companies = companies.filter(c => c.status === 'hot');
      res.json(companies);
    }
  } catch (error) {
    console.error('Hot leads error:', error);
    res.status(500).json({ error: 'Failed to get hot leads' });
  }
});

// API endpoints for companies (Lead Tracking)
app.get('/api/companies/filtered', async (req, res) => {
  console.log('🔍 [TypeScript] Filtered companies endpoint called with query:', req.query);
  
  try {
    // Parse query parameters
    const { status, industry, search, sortBy, limit = 20 } = req.query;
    
    if (dbConnected) {
      // Build MongoDB query based on filters
      const query: any = {};
      
      // Filter by status
      if (status && status !== 'all') {
        query.status = status;
      }
      
      // Filter by industry
      if (industry && industry !== 'all') {
        query.industry = industry;
      }
      
      // Search by name, domain, email, website
      if (search) {
        const searchRegex = new RegExp(search as string, 'i');
        query.$or = [
          { name: searchRegex },
          { domain: searchRegex },
          { email: searchRegex },
          { website: searchRegex }
        ];
      }
      
      // Determine sort order
      let sortOptions: any = {};
      switch (sortBy) {
        case 'score':
          sortOptions = { score: -1 };
          break;
        case 'totalVisits':
          sortOptions = { totalVisits: -1 };
          break;
        case 'lastVisit':
        default:
          sortOptions = { lastVisit: -1 };
      }
      
      // Execute query with filtering, sorting, and limiting
      console.log('🔎 [TypeScript] MongoDB Query:', JSON.stringify(query));
      console.log('🔢 [TypeScript] Sort Options:', JSON.stringify(sortOptions));
      console.log('📏 [TypeScript] Limit:', limit);
      
      const companies = await Company.find(query)
        .sort(sortOptions)
        .limit(parseInt(limit as string))
        .lean();
      
      console.log('📊 [TypeScript] MongoDB Results Count:', companies.length);
      
      // Format response
      const formattedCompanies = companies.map(company => ({
        id: company._id.toString(),
        name: company.name || `Unknown (${company.domain})`,
        domain: company.domain,
        industry: company.industry || 'Unknown',
        size: company.size || 'Unknown',
        location: company.location || { city: 'Unknown', country: 'Unknown' },
        lastVisit: company.lastVisit,
        totalVisits: company.totalVisits,
        score: company.score,
        status: company.status,
        tags: company.tags || [],
        phone: company.phone,
        email: company.email,
        website: company.website || `https://${company.domain}`
      }));
      
      res.json(formattedCompanies);
    } else {
      // Start with all company leads
      let filteredCompanies = await realVisitorTrackingService.getCompanyLeads();
      
      // Apply filters
      if (status && status !== 'all') {
        filteredCompanies = filteredCompanies.filter(c => c.status === status);
      }
      
      if (industry && industry !== 'all') {
        filteredCompanies = filteredCompanies.filter(c => c.industry === industry);
      }
      
      if (search) {
        const searchLower = (search as string).toLowerCase();
        filteredCompanies = filteredCompanies.filter(c => 
          (c.name && c.name.toLowerCase().includes(searchLower)) || 
          (c.domain && c.domain.toLowerCase().includes(searchLower)) || 
          (c.email && c.email.toLowerCase().includes(searchLower)) || 
          (c.website && c.website.toLowerCase().includes(searchLower))
        );
      }
      
      // Apply sorting
      switch (sortBy) {
        case 'score':
          filteredCompanies.sort((a, b) => b.score - a.score);
          break;
        case 'totalVisits':
          filteredCompanies.sort((a, b) => b.totalVisits - a.totalVisits);
          break;
        case 'lastVisit':
        default:
          filteredCompanies.sort((a, b) => {
            const dateA = a.lastVisit instanceof Date ? a.lastVisit : new Date(a.lastVisit);
            const dateB = b.lastVisit instanceof Date ? b.lastVisit : new Date(b.lastVisit);
            return dateB.getTime() - dateA.getTime();
          });
      }
      
      // Apply limit
      const limitNum = parseInt(limit as string);
      filteredCompanies = filteredCompanies.slice(0, limitNum);
      
      res.json(filteredCompanies);
    }
  } catch (error) {
    console.error('[TypeScript] Filtered companies error:', error);
    res.status(500).json({ error: 'Failed to get filtered companies' });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    implementationType: 'TypeScript',
    databaseConnected: dbConnected
  });
});

const PORT = process.env.PORT || 3001;

// Try to start the server with port checking
const server = app.listen(PORT, () => {
  console.log(`🚀 TypeScript Tracking server running on port ${PORT}`);
  console.log(`📊 API endpoints available at http://localhost:${PORT}`);
  console.log(`❤️  Health check: http://localhost:${PORT}/health`);
}).on('error', (err: NodeJS.ErrnoException) => {
  if (err.code === 'EADDRINUSE') {
    console.log(`⚠️  Port ${PORT} is already in use. This is normal if the main server.cjs is running.`);
    console.log(`ℹ️  The TypeScript implementation is meant for development/testing purposes.`);
  } else {
    console.error('Server error:', err);
  }
});

export default app;
