// Backend Tracking Endpoint - Handle incoming visitor data
// TypeScript implementation

import express, { Request, Response } from 'express';
import cors from 'cors';
import { realVisitorTrackingService } from '../services/realVisitorTrackingService';
import mongoose from 'mongoose';
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

// Setup middleware
app.use(cors());
app.use(express.json());

// MongoDB connection setup
const connectDB = async (): Promise<boolean> => {
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

// Global database connection flag
let dbConnected = false;

// Connect to MongoDB
connectDB().then(connected => {
  dbConnected = connected;
});

// Main tracking endpoint that receives data from your website
app.post('/track', (req: Request, res: Response) => {
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
    realVisitorTrackingService.processTrackingData(trackingData).then(() => {
      res.status(200).json({ 
        success: true, 
        message: 'Tracking data processed successfully' 
      });
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
app.get('/api/visitors/realtime', (req: Request, res: Response) => {
  if (dbConnected) {
    // Use MongoDB for real-time visitor data
    const cutoff = new Date(Date.now() - 30 * 60 * 1000); // Last 30 minutes
    Company.find({ lastVisit: { $gte: cutoff } })
      .sort({ lastVisit: -1 })
      .limit(50)
      .lean()
      .then((recentCompanies) => {
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
      })
      .catch((error) => {
        console.error('Real-time visitors error:', error);
        res.status(500).json({ error: 'Failed to get real-time visitors' });
      });
  } else {
    realVisitorTrackingService.getRealTimeVisitors()
      .then(visitors => {
        res.json(visitors);
      })
      .catch(error => {
        console.error('Real-time visitors error:', error);
        res.status(500).json({ error: 'Failed to get real-time visitors' });
      });
  }
});

// API endpoint for filtered companies
app.get('/api/companies/filtered', (req: Request, res: Response) => {
  console.log('🔍 [TypeScript] Filtered companies endpoint called with query:', req.query);
  
  try {
    // Parse query parameters
    const { status, industry, search, sortBy, limit = 20 } = req.query;
    
    if (dbConnected) {
      // Build MongoDB query based on filters
      const query: CompanyQuery = {};
      
      // Filter by status
      if (status && status !== 'all') {
        query.status = status as string;
      }
      
      // Filter by industry
      if (industry && industry !== 'all') {
        query.industry = industry as string;
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
      const sortOptions: SortOptions = {};
      switch (sortBy) {
        case 'score':
          sortOptions.score = -1;
          break;
        case 'totalVisits':
          sortOptions.totalVisits = -1;
          break;
        default:
          sortOptions.lastVisit = -1;
      }
      
      // Execute query with filtering, sorting, and limiting
      Company.find(query)
        .sort(sortOptions)
        .limit(parseInt(limit as string))
        .lean()
        .then((companies) => {
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
        })
        .catch((error) => {
          console.error('[TypeScript] MongoDB query error:', error);
          res.status(500).json({ error: 'Failed to query database' });
        });
    } else {
      // Start with all company leads
      realVisitorTrackingService.getCompanyLeads()
        .then(companies => {
          // Apply filters
          let filteredCompanies = [...companies];
          
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
        })
        .catch((error) => {
          console.error('[TypeScript] Filtering error:', error);
          res.status(500).json({ error: 'Failed to get filtered companies' });
        });
    }
  } catch (error) {
    console.error('[TypeScript] Filtered companies error:', error);
    res.status(500).json({ error: 'Failed to get filtered companies' });
  }
});

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    implementationType: 'TypeScript',
    databaseConnected: dbConnected
  });
});

// Try to start the server with port checking
const PORT = process.env.PORT || 3001;
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
