// Backend Tracking Endpoint - Handle incoming visitor data
// This would typically be implemented in your backend (Node.js/Express, Python/Django, etc.)

import express from 'express';
import cors from 'cors';
import { realVisitorTrackingService } from '../services/realVisitorTrackingService';

const app = express();

app.use(cors());
app.use(express.json());

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
    const visitors = await realVisitorTrackingService.getRealTimeVisitors();
    res.json(visitors);
  } catch (error) {
    console.error('Real-time visitors error:', error);
    res.status(500).json({ error: 'Failed to get real-time visitors' });
  }
});

app.get('/api/visitors/sessions', async (req, res) => {
  try {
    const { from, to, domain, hasCompanyInfo } = req.query;
    
    // const filters: any = {};
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
    const { minConfidence, industry, size, hasContactInfo } = req.query;
    
    // const filters: any = {};
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
    res.json(companies);
  } catch (error) {
    console.error('Company leads error:', error);
    res.status(500).json({ error: 'Failed to get company leads' });
  }
});

// API endpoints for companies (Lead Tracking)
app.get('/api/visitors/companies', async (req, res) => {
  try {
    const { minConfidence, industry, status } = req.query;
    
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
  } catch (error) {
    console.error('Company leads error:', error);
    res.status(500).json({ error: 'Failed to get companies' });
  }
});

app.get('/api/visitors/companies/enriched', async (req, res) => {
  try {
    const { minConfidence, industry, status } = req.query;
    
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
  } catch (error) {
    console.error('Enriched companies error:', error);
    res.status(500).json({ error: 'Failed to get enriched companies' });
  }
});

app.get('/api/visitors/companies/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const companies = await realVisitorTrackingService.getCompanyLeads();
    const company = companies.find(c => c.id === id);
    
    if (!company) {
      return res.status(404).json({ error: 'Company not found' });
    }
    
    res.json(company);
  } catch (error) {
    console.error('Get company error:', error);
    res.status(500).json({ error: 'Failed to get company' });
  }
});

app.get('/api/visitors/companies/recent', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;
    let companies = await realVisitorTrackingService.getCompanyLeads();
    companies = companies.sort((a, b) => b.lastVisit.getTime() - a.lastVisit.getTime()).slice(0, limit);
    res.json(companies);
  } catch (error) {
    console.error('Recent visitors error:', error);
    res.status(500).json({ error: 'Failed to get recent visitors' });
  }
});

app.get('/api/visitors/companies/hot', async (req, res) => {
  try {
    let companies = await realVisitorTrackingService.getCompanyLeads();
    companies = companies.filter(c => c.status === 'hot');
    res.json(companies);
  } catch (error) {
    console.error('Hot leads error:', error);
    res.status(500).json({ error: 'Failed to get hot leads' });
  }
});

// API endpoints for companies (Lead Tracking)
app.get('/api/companies/filtered', async (req, res) => {
  try {
    // Parse query parameters
    const { status, industry, search, sortBy, limit = 20 } = req.query;
    
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
  } catch (error) {
    console.error('Filtered companies error:', error);
    res.status(500).json({ error: 'Failed to get filtered companies' });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
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
