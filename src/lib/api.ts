import { Company, Visit, Analytics, TrackingScript, Customer } from '@/types/leads';
import { dataEnrichmentService, EnrichedLeadData } from '@/services/dataEnrichmentService';
import { platformSyncService } from '@/services/platformSyncService';
import { realTimeLeadDiscoveryService } from '@/services/realTimeLeadDiscoveryService';
import { realVisitorTrackingService, RealTimeVisitor, VisitorSession } from '@/services/realVisitorTrackingService';
import { PlatformType } from '@/types/integrations';

// Configuration for using real data
const useRealData = process.env.VITE_USE_REAL_DATA === 'true';

// Initialize real-time discovery service
if (typeof window !== 'undefined') {
  // Start discovery service in browser environment
  const config = realTimeLeadDiscoveryService.getConfig();
  if (config.enableRealTimeDiscovery) {
    realTimeLeadDiscoveryService.start();
  }
}

// Mock data för företag
const mockCompanies: Company[] = [
  {
    id: '1',
    name: 'Volvo Group',
    domain: 'volvo.com',
    industry: 'Automotive',
    size: '10,000+',
    location: { city: 'Göteborg', country: 'Sweden' },
    lastVisit: new Date('2025-06-09T10:30:00'),
    totalVisits: 12,
    score: 95,
    status: 'hot',
    tags: ['Enterprise', 'B2B', 'Manufacturing']
  },
  {
    id: '2',
    name: 'Spotify Technology',
    domain: 'spotify.com',
    industry: 'Technology',
    size: '5,000-10,000',
    location: { city: 'Stockholm', country: 'Sweden' },
    lastVisit: new Date('2025-06-09T09:15:00'),
    totalVisits: 8,
    score: 78,
    status: 'warm',
    tags: ['Tech', 'Media', 'B2C']
  },
  {
    id: '3',
    name: 'IKEA Group',
    domain: 'ikea.com',
    industry: 'Retail',
    size: '10,000+',
    location: { city: 'Malmö', country: 'Sweden' },
    lastVisit: new Date('2025-06-09T08:45:00'),
    totalVisits: 5,
    score: 62,
    status: 'warm',
    tags: ['Retail', 'Global', 'B2C']
  },
  {
    id: '4',
    name: 'Klarna Bank',
    domain: 'klarna.com',
    industry: 'Financial Services',
    size: '1,000-5,000',
    location: { city: 'Stockholm', country: 'Sweden' },
    lastVisit: new Date('2025-06-09T07:20:00'),
    totalVisits: 15,
    score: 88,
    status: 'hot',
    tags: ['Fintech', 'B2B', 'SaaS']
  },
  {
    id: '5',
    name: 'H&M Group',
    domain: 'hm.com',
    industry: 'Fashion',
    size: '10,000+',
    location: { city: 'Stockholm', country: 'Sweden' },
    lastVisit: new Date('2025-06-08T16:30:00'),
    totalVisits: 3,
    score: 45,
    status: 'cold',
    tags: ['Fashion', 'Retail', 'B2C']
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

// Enhanced API functions with platform integration
export const leadsApi = {
  // Get all companies with filtering and enrichment
  getCompanies: async (filters?: {
    status?: string;
    industry?: string;
    minScore?: number;
    enriched?: boolean;
  }): Promise<Company[]> => {
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API delay
    
    let filtered = [...mockCompanies];
    
    // Apply traditional filters
    if (filters?.status) {
      filtered = filtered.filter(c => c.status === filters.status);
    }
    if (filters?.industry) {
      filtered = filtered.filter(c => c.industry === filters.industry);    }
    if (filters?.minScore) {
      filtered = filtered.filter(c => c.score >= filters.minScore);
    }
    
    // Apply platform enrichment if requested
    if (filters?.enriched) {
      try {
        const enrichedData = await dataEnrichmentService.enrichCompanies(filtered);
        filtered = enrichedData.map(e => e.company);
      } catch (error) {
        console.error('Failed to enrich companies:', error);
        // Continue with non-enriched data
      }
    }
    
    return filtered.sort((a, b) => b.lastVisit.getTime() - a.lastVisit.getTime());
  },

  // Get enriched company data with platform information
  getEnrichedCompanies: async (filters?: {
    status?: string;
    industry?: string;
    minScore?: number;
  }): Promise<EnrichedLeadData[]> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    let filtered = [...mockCompanies];
    
    if (filters?.status) {
      filtered = filtered.filter(c => c.status === filters.status);
    }
    if (filters?.industry) {
      filtered = filtered.filter(c => c.industry === filters.industry);
    }
    if (filters?.minScore) {
      filtered = filtered.filter(c => c.score >= filters.minScore);
    }
    
    // Enrich companies with platform data
    const enrichedData = await dataEnrichmentService.enrichCompanies(filtered);
    return enrichedData.sort((a, b) => b.company.lastVisit.getTime() - a.company.lastVisit.getTime());
  },

  // Get a specific company
  getCompany: async (id: string): Promise<Company | null> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockCompanies.find(c => c.id === id) || null;
  },

  // Get enriched company data
  getEnrichedCompany: async (id: string): Promise<EnrichedLeadData | null> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const company = mockCompanies.find(c => c.id === id);
    if (!company) return null;
    
    return await dataEnrichmentService.enrichCompany(company);
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
      const enrichedData = await dataEnrichmentService.enrichCompanies(mockCompanies);
      return dataEnrichmentService.getEnrichmentSummary(enrichedData);
    } catch (error) {
      console.error('Failed to get enrichment summary:', error);
      return {
        totalCompanies: mockCompanies.length,
        enrichedCompanies: 0,
        platformCoverage: {} as Record<PlatformType, number>,
        averageScore: 0
      };
    }
  },

  // Get recent visitors with enrichment
  getRecentVisitors: async (limit: number = 10): Promise<Company[]> => {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const recent = mockCompanies
      .sort((a, b) => b.lastVisit.getTime() - a.lastVisit.getTime())
      .slice(0, limit);
    
    // Try to enrich recent visitors for better insights
    try {
      const enrichedData = await dataEnrichmentService.enrichCompanies(recent);
      return enrichedData.map(e => e.company);
    } catch (error) {
      console.error('Failed to enrich recent visitors:', error);
      return recent;
    }
  },

  // Get hot leads with enrichment
  getHotLeads: async (): Promise<Company[]> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const hotLeads = mockCompanies.filter(c => c.status === 'hot');
    
    // Enrich hot leads for better qualification
    try {
      const enrichedData = await dataEnrichmentService.enrichCompanies(hotLeads);
      return enrichedData.map(e => e.company);
    } catch (error) {
      console.error('Failed to enrich hot leads:', error);
      return hotLeads;
    }
  },

  // Exportera data
  exportCompanies: async (format: 'csv' | 'excel' = 'csv'): Promise<Blob> => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const headers = ['Company Name', 'Domain', 'Industry', 'Location', 'Score', 'Status', 'Last Visit'];
    const rows = mockCompanies.map(c => [
      c.name,
      c.domain,
      c.industry,
      `${c.location.city}, ${c.location.country}`,
      c.score.toString(),
      c.status,
      c.lastVisit.toLocaleDateString('sv-SE')
    ]);
    
    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');
    
    return new Blob([csvContent], { type: 'text/csv' });
  },

  // Real data methods using visitor tracking service
  async getRealTimeVisitors(): Promise<any[]> {
    if (useRealData) {
      try {
        return await realVisitorTrackingService.getRealTimeVisitors();
      } catch (error) {
        console.error('Failed to get real-time visitors:', error);
      }
    }
    
    // Return mock real-time visitors
    return [
      {
        sessionId: 'session_1',
        ip: '192.168.1.100',
        currentPage: '/pricing',
        startTime: new Date(Date.now() - 300000), // 5 minutes ago
        lastActivity: new Date(Date.now() - 30000), // 30 seconds ago
        pageViews: 3,
        isActive: true,
        companyInfo: {
          name: 'TechCorp Solutions',
          domain: 'techcorp.com',
          industry: 'Technology',
          confidence: 0.85
        }
      },
      {
        sessionId: 'session_2',
        ip: '10.0.0.50',
        currentPage: '/features',
        startTime: new Date(Date.now() - 120000), // 2 minutes ago
        lastActivity: new Date(Date.now() - 10000), // 10 seconds ago
        pageViews: 2,
        isActive: true,
        companyInfo: {
          name: 'Digital Marketing Pro',
          domain: 'digitalmarketing.se',
          industry: 'Marketing',
          email: 'info@digitalmarketing.se',
          confidence: 0.92
        }
      }
    ];
  },

  async getVisitorSessions(filters?: {
    from?: Date;
    to?: Date;
    domain?: string;
    hasCompanyInfo?: boolean;
  }): Promise<any[]> {
    if (useRealData) {
      try {
        return await realVisitorTrackingService.getVisitorSessions(filters);
      } catch (error) {
        console.error('Failed to get visitor sessions:', error);
      }
    }
    
    // Return mock session data
    return [];
  },
};

// Enhanced live updates with platform sync awareness
export const subscribeToLiveUpdates = (callback: (company: Company) => void) => {
  const interval = setInterval(async () => {
    // Simulate new visitor or platform sync update
    const randomCompany = mockCompanies[Math.floor(Math.random() * mockCompanies.length)];
    
    try {
      // Try to get enriched data for the update
      const enrichedData = await dataEnrichmentService.enrichCompany(randomCompany);
      const updatedCompany = {
        ...enrichedData.company,
        lastVisit: new Date(),
        totalVisits: enrichedData.company.totalVisits + 1
      };
      callback(updatedCompany);
    } catch (error) {
      // Fallback to regular update if enrichment fails
      const updatedCompany = {
        ...randomCompany,
        lastVisit: new Date(),
        totalVisits: randomCompany.totalVisits + 1
      };
      callback(updatedCompany);
    }
  }, 10000); // New update every 10 seconds

  return () => clearInterval(interval);
};
