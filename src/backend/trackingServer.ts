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

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Tracking server running on port ${PORT}`);
});

export default app;
