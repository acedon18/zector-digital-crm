// Data Enrichment Service - Enhance leads with additional data
import type { Lead as LeadType } from '../types/leads';
import type { ApolloCompanyData } from './apolloEnrichmentService';
import { enrichCompanyWithApollo } from './apolloEnrichmentService';

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
 * Mock function to simulate API call for development
 */
async function mockEnrichmentCall(lead: LeadType): Promise<EnrichmentData> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Return mock data based on lead domain if available
  const domain = lead.email?.split('@')[1] || lead.website?.replace(/^https?:\/\//, '') || '';
  
  if (domain.includes('tech')) {
    return {
      industry: 'Technology',
      size: '50-200',
      location: { city: 'San Francisco', country: 'USA', region: 'West' },
      website: `https://${domain}`,
      phone: '+1-415-555-1234',
      confidence: 0.9
    };
  }
  
  if (domain.includes('finance')) {
    return {
      industry: 'Finance',
      size: '500-1000',
      location: { city: 'New York', country: 'USA', region: 'East' },
      website: `https://${domain}`,
      phone: '+1-212-555-6789',
      confidence: 0.85
    };
  }
  
  // Default data with low confidence
  return {
    industry: 'Unknown',
    size: 'Unknown',
    location: { city: '', country: '', region: '' },
    website: lead.website || '',
    phone: '',
    confidence: 0.3
  };
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

export const dataEnrichmentService = {
  enrichLeadData,
  batchEnrichLeads
  // Add other main functions here as needed
};