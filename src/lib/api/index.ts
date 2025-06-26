// Consolidated API exports - replaces the large api.ts file
export { apiRequest, API_BASE, ApiError } from './base';
export { companiesApi, type CompanyFilters, type CompanyApiResponse } from './companies';
export { trackingApi, type TrackingData, type TrackingResponse } from './tracking';

// Legacy exports for backward compatibility
import { companiesApi } from './companies';
import { trackingApi } from './tracking';
import { apiRequest } from './base';

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
        averageScore: Math.round(averageScore * 10) / 10,
        platformCoverage: {
          'linkedin': Math.floor(Math.random() * companies.length),
          'apollo': Math.floor(Math.random() * companies.length),
          'hunter': Math.floor(Math.random() * companies.length),
          'hubspot': Math.floor(Math.random() * companies.length)
        }
      };
    } catch (error) {
      console.error('Failed to get enrichment summary:', error);
      return {
        totalCompanies: 0,
        enrichedCompanies: 0,
        averageScore: 0,
        platformCoverage: {}
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
  getDatabaseStatus: trackingApi.getDatabaseStatus,  // Get recent visitors
  getRecentVisitors: async (limit = 15) => {
    try {
      console.log(`Fetching recent visitors (limit: ${limit})...`);
      // Only use the visitors endpoint, do not fallback to companies API
      const response = await apiRequest(`/api/visitors?limit=${limit}`) as any;
      if (response.success && response.visitors) {
        console.log(`Successfully loaded ${response.visitors.length} visitors from visitors API`);
        return response.visitors;
      } else {
        console.warn('Invalid visitors response:', response);
        return [];
      }
    } catch (error) {
      console.error('Failed to fetch recent visitors:', error);
      // Return empty array on error instead of throwing
      return [];
    }
  },
  // Platform sync functions
  getPlatformSyncStatus: async () => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return {
      totalPlatforms: 4,
      activeSyncs: 2,
      lastSyncTime: new Date(),
      nextSyncTime: new Date(Date.now() + 3600000),
      recentJobs: [
        {
          success: true,
          jobId: 'job-001',
          platformType: 'linkedin' as any,
          startTime: new Date(Date.now() - 300000),
          endTime: new Date(Date.now() - 240000),
          recordsProcessed: 45,
          status: 'completed'
        },
        {
          success: true,
          jobId: 'job-002',
          platformType: 'apollo' as any,
          startTime: new Date(Date.now() - 600000),
          endTime: new Date(Date.now() - 480000),
          recordsProcessed: 32,
          status: 'completed'
        },
        {
          success: false,
          jobId: 'job-003',
          platformType: 'hunter' as any,
          startTime: new Date(Date.now() - 900000),
          endTime: new Date(Date.now() - 870000),
          recordsProcessed: 0,
          status: 'failed'
        }
      ]
    };
  },

  syncPlatform: async (platform: string) => {
    await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate sync time
    return {
      success: true,
      platform,
      syncedRecords: Math.floor(Math.random() * 50) + 10,
      timestamp: new Date().toISOString(),
      message: `Successfully synced with ${platform}`
    };
  },

  getFilteredCompanies: async (filters: any) => {
    const companies = await companiesApi.getCompanies(filters);
    return companies;
  },

  // Get visits for a specific company
  getVisits: async (companyId?: string, filters?: any) => {
    try {
      const tenantId = localStorage.getItem('tenantId') || 'default-tenant';
      const params = new URLSearchParams();
      
      if (companyId) {
        params.append('companyId', companyId);
      }
      if (filters?.domain) {
        params.append('domain', filters.domain);
      }
      if (filters?.startDate) {
        params.append('startDate', filters.startDate);
      }
      if (filters?.endDate) {
        params.append('endDate', filters.endDate);
      }
      if (filters?.limit) {
        params.append('limit', filters.limit.toString());
      }
      if (filters?.skip) {
        params.append('skip', filters.skip.toString());
      }

      const response = await apiRequest(`/api/visits?${params.toString()}`, {
        headers: {
          'X-Tenant-ID': tenantId
        }        }) as any;

        if (response?.success) {
          return response.visits || [];
        } else {
        console.warn('Failed to fetch visits:', response?.error);
        return [];
      }
    } catch (error) {
      console.error('Error fetching visits:', error);
      return [];
    }
  }
};
