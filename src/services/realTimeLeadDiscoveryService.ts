// Real-time Lead Discovery Service
import { Lead } from '../types/leads';

// Lead discovery sources
export type LeadSource = 'website' | 'social' | 'partner' | 'event' | 'referral';

// Lead discovery filters
export interface LeadDiscoveryFilters {
  industry?: string[];
  companySize?: string[];
  location?: string[];
  score?: number;
  source?: LeadSource[];
  fromDate?: string;
  toDate?: string;
}

/**
 * Discover new leads in real-time based on various signals
 * @param filters Optional filters to apply to lead discovery
 * @returns Promise with discovered leads
 */
export async function discoverLeads(filters?: LeadDiscoveryFilters): Promise<Lead[]> {
  try {
    console.log('Discovering leads with filters:', filters);
    
    // This would call the real lead discovery API in production
    // For now, use mock data
    const leads = await mockLeadDiscoveryCall(filters);
    
    console.log(`Discovered ${leads.length} leads`);
    return leads;
  } catch (error) {
    console.error('Error discovering leads:', error);
    throw new Error(`Lead discovery failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Score a lead based on various signals
 * @param lead The lead to score
 * @returns Scored lead with score field populated
 */
export function scoreLeadQuality(lead: Lead): Lead {
  // Simple scoring algorithm
  let score = 50; // Base score
  
  // Adjust based on available information
  if (lead.email) score += 10;
  if (lead.phone) score += 5;
  if (lead.companyName) score += 5;
  if (lead.industry) score += 5;
  if (lead.companySize) score += 3;
  if (lead.website) score += 2;
  if (lead.location) score += 2;
  
  // Adjust based on interaction signals
  if (lead.interactions) {
    if (lead.interactions.websiteVisits && lead.interactions.websiteVisits > 5) score += 10;
    if (lead.interactions.downloadedContent) score += 15;
    if (lead.interactions.formSubmissions) score += 20;
    if (lead.interactions.emailOpens && lead.interactions.emailOpens > 3) score += 5;
    if (lead.interactions.emailClicks && lead.interactions.emailClicks > 2) score += 10;
  }
  
  // Cap score at 100
  score = Math.min(100, score);
  
  return {
    ...lead,
    score
  };
}

/**
 * Mock function to simulate API call for development
 */
async function mockLeadDiscoveryCall(filters?: LeadDiscoveryFilters): Promise<Lead[]> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 800));
  
  // Generate some mock leads
  const mockLeads: Lead[] = [
    {
      id: `lead-${Date.now()}-1`,
      firstName: 'Alex',
      lastName: 'Johnson',
      email: 'alex.johnson@techcorp.com',
      companyName: 'TechCorp',
      industry: 'Technology',
      companySize: '50-200',
      location: 'San Francisco',
      country: 'USA',
      website: 'https://techcorp.com',
      source: 'website',
      createdAt: new Date(),
      interactions: {
        websiteVisits: 8,
        downloadedContent: true,
        formSubmissions: true,
        emailOpens: 5,
        emailClicks: 3
      }
    },
    {
      id: `lead-${Date.now()}-2`,
      firstName: 'Sam',
      lastName: 'Smith',
      email: 'sam.smith@finance-group.com',
      companyName: 'Finance Group',
      industry: 'Finance',
      companySize: '500-1000',
      location: 'New York',
      country: 'USA',
      website: 'https://finance-group.com',
      source: 'event',
      createdAt: new Date(),
      interactions: {
        websiteVisits: 3,
        downloadedContent: true,
        formSubmissions: false,
        emailOpens: 2,
        emailClicks: 1
      }
    },
    {
      id: `lead-${Date.now()}-3`,
      firstName: 'Jamie',
      lastName: 'Williams',
      email: 'jamie@healthcare-plus.co',
      companyName: 'Healthcare Plus',
      industry: 'Healthcare',
      companySize: '200-500',
      location: 'Chicago',
      country: 'USA',
      website: 'https://healthcare-plus.co',
      source: 'referral',
      createdAt: new Date(),
      interactions: {
        websiteVisits: 12,
        downloadedContent: true,
        formSubmissions: true,
        emailOpens: 7,
        emailClicks: 4
      }
    }
  ];
  
  // Apply filters if provided
  let filteredLeads = [...mockLeads];
  
  if (filters) {
    if (filters.industry && filters.industry.length > 0) {
      filteredLeads = filteredLeads.filter(lead => 
        lead.industry && filters.industry!.includes(lead.industry)
      );
    }
    
    if (filters.companySize && filters.companySize.length > 0) {
      filteredLeads = filteredLeads.filter(lead => 
        lead.companySize && filters.companySize!.includes(lead.companySize)
      );
    }
    
    if (filters.location && filters.location.length > 0) {
      filteredLeads = filteredLeads.filter(lead => 
        lead.location && filters.location!.some(loc => 
          lead.location!.toLowerCase().includes(loc.toLowerCase())
        )
      );
    }
    
    if (filters.source && filters.source.length > 0) {
      filteredLeads = filteredLeads.filter(lead => 
        lead.source && filters.source!.includes(lead.source as LeadSource)
      );
    }
    
    if (filters.score !== undefined) {
      // Score the leads first
      filteredLeads = filteredLeads.map(lead => scoreLeadQuality(lead));
      // Then filter by score
      filteredLeads = filteredLeads.filter(lead => 
        lead.score !== undefined && lead.score >= filters.score!
      );
    }
  }
  
  // Score all leads
  return filteredLeads.map(lead => scoreLeadQuality(lead));
}

/**
 * Get lead discovery statistics
 * @returns Statistics about discovered leads
 */
export async function getLeadDiscoveryStats(): Promise<{
  totalDiscovered: number;
  bySource: Record<LeadSource, number>;
  byIndustry: Record<string, number>;
  averageScore: number;
}> {
  // Mock statistics
  return {
    totalDiscovered: 156,
    bySource: {
      website: 78,
      social: 32,
      partner: 18,
      event: 15,
      referral: 13
    },
    byIndustry: {
      Technology: 45,
      Finance: 28,
      Healthcare: 22,
      Manufacturing: 18,
      Retail: 15,
      Education: 12,
      Other: 16
    },
    averageScore: 68.5
  };
}

export const realTimeLeadDiscoveryService = {
  discoverLeads,
  scoreLeadQuality,
  // Add other main functions here as needed
};