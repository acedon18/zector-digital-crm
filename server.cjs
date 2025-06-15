// Simple Backend Server for Zector Digital CRM
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const connectDB = require('./db/connection.cjs');
const { Company, Visit, Customer, TrackingScript } = require('./db/models.cjs');

const app = express();

app.use(cors());
app.use(express.json());

// Connect to MongoDB
let dbConnected = false;
connectDB().then(connected => {
  dbConnected = connected;
  if (!connected) {
    console.warn('⚠️ Using in-memory storage because database connection failed');
  }
});

// In-memory storage fallback for demo purposes
let visitors = [];
let sessions = [];
let companies = [
  {
    id: 'company_1',
    name: 'Tech Solutions Inc',
    domain: 'techsolutions.com',
    industry: 'Technology',
    size: '51-200',
    location: { city: 'San Francisco', country: 'United States' },
    lastVisit: new Date(),
    totalVisits: 5,
    score: 85,
    status: 'hot',
    tags: ['High Engagement', 'Has Email'],
    phone: '+1 (415) 555-1234',
    email: 'contact@techsolutions.com',
    website: 'www.techsolutions.com'
  },
  {
    id: 'company_3',
    name: 'E-commerce Solutions',
    domain: 'ecommerce.com',
    industry: 'Retail',
    size: '201-500',
    location: { city: 'London', country: 'United Kingdom' },
    lastVisit: new Date(),
    totalVisits: 8,
    score: 90,
    status: 'hot',
    tags: ['Enterprise', 'High Value'],
    phone: '+44 20 7946 0958',
    email: 'sales@ecommerce.com',
    website: 'www.ecommerce.com'
  }
];

// Main tracking endpoint
app.post('/track', async (req, res) => {
  try {
    const trackingData = req.body;
    
    // Extract real IP address
    const ip = req.headers['x-forwarded-for'] || 
               req.headers['x-real-ip'] ||
               req.socket.remoteAddress ||
               req.ip ||
               '127.0.0.1';

    trackingData.ip = ip;
    trackingData.timestamp = new Date().toISOString();
    
    // Validate required fields
    if (!trackingData.customerId || !trackingData.domain || !trackingData.event) {
      return res.status(400).json({ 
        error: 'Missing required fields: customerId, domain, event' 
      });
    }

    console.log('Received tracking data:', trackingData);
    
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
      
      // Find or create a session
      let session = await Visit.findOne({
        sessionId: trackingData.sessionId || `session_${Date.now()}_${ip.replace(/\./g, '_')}`
      });
      
      if (!session) {
        session = new Visit({
          sessionId: trackingData.sessionId || `session_${Date.now()}_${ip.replace(/\./g, '_')}`,
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
          timeOnPage: 0, // Will be updated later
          scrollDepth: 0,
          interactions: 0
        });
        
        // Update company information based on domain intelligence
        let companyDomain = trackingData.domain;
        
        // Try to find existing company record
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
      
      // Update session
      session.lastActivity = new Date();
      await session.save();
      
      // Also update in-memory storage for compatibility
      const visitor = {
        sessionId: session.sessionId,
        ip: ip,
        currentPage: trackingData.url || '/',
        startTime: session.startTime,
        lastActivity: new Date(),
        pageViews: session.pages.length,
        isActive: true,
        domain: trackingData.domain
      };
      
      // Update in-memory tracking
      const existingVisitorIndex = visitors.findIndex(v => v.sessionId === session.sessionId);
      if (existingVisitorIndex >= 0) {
        visitors[existingVisitorIndex] = visitor;
      } else {
        visitors.push(visitor);
      }
    } else {
      // Fallback to in-memory storage
      if (trackingData.event === 'page_view') {
        // Add to visitors array
        const visitor = {
          sessionId: `session_${Date.now()}`,
          ip: trackingData.ip,
          currentPage: trackingData.url || '/',
          startTime: new Date(),
          lastActivity: new Date(),
          pageViews: 1,
          isActive: true,
          domain: trackingData.domain
        };
        visitors.push(visitor);
      }
    }

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
    // Return recent visitors (last 30 minutes)
    const cutoff = new Date(Date.now() - 30 * 60 * 1000);
    
    if (dbConnected) {
      // Get recent visits from MongoDB
      const recentSessions = await Visit.find({
        lastActivity: { $gte: cutoff }
      })
      .sort({ lastActivity: -1 })
      .limit(50)
      .exec();
      
      const realtimeVisitors = await Promise.all(recentSessions.map(async (session) => {
        // Try to get company info for this session
        let companyInfo = null;
        if (session.companyId) {
          companyInfo = await Company.findById(session.companyId).lean();
        }
        
        return {
          sessionId: session.sessionId,
          ip: session.anonymizedIp || session.ipAddress,
          currentPage: session.pages.length > 0 ? session.pages[session.pages.length - 1].url : '/',
          startTime: session.startTime,
          lastActivity: session.lastActivity || session.startTime,
          pageViews: session.pages.length,
          isActive: true,
          domain: session.domain,
          companyInfo: companyInfo
        };
      }));
      
      res.json(realtimeVisitors);
    } else {
      // Fallback to in-memory storage
      const realtimeVisitors = visitors.filter(v => v.lastActivity > cutoff);
      res.json(realtimeVisitors);
    }
  } catch (error) {
    console.error('Real-time visitors error:', error);
    res.status(500).json({ error: 'Failed to get real-time visitors' });
  }
});

app.get('/api/visitors/sessions', async (req, res) => {
  try {
    // Parse query parameters
    const { from, to, domain, hasCompanyInfo } = req.query;
    
    if (dbConnected) {
      // Build query based on filters
      const query = {};
      
      if (from) {
        query.startTime = { $gte: new Date(from) };
      }
      
      if (to) {
        query.startTime = { ...query.startTime, $lte: new Date(to) };
      }
      
      if (domain) {
        query.domain = domain;
      }
      
      if (hasCompanyInfo === 'true') {
        query.companyId = { $exists: true, $ne: null };
      }
      
      // Fetch sessions from MongoDB
      const sessions = await Visit.find(query)
        .sort({ startTime: -1 })
        .limit(50)
        .populate('companyId')  // Populate company information
        .lean();
      
      // Transform the data to match expected format
      const formattedSessions = await Promise.all(sessions.map(async (session) => {
        // Calculate session duration
        const sessionDuration = session.endTime ? 
          new Date(session.endTime).getTime() - new Date(session.startTime).getTime() : 
          (session.pages.length > 0 ? 
            session.pages.reduce((total, page) => total + (page.timeOnPage || 0), 0) : 
            0);
        
        return {
          id: session._id.toString(),
          sessionId: session.sessionId,
          ip: session.anonymizedIp || session.ipAddress,
          userAgent: session.userAgent,
          timestamp: session.startTime,
          domain: session.domain,
          pages: session.pages.map(page => ({
            url: page.url,
            title: page.title,
            timestamp: page.timestamp,
            timeOnPage: page.timeOnPage || 0
          })),
          sessionDuration,
          companyInfo: session.companyId ? {
            name: session.companyId.name,
            domain: session.companyId.domain,
            industry: session.companyId.industry,
            size: session.companyId.size,
            confidence: session.companyId.enrichmentConfidence || 0.7,
            phone: session.companyId.phone,
            email: session.companyId.email,
            website: session.companyId.website
          } : null
        };
      }));
      
      res.json(formattedSessions);
    } else {
      // Mock session data fallback
      const mockSessions = [
        {
          id: 'session_1',
          ip: '192.168.1.1',
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          timestamp: new Date(Date.now() - 60000),
          domain: 'example.com',
          pages: [
            {
              url: '/home',
              title: 'Home Page',
              timestamp: new Date(Date.now() - 60000),
              timeOnPage: 45000
            }
          ],
          sessionDuration: 45000,
          companyInfo: {
            name: 'Example Corp',
            domain: 'example.com',
            industry: 'Technology',
            size: '51-200',
            confidence: 0.85,
            phone: '+1 (555) 123-4567',
            email: 'contact@example.com',
            website: 'www.example.com'
          }
        }
      ];
      res.json(mockSessions);
    }
  } catch (error) {
    console.error('Visitor sessions error:', error);
    res.status(500).json({ error: 'Failed to get visitor sessions' });
  }
});

app.get('/api/companies/leads', async (req, res) => {
  try {
    // Parse query parameters for filtering
    const { status, industry, minScore } = req.query;
    
    if (dbConnected) {
      // Build query based on filters
      const query = {};
      
      if (status) {
        query.status = status;
      }
      
      if (industry) {
        query.industry = industry;
      }
      
      if (minScore) {
        query.score = { $gte: parseInt(minScore) };
      }
      
      // Fetch companies from MongoDB
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
      // Mock company leads data fallback
      const mockCompanies = [
        {
          id: 'company_1',
          name: 'Tech Solutions Inc',
          domain: 'techsolutions.com',
          industry: 'Technology',
          size: '51-200',
          location: {
            city: 'San Francisco',
            country: 'United States'
          },
          lastVisit: new Date(Date.now() - 120000),
          totalVisits: 5,
          score: 85,
          status: 'hot',
          tags: ['High Engagement', 'Has Email'],
          phone: '+1 (415) 555-1234',
          email: 'contact@techsolutions.com',
          website: 'www.techsolutions.com'
        },
        {
          id: 'company_2',
          name: 'Marketing Pro LLC',
          domain: 'marketingpro.com',
          industry: 'Marketing',
          size: '11-50',
          location: {
            city: 'New York',
            country: 'United States'
          },
          lastVisit: new Date(Date.now() - 300000),
          totalVisits: 3,
          score: 65,
          status: 'warm',
          tags: ['Has Phone'],
          phone: '+1 (212) 555-6789',
          email: 'info@marketingpro.com',
          website: 'www.marketingpro.com'
        }
      ];
      
      // Apply filters to mock data
      const filteredCompanies = mockCompanies.filter(c => {
        if (status && c.status !== status) return false;
        if (industry && c.industry !== industry) return false;
        if (minScore && c.score < parseInt(minScore)) return false;
        return true;
      });
      
      res.json(filteredCompanies);
    }
  } catch (error) {
    console.error('Company leads error:', error);
    res.status(500).json({ error: 'Failed to get company leads' });
  }
});

app.get('/api/visitors/companies', async (req, res) => {
  try {
    // Forward to /api/companies/leads endpoint
    const response = await fetch(`http://localhost:${PORT}/api/companies/leads`);
    const companies = await response.json();
    res.json(companies);
  } catch (error) {
    console.error('Companies error:', error);
    res.status(500).json({ error: 'Failed to get companies' });
  }
});

app.get('/api/visitors/companies/recent', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    
    if (dbConnected) {
      // Fetch most recent companies from MongoDB
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
      // Mock recent companies based on lastVisit date (fallback)
      const mockCompanies = [
        {
          id: 'company_1',
          name: 'Tech Solutions Inc',
          domain: 'techsolutions.com',
          industry: 'Technology',
          size: '51-200',
          location: {
            city: 'San Francisco',
            country: 'United States'
          },
          lastVisit: new Date(Date.now() - 60000), // 1 minute ago
          totalVisits: 5,
          score: 85,
          status: 'hot',
          tags: ['High Engagement', 'Has Email'],
          phone: '+1 (415) 555-1234',
          email: 'contact@techsolutions.com',
          website: 'www.techsolutions.com'
        },
        {
          id: 'company_2',
          name: 'Digital Marketing Pro',
          domain: 'digitalmarketing.se',
          industry: 'Marketing',
          size: '11-50',
          location: {
            city: 'Stockholm',
            country: 'Sweden'
          },
          lastVisit: new Date(Date.now() - 120000), // 2 minutes ago
          totalVisits: 3,
          score: 72,
          status: 'warm',
          tags: ['Has Phone', 'Social Media'],
          phone: '+46 8 123 456 78',
          email: 'info@digitalmarketing.se',
          website: 'www.digitalmarketing.se'
        },
        {
          id: 'company_3',
          name: 'E-commerce Solutions',
          domain: 'ecommerce.com',
          industry: 'Retail',
          size: '201-500',
          location: {
            city: 'London',
            country: 'United Kingdom'
          },
          lastVisit: new Date(Date.now() - 180000), // 3 minutes ago
          totalVisits: 8,
          score: 90,
          status: 'hot',
          tags: ['Enterprise', 'High Value'],
          phone: '+44 20 7946 0958',
          email: 'sales@ecommerce.com',
          website: 'www.ecommerce.com'
        }
      ];
      
      // Sort by lastVisit and limit results
      const recentCompanies = mockCompanies
        .sort((a, b) => b.lastVisit.getTime() - a.lastVisit.getTime())
        .slice(0, limit);
      
      res.json(recentCompanies);
    }
  } catch (error) {
    console.error('Recent visitors error:', error);
    res.status(500).json({ error: 'Failed to get recent visitors' });
  }
});

app.get('/api/visitors/companies/hot', async (req, res) => {
  try {
    if (dbConnected) {
      // Fetch hot companies from MongoDB
      const hotCompanies = await Company.find({ 
        status: 'hot',
        score: { $gte: 70 }  // Additional filter for high-scoring companies
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
      // Mock hot leads (companies with status 'hot')
      const hotCompanies = [
        {
          id: 'company_1',
          name: 'Tech Solutions Inc',
          domain: 'techsolutions.com',
          industry: 'Technology',
          size: '51-200',
          location: {
            city: 'San Francisco',
            country: 'United States'
          },
          lastVisit: new Date(Date.now() - 60000),
          totalVisits: 5,
          score: 85,
          status: 'hot',
          tags: ['High Engagement', 'Has Email'],
          phone: '+1 (415) 555-1234',
          email: 'contact@techsolutions.com',
          website: 'www.techsolutions.com'
        },
        {
          id: 'company_3',
          name: 'E-commerce Solutions',
          domain: 'ecommerce.com',
          industry: 'Retail',
          size: '201-500',
          location: {
            city: 'London',
            country: 'United Kingdom'
          },
          lastVisit: new Date(Date.now() - 180000),
          totalVisits: 8,
          score: 90,
          status: 'hot',
          tags: ['Enterprise', 'High Value'],
          phone: '+44 20 7946 0958',
          email: 'sales@ecommerce.com',
          website: 'www.ecommerce.com'
        },
        {
          id: 'company_4',
          name: 'FinTech Innovators',
          domain: 'fintech.io',
          industry: 'Financial Services',
          size: '101-200',
          location: {
            city: 'New York',
            country: 'United States'
          },
          lastVisit: new Date(Date.now() - 300000),
          totalVisits: 12,
          score: 95,
          status: 'hot',
          tags: ['High Score', 'Multiple Visits', 'Has Contact Info'],
          phone: '+1 (212) 555-8765',
          email: 'info@fintech.io',
          website: 'https://fintech.io'
        }
      ];
      
      res.json(hotCompanies);
    }
  } catch (error) {
    console.error('Hot leads error:', error);
    res.status(500).json({ error: 'Failed to get hot leads' });
  }
});

// Add new endpoint for filtered companies
app.get('/api/companies/filtered', async (req, res) => {
  console.log('🔍 Filtered companies endpoint called with query:', req.query);
  console.log('📌 Request URL:', req.originalUrl);
  console.log('📌 Request path:', req.path);
  console.log('📌 Request method:', req.method);
  try {
    // Parse query parameters
    const { status, industry, search, sortBy, limit = 20 } = req.query;
    
    if (dbConnected) {
      // Build MongoDB query based on filters
      const query = {};
      
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
        const searchRegex = new RegExp(search, 'i');
        query.$or = [
          { name: searchRegex },
          { domain: searchRegex },
          { email: searchRegex },
          { website: searchRegex }
        ];
      }
      
      // Determine sort order
      let sortOptions = {};
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
      const companies = await Company.find(query)
        .sort(sortOptions)
        .limit(parseInt(limit))
        .lean();
      
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
        website: company.website || `https://${company.domain}`      }));
      
      res.json(formattedCompanies);
    } else {
      // Fallback to in-memory filtering if database is not connected
      console.log('💾 Using in-memory data for filtering, companies length:', companies.length);
      console.log('💾 Companies data:', JSON.stringify(companies.slice(0, 2))); // Log first 2 companies
      
      let filteredCompanies = [...companies]; // Use the in-memory companies array
      
      // Apply filters
      if (status && status !== 'all') {
        console.log('🔎 Filtering by status:', status);
        filteredCompanies = filteredCompanies.filter(c => c.status === status);
        console.log('📊 After status filter, results:', filteredCompanies.length);
      }
      
      if (industry && industry !== 'all') {
        filteredCompanies = filteredCompanies.filter(c => c.industry === industry);
      }
      
      if (search) {
        const searchLower = search.toLowerCase();
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
      filteredCompanies = filteredCompanies.slice(0, parseInt(limit));
      
      res.json(filteredCompanies);
    }
  } catch (error) {
    console.error('Filtered companies error:', error);
    res.status(500).json({ error: 'Failed to get filtered companies' });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime() 
  });
});

// Test route to confirm API routing works
app.get('/api/test-endpoint', (req, res) => {
  console.log('Test endpoint accessed');
  res.json({
    success: true,
    message: 'API routing is working correctly',
    timestamp: new Date().toISOString()
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'Zector Digital CRM Backend Server',
    version: '1.0.0',
    endpoints: [
      'POST /track',
      'GET /api/visitors/realtime',
      'GET /api/visitors/sessions',
      'GET /api/companies/leads',
      'GET /health'
    ]
  });
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`🚀 Zector Digital CRM Backend Server running on port ${PORT}`);
  console.log(`📊 API endpoints available at http://localhost:${PORT}`);
  console.log(`❤️  Health check: http://localhost:${PORT}/health`);
  
  // List all registered routes for debugging
  console.log('📋 Registered API routes:');
  
  // Add direct test endpoint for debugging
  app.get('/api/test', (req, res) => {
    res.json({ message: 'Test endpoint working' });
  });
  
  // Manually list our API endpoints for clarity
  console.log('GET: /api/visitors/realtime');
  console.log('GET: /api/visitors/sessions');
  console.log('GET: /api/companies/leads');
  console.log('GET: /api/visitors/companies');
  console.log('GET: /api/visitors/companies/recent');
  console.log('GET: /api/visitors/companies/hot');
  console.log('GET: /api/companies/filtered');
  console.log('GET: /api/test');
});

module.exports = app;
