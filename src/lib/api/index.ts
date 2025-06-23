// Consolidated API exports - replaces the large api.ts file
export { apiRequest, API_BASE, ApiError } from './base';
export { companiesApi, type CompanyFilters, type CompanyApiResponse } from './companies';
export { trackingApi, type TrackingData, type TrackingResponse } from './tracking';

// Legacy exports for backward compatibility
import { companiesApi } from './companies';
import { trackingApi } from './tracking';

// Mock data as fallback if API fails
const fallbackCompanies = [
  {
    id: '1',
    name: 'Example Company',
    domain: 'example.com',
    industry: 'Technology',
    size: '11-50',
    location: { city: 'Stockholm', country: 'Sweden' },
    lastVisit: new Date(),
    totalVisits: 15,
    score: 85,
    status: 'hot',
    tags: ['Website Visitor', 'High Engagement'],
    phone: '+46 8 123 456',
    email: 'contact@example.com',
    website: 'https://example.com'
  }
];

// Enhanced API functions with enrichment (simplified)
export const leadsApi = {
  getCompanies: companiesApi.getCompanies,
  getCompany: companiesApi.getCompany,
  
  // Get enriched company data with platform information
  getEnrichedCompanies: async (filters?: any) => {
    try {
      const companies = await companiesApi.getCompanies(filters);
      
      // Convert companies to enriched format with mock platform data
      return companies.map(company => ({
        company,
        enrichmentScore: 0.8,
        confidence: 0.85,
        lastEnriched: new Date().toISOString(),
        platformData: {
          linkedin: {
            verified: true,
            employees: Math.floor(Math.random() * 500) + 10,
            lastSync: new Date().toISOString()
          },
          apollo: {
            contactsFound: Math.floor(Math.random() * 50) + 5,
            lastSync: new Date().toISOString()
          }
        },
        additionalData: {
          description: `${company.name} is a leading company in the ${company.industry} sector.`,
          websiteTraffic: Math.floor(Math.random() * 10000) + 1000,
          techStack: ['React', 'Node.js', 'MongoDB']
        }
      }));
    } catch (error) {
      console.error('Failed to get enriched companies:', error);
      return [];
    }
  },

  // Get enrichment summary
  getEnrichmentSummary: async () => {
    try {
      const companies = await companiesApi.getCompanies();
      const enrichedCount = companies.filter(c => c.score && c.score > 60).length;
      const averageScore = companies.length > 0 
        ? companies.reduce((sum, c) => sum + (c.score || 0), 0) / companies.length 
        : 0;
      
      return {
        totalCompanies: companies.length,
        enrichedCompanies: enrichedCount,
        averageScore: Math.round(averageScore * 10) / 10
      };
    } catch (error) {
      console.error('Failed to get enrichment summary:', error);
      return {
        totalCompanies: 0,
        enrichedCompanies: 0,
        averageScore: 0
      };
    }
  },

  // Find new leads (mock implementation)
  findNewLeads: async () => {
    await new Promise(resolve => setTimeout(resolve, 800));
    try {
      // Mock: return a few sample new leads
      return fallbackCompanies.slice(0, Math.floor(Math.random() * 3));
    } catch (error) {
      console.error('Failed to find new leads:', error);
      return [];
    }
  },

  // Get analytics (mock implementation)
  getAnalytics: async () => {
    await new Promise(resolve => setTimeout(resolve, 400));
    
    return {
      totalVisitors: 342,
      newCompanies: 28,
      returningCompanies: 67,
      hotLeads: 15,
      topPages: [
        { url: '/pricing', title: 'Pricing Plans', visits: 156, uniqueCompanies: 89 },
        { url: '/features', title: 'Features Overview', visits: 134, uniqueCompanies: 76 },
        { url: '/contact', title: 'Contact Us', visits: 98, uniqueCompanies: 54 }
      ],
      trafficSources: [
        { source: 'Google Search', visits: 142, percentage: 41.5 },
        { source: 'Direct', visits: 89, percentage: 26.0 },
        { source: 'LinkedIn', visits: 67, percentage: 19.6 }
      ],
      industryBreakdown: [
        { industry: 'Technology', count: 89, percentage: 26.0 },
        { industry: 'Manufacturing', count: 67, percentage: 19.6 },
        { industry: 'Financial Services', count: 54, percentage: 15.8 }
      ]
    };
  },

  // Tracking functions
  track: trackingApi.track,
  getDatabaseStatus: trackingApi.getDatabaseStatus
};
