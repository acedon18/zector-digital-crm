import { Company, Visit, Analytics, TrackingScript, Customer } from '@/types/leads';
import { dataEnrichmentService, EnrichedLeadData } from '@/services/dataEnrichmentService';
import { platformSyncService } from '@/services/platformSyncService';
import { realTimeLeadDiscoveryService } from '@/services/realTimeLeadDiscoveryService';
import { realVisitorTrackingService, RealTimeVisitor, VisitorSession } from '@/services/realVisitorTrackingService';
import { PlatformType } from '@/types/integrations';

// Configuration for using real data
const useRealData = import.meta.env.VITE_USE_REAL_DATA === 'true';

// Initialize real-time discovery service
if (typeof window !== 'undefined') {
  // Start discovery service in browser environment
  const config = realTimeLeadDiscoveryService.getConfig();
  if (config.enableRealTimeDiscovery) {
    realTimeLeadDiscoveryService.start();
  }
}

// Mock data as fallback if API fails
const fallbackCompanies: Company[] = [
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

// Mock data för analytics
const mockAnalytics: Analytics = {
  totalVisitors: 342,
  newCompanies: 28,
  returningCompanies: 67,
  hotLeads: 15,
  topPages: [
    { url: '/pricing', title: 'Pricing Plans', visits: 156, uniqueCompanies: 89 },
    { url: '/features', title: 'Features Overview', visits: 134, uniqueCompanies: 76 },
    { url: '/contact', title: 'Contact Us', visits: 98, uniqueCompanies: 54 },
    { url: '/case-studies', title: 'Case Studies', visits: 87, uniqueCompanies: 43 },
    { url: '/demo', title: 'Book a Demo', visits: 76, uniqueCompanies: 38 }
  ],
  trafficSources: [
    { source: 'Google Search', visits: 142, percentage: 41.5 },
    { source: 'Direct', visits: 89, percentage: 26.0 },
    { source: 'LinkedIn', visits: 67, percentage: 19.6 },
    { source: 'Facebook', visits: 31, percentage: 9.1 },
    { source: 'Other', visits: 13, percentage: 3.8 }
  ],
  industryBreakdown: [
    { industry: 'Technology', count: 89, percentage: 26.0 },
    { industry: 'Manufacturing', count: 67, percentage: 19.6 },
    { industry: 'Financial Services', count: 54, percentage: 15.8 },
    { industry: 'Retail', count: 43, percentage: 12.6 },
    { industry: 'Healthcare', count: 38, percentage: 11.1 },
    { industry: 'Other', count: 51, percentage: 14.9 }
  ]
};

const API_BASE = typeof window !== 'undefined' ? window.location.origin : 'https://zector-digital-crm-leads.vercel.app';

// Enhanced API functions with platform integration
export const leadsApi = {  // Get all companies with filtering and enrichment
  getCompanies: async (filters?: {
    status?: string;
    industry?: string;
    minScore?: number;
    enriched?: boolean;
  }): Promise<Company[]> => {
    try {
      const params = new URLSearchParams();
      if (filters?.minScore) params.append('minScore', filters.minScore.toString());
      if (filters?.industry) params.append('industry', filters.industry);
      if (filters?.status) params.append('status', filters.status);
      
      console.log('Fetching companies from API:', `${API_BASE}/api/companies?${params}`);
      
      const res = await fetch(`${API_BASE}/api/companies?${params}`);
      console.log('API Response status:', res.status);
      console.log('API Response headers:', res.headers.get('content-type'));
      
      if (!res.ok) {
        console.error(`API call failed with status ${res.status}: ${res.statusText}`);
        const errorText = await res.text();
        console.error('Error response body:', errorText);
        throw new Error(`API call failed: ${res.status} ${res.statusText}`);
      }
      
      const text = await res.text();
      console.log('API Response text (first 200 chars):', text.substring(0, 200));
      
      // Check if response looks like HTML instead of JSON
      if (text.trim().startsWith('<')) {
        console.error('API returned HTML instead of JSON - likely a server error');
        console.log('Full HTML response:', text);
        throw new Error('API returned HTML instead of JSON');
      }
      
      try {
        const data = JSON.parse(text);
        console.log('Parsed JSON data:', data);
        
        if (data.success && Array.isArray(data.companies)) {
          console.log(`Found ${data.companies.length} companies from API`);
          return data.companies.filter((company: Company) => {
            if (filters?.status && company.status !== filters.status) return false;
            if (filters?.industry && company.industry !== filters.industry) return false;
            if (filters?.minScore && company.score && company.score < filters.minScore) return false;
            return true;
          });
        }
        
        console.warn('API response format unexpected:', data);
        return [];
      } catch (parseError) {
        console.error('Failed to parse JSON response:', parseError, text);        throw new Error(`Failed to parse API response: ${parseError instanceof Error ? parseError.message : 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Failed to fetch companies:', error);
      throw error; // Re-throw instead of falling back
    }
  },

  // Get enriched company data with platform information
  getEnrichedCompanies: async (filters?: {
    status?: string;
    industry?: string;
    minScore?: number;
  }): Promise<EnrichedLeadData[]> => {
    const params = new URLSearchParams();
    if (filters?.minScore) params.append('minConfidence', filters.minScore.toString());
    if (filters?.industry) params.append('industry', filters.industry);
    if (filters?.status) params.append('status', filters.status);
    const res = await fetch(`${API_BASE}/api/visitors/companies/enriched?${params}`);
    return await res.json();
  },

  // Get a specific company
  getCompany: async (id: string): Promise<Company | null> => {
    const res = await fetch(`${API_BASE}/api/visitors/companies/${id}`);
    if (!res.ok) return null;
    return await res.json();
  },

  // Get enriched company data
  getEnrichedCompany: async (id: string): Promise<EnrichedLeadData | null> => {
    const res = await fetch(`${API_BASE}/api/visitors/companies/${id}/enriched`);
    if (!res.ok) return null;
    return await res.json();
  },

  // Get analytics data with platform enhancement
  getAnalytics: async (timeRange?: string): Promise<Analytics> => {
    await new Promise(resolve => setTimeout(resolve, 400));
    
    // Enhance analytics with platform data if available
    const baseAnalytics = { ...mockAnalytics };
    
    try {
      // Get platform sync summary for additional insights
      const syncSummary = platformSyncService.getSyncSummary();
      
      if (syncSummary.activeSyncs > 0) {
        // Enhance analytics with platform data
        baseAnalytics.totalVisitors += Math.floor(Math.random() * 100) + 50;
        baseAnalytics.newCompanies += Math.floor(Math.random() * 10) + 5;
        
        // Add platform-specific traffic sources
        const platformSources = [
          { source: 'Google Ads', visits: Math.floor(Math.random() * 50) + 20, percentage: 0 },
          { source: 'Meta Ads', visits: Math.floor(Math.random() * 40) + 15, percentage: 0 },
          { source: 'TikTok Ads', visits: Math.floor(Math.random() * 30) + 10, percentage: 0 }
        ];
        
        // Recalculate percentages
        const totalVisits = baseAnalytics.trafficSources.reduce((sum, s) => sum + s.visits, 0) +
                          platformSources.reduce((sum, s) => sum + s.visits, 0);
        
        baseAnalytics.trafficSources = [
          ...baseAnalytics.trafficSources.map(s => ({
            ...s,
            percentage: (s.visits / totalVisits) * 100
          })),
          ...platformSources.map(s => ({
            ...s,
            percentage: (s.visits / totalVisits) * 100
          }))
        ];
      }
    } catch (error) {
      console.error('Failed to enhance analytics with platform data:', error);
    }
    
    return baseAnalytics;
  },
  // Platform integration functions
  
  // Trigger manual sync for a platform
  syncPlatform: async (platformType: PlatformType): Promise<{ success: boolean; jobId: string; message: string }> => {
    try {
      const result = await platformSyncService.syncPlatform(platformType);
      return {
        success: result.success,
        jobId: result.jobId,
        message: result.success ? 'Sync completed successfully' : 'Sync failed'
      };
    } catch (error) {
      return {
        success: false,
        jobId: '',
        message: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  },

  // Get sync status for platforms
  getPlatformSyncStatus: async (): Promise<{
    totalPlatforms: number;
    activeSyncs: number;
    lastSyncTime?: Date;
    nextSyncTime?: Date;    recentJobs: Array<{
      success: boolean;
      jobId: string;
      platformType: PlatformType;
      startTime: Date;
      endTime?: Date;
      recordsProcessed: number;
      status: string;
    }>;
  }> => {
    await new Promise(resolve => setTimeout(resolve, 100));
    return platformSyncService.getSyncSummary();
  },

  // Find new leads from connected platforms
  findNewLeads: async (): Promise<Company[]> => {
    await new Promise(resolve => setTimeout(resolve, 800));
    try {
      return await dataEnrichmentService.findNewLeads();
    } catch (error) {
      console.error('Failed to find new leads:', error);
      return [];
    }
  },

  // Get enrichment summary
  getEnrichmentSummary: async (): Promise<{
    totalCompanies: number;
    enrichedCompanies: number;
    platformCoverage: Record<PlatformType, number>;
    averageScore: number;
  }> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    try {
      const enrichedData = await dataEnrichmentService.enrichCompanies(fallbackCompanies);
      return dataEnrichmentService.getEnrichmentSummary(enrichedData);
    } catch (error) {
      console.error('Failed to get enrichment summary:', error);
      return {
        totalCompanies: fallbackCompanies.length,
        enrichedCompanies: 0,
        platformCoverage: {} as Record<PlatformType, number>,
        averageScore: 0
      };
    }
  },  // Get recent visitors with enrichment
  getRecentVisitors: async (limit: number = 10): Promise<Company[]> => {
    try {
      const res = await fetch(`${API_BASE}/api/companies`);
      
      if (!res.ok) {
        console.warn(`Companies API failed with status ${res.status}`);
        return [];
      }
      
      const contentType = res.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        console.warn('Companies API returned non-JSON response');
        return [];
      }
      
      // Parse the response
      const data = await res.json();
      
      if (!data.success || !data.companies || !Array.isArray(data.companies)) {
        console.warn('Companies API returned invalid data structure');
        return [];
      }
      
      // Sort by lastVisit and take the most recent
      const sortedCompanies = data.companies
        .map((company: Company) => ({
          ...company,
          lastVisit: new Date(company.lastVisit || Date.now())
        }))
        .sort((a: Company, b: Company) => {
          const aTime = a.lastVisit ? a.lastVisit.getTime() : 0;
          const bTime = b.lastVisit ? b.lastVisit.getTime() : 0;
          return bTime - aTime;
        })
        .slice(0, limit);
      
      return sortedCompanies;
    } catch (error) {
      console.error('Failed to fetch recent visitors:', error);
      return [];
    }
  },
  // Get hot leads with enrichment
  getHotLeads: async (): Promise<Company[]> => {
    try {
      const res = await fetch(`${API_BASE}/api/visitors/companies/hot`);
      if (!res.ok) {
        console.warn('Hot leads API failed, falling back to mock data');
        throw new Error('API call failed');
      }
      
      // Parse the response
      const data = await res.json();
      
      // Convert date strings to Date objects
      return data.map((company: Omit<Company, 'lastVisit'> & { lastVisit: string | Date }) => ({
        ...company,
        lastVisit: new Date(company.lastVisit)
      }));
    } catch (error) {
      console.error('Failed to fetch hot leads:', error);
      // Return mock hot leads
      return fallbackCompanies.filter((c: Company) => c.status === 'hot');
    }
  },
  // Export data
  exportCompanies: async (format: 'csv' | 'excel' = 'csv'): Promise<Blob> => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Get current companies data
    const companies = await leadsApi.getCompanies();
    
    const headers = ['Company Name', 'Domain', 'Industry', 'Location', 'Score', 'Status', 'Last Visit'];
    const rows = companies.map(c => [
      c.name || 'Unknown',
      c.domain || 'Unknown',
      c.industry || 'Unknown',
      c.location ? `${c.location.city || 'Unknown'}, ${c.location.country || 'Unknown'}` : 'Unknown',
      (c.score || 0).toString(),
      c.status || 'Unknown',
      c.lastVisit ? new Date(c.lastVisit).toLocaleDateString('sv-SE') : 'Unknown'
    ]);
    
    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');
    
    return new Blob([csvContent], { type: 'text/csv' });
  },
  // Real data methods using visitor tracking service
  async getRealTimeVisitors(): Promise<RealTimeVisitor[]> {
    try {
      const res = await fetch(`${API_BASE}/api/visitors/realtime`);
      if (!res.ok) {
        console.warn('Real-time visitors API failed, falling back to mock data');
        throw new Error('API call failed');
      }
      return await res.json();    } catch (error) {
      console.error('Failed to get real-time visitors:', error);
      // Return empty array instead of mock data
      return [];
    }
  },

  async getVisitorSessions(filters?: {
    from?: Date;
    to?: Date;
    domain?: string;
    hasCompanyInfo?: boolean;
  }): Promise<VisitorSession[]> {
    try {
      const params = new URLSearchParams();
      if (filters?.from) params.append('from', filters.from.toISOString());
      if (filters?.to) params.append('to', filters.to.toISOString());
      if (filters?.domain) params.append('domain', filters.domain);
      if (filters?.hasCompanyInfo !== undefined) params.append('hasCompanyInfo', filters.hasCompanyInfo.toString());

      const res = await fetch(`${API_BASE}/api/visitors/sessions?${params}`);
      if (!res.ok) {
        console.warn('Visitor sessions API failed, falling back to mock data');
        throw new Error('API call failed');
      }
      return await res.json();
    } catch (error) {
      console.error('Failed to get visitor sessions:', error);
      // Return mock session data
      return [];
    }
  },

  // Get filtered companies with advanced filters
  getFilteredCompanies: async (filters?: {
    status?: string;
    industry?: string;
    search?: string;
    sortBy?: 'lastVisit' | 'score' | 'totalVisits';
    limit?: number;
  }): Promise<Company[]> => {
    try {
      const params = new URLSearchParams();
      if (filters?.status) params.append('status', filters.status);
      if (filters?.industry) params.append('industry', filters.industry);
      if (filters?.search) params.append('search', filters.search);
      if (filters?.sortBy) params.append('sortBy', filters.sortBy);
      if (filters?.limit) params.append('limit', filters.limit.toString());
      
      const res = await fetch(`${API_BASE}/api/companies/filtered?${params}`);
      if (!res.ok) {
        console.warn('Filtered companies API failed, falling back to mock data');
        throw new Error('API call failed');
      }
      
      // Parse the response and ensure dates are proper Date objects
      const data = await res.json();
      return data.map((company: Omit<Company, 'lastVisit'> & { lastVisit: string | Date }) => ({
        ...company,
        lastVisit: company.lastVisit instanceof Date ? 
                  company.lastVisit : 
                  new Date(company.lastVisit)
      }));
    } catch (error) {
      console.error('Failed to fetch filtered companies:', error);
      // Return filtered mock data
      let filteredCompanies = [...fallbackCompanies];
      
      if (filters?.status && filters.status !== 'all') {
        filteredCompanies = filteredCompanies.filter(c => c.status === filters.status);
      }
      
      if (filters?.industry && filters.industry !== 'all') {
        filteredCompanies = filteredCompanies.filter(c => c.industry === filters.industry);
      }
        if (filters?.search) {
        const searchLower = filters.search.toLowerCase();
        filteredCompanies = filteredCompanies.filter(c => 
          (c.name && c.name.toLowerCase().includes(searchLower)) || 
          (c.domain && c.domain.toLowerCase().includes(searchLower)) || 
          (c.email && c.email.toLowerCase().includes(searchLower)) || 
          (c.website && c.website.toLowerCase().includes(searchLower))
        );
      }
        switch (filters?.sortBy) {
        case 'score':
          filteredCompanies.sort((a, b) => (b.score || 0) - (a.score || 0));
          break;
        case 'totalVisits':
          filteredCompanies.sort((a, b) => (b.totalVisits || 0) - (a.totalVisits || 0));
          break;
        case 'lastVisit':
        default:
          filteredCompanies.sort((a, b) => {
            const bDate = b.lastVisit ? new Date(b.lastVisit).getTime() : 0;
            const aDate = a.lastVisit ? new Date(a.lastVisit).getTime() : 0;
            return bDate - aDate;
          });
      }
      
      if (filters?.limit) {
        filteredCompanies = filteredCompanies.slice(0, filters.limit);
      }
      
      return filteredCompanies;
    }
  },
};

// Enhanced live updates with platform sync awareness
export const subscribeToLiveUpdates = (callback: (company: Company) => void) => {
  const interval = setInterval(async () => {
    // Simulate new visitor or platform sync update
    const randomCompany = fallbackCompanies[Math.floor(Math.random() * fallbackCompanies.length)];    // Update company with new visit data
    const updatedCompany = {
      ...randomCompany,
      lastVisit: new Date(), // Always use a fresh Date object
      totalVisits: (randomCompany.totalVisits || 0) + 1
    };
    callback(updatedCompany);
  }, 10000); // New update every 10 seconds

  return () => clearInterval(interval);
};
