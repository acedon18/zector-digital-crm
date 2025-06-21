// Data Enrichment Service - Enhance leads with additional data
import type { Lead as LeadType, Company } from '../types/leads';
import type { ApolloCompanyData } from './apolloEnrichmentService';
import { enrichCompanyWithApollo } from './apolloEnrichmentService';
import { PlatformType } from '@/types/integrations';

// Define enrichment data interfaces
export interface EnrichmentData {
  name?: string;
  domain?: string;
  industry?: string;
  size?: string;
  location?: {
    city?: string;
    country?: string;
    region?: string;
  };
  email?: string;
  phone?: string;
  website?: string;
  confidence: number;
}

export interface EnrichedLeadData {
  id: string;
  name: string;
  domain: string;
  enrichmentData: EnrichmentData;
  platforms: PlatformType[];
  score: number;
}

/**
 * Enrich a lead with additional data from third-party services
 * @param lead The lead to enrich
 * @returns Promise with enriched lead data
 */
export async function enrichLeadData(lead: LeadType): Promise<LeadType> {
  try {
    // For demo/development, just log and don't try to save directly to DB from frontend
    // The backend will handle actual DB operations when tracking data is sent
    console.log('Enriching lead data:', lead);
    
    let enrichmentData: ApolloCompanyData | null = null;
    // Try to enrich by domain or email
    const domain = lead.email?.split('@')[1] || lead.website?.replace(/^https?:\/\//, '') || '';
    if (domain) {
      enrichmentData = await enrichCompanyWithApollo(domain);
    }
    
    const enrichedLead = {
      ...lead,
      enriched: true,
      companyName: lead.companyName || enrichmentData?.name,
      industry: lead.industry || enrichmentData?.industry,
      companySize: lead.companySize || enrichmentData?.size || (enrichmentData?.estimated_num_employees ? enrichmentData.estimated_num_employees.toString() : undefined),
      website: lead.website || enrichmentData?.website_url,
      phone: lead.phone || enrichmentData?.phone,
      enrichmentError: undefined,
    };
    
    // Instead of direct DB access, send to backend via API
    fetch('/api/leads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(enrichedLead)
    }).catch(err => console.error('Error saving lead:', err));
    
    return enrichedLead;
  } catch (error) {
    console.error('Error enriching lead data:', error);
    return {
      ...lead,
      enriched: false,
      enrichmentError: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Batch enrich multiple leads
 * @param leads Array of leads to enrich
 * @returns Promise with array of enriched leads
 */
export async function batchEnrichLeads(leads: LeadType[]): Promise<LeadType[]> {
  const enrichmentPromises = leads.map(lead => enrichLeadData(lead));
  return Promise.all(enrichmentPromises);
}

/**
 * Enrich companies with additional data
 * @param companies Array of companies to enrich
 * @returns Promise with array of enriched company data
 */
export async function enrichCompanies(companies: Company[]): Promise<EnrichedLeadData[]> {
  try {
    const enrichmentPromises = companies.map(async (company): Promise<EnrichedLeadData> => {
      try {
        const domain = company.domain || '';
        const apolloData = await enrichCompanyWithApollo(domain);
        
        return {
          id: company.id,
          name: company.name || 'Unknown Company',
          domain: company.domain || '',
          enrichmentData: {
            name: apolloData?.name || company.name || 'Unknown Company',
            domain: company.domain || '',
            industry: apolloData?.industry || company.industry,
            size: apolloData?.size || company.size,
            location: {
              city: company.location?.city || '',
              country: company.location?.country || '',
              region: ''
            },
            email: company.email || '',
            phone: apolloData?.phone || company.phone || '',
            website: apolloData?.website_url || company.website || '',
            confidence: apolloData ? 0.8 : 0.3
          },
          platforms: ['hubspot'] as PlatformType[],
          score: company.score || 50
        };
      } catch (error) {
        console.warn(`Failed to enrich company ${company.name}:`, error);
        return {
          id: company.id,
          name: company.name || 'Unknown Company',
          domain: company.domain || '',
          enrichmentData: {
            name: company.name || 'Unknown Company',
            domain: company.domain || '',
            industry: company.industry,
            size: company.size,
            location: company.location || { city: '', country: '' },
            email: company.email || '',
            phone: company.phone || '',
            website: company.website || '',
            confidence: 0.1
          },
          platforms: [],
          score: company.score || 0
        };
      }
    });

    return await Promise.all(enrichmentPromises);
  } catch (error) {
    console.error('Error enriching companies:', error);
    return [];
  }
}

/**
 * Get enrichment summary statistics
 * @param enrichedData Array of enriched company data
 * @returns Summary statistics
 */
export function getEnrichmentSummary(enrichedData: EnrichedLeadData[]): {
  totalCompanies: number;
  enrichedCompanies: number;
  platformCoverage: Record<PlatformType, number>;
  averageScore: number;
} {
  const totalCompanies = enrichedData.length;
  const enrichedCompanies = enrichedData.filter(data => data.enrichmentData.confidence > 0.5).length;
  
  const platformCoverage: Record<PlatformType, number> = {
    google_analytics: 0,
    google_ads: 0,
    meta_ads: 0,
    tiktok_ads: 0,
    google_tag_manager: 0,
    hubspot: 0,
    pipedrive: 0,
    salesforce: 0
  };

  enrichedData.forEach(data => {
    data.platforms.forEach(platform => {
      if (platform in platformCoverage) {
        platformCoverage[platform]++;
      }
    });
  });

  const averageScore = enrichedData.length > 0 
    ? enrichedData.reduce((sum, data) => sum + data.score, 0) / enrichedData.length 
    : 0;

  return {
    totalCompanies,
    enrichedCompanies,
    platformCoverage,
    averageScore: Math.round(averageScore)
  };
}

export const dataEnrichmentService = {
  enrichLeadData,
  batchEnrichLeads,
  enrichCompanies,
  getEnrichmentSummary
  // Add other main functions here as needed
};