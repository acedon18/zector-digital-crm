// Apollo.io Company Enrichment Service
// This service enriches leads with company data via our backend API to avoid CORS

import axios from 'axios';

// Use the backend API endpoint instead of calling Apollo directly
const API_ENDPOINT = import.meta.env.VITE_API_ENDPOINT || 'https://zector-digital-crm-leads.vercel.app';
const ENRICH_API_URL = `${API_ENDPOINT}/api/enrich`;

export interface ApolloCompanyData {
  name?: string;
  website_url?: string;
  domain?: string;
  industry?: string;
  size?: string;
  estimated_num_employees?: number;
  revenue_range?: string;
  phone?: string;
  linkedin_url?: string;
  facebook_url?: string;
  twitter_url?: string;
  founded_year?: number;
  description?: string;
  location?: string;
  confidence?: number;
}

export async function enrichCompanyWithApollo(domainOrEmail: string): Promise<ApolloCompanyData | null> {
  try {
    console.log(`🔍 Enriching company data for: ${domainOrEmail}`);
    
    const response = await axios.post(
      ENRICH_API_URL,
      { 
        domain: domainOrEmail.includes('@') ? domainOrEmail.split('@')[1] : domainOrEmail,
        email: domainOrEmail.includes('@') ? domainOrEmail : undefined
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 10000 // 10 second timeout
      }
    );
    
    if (response.data && response.data.success && response.data.data) {
      console.log(`✅ Enrichment successful for ${domainOrEmail}:`, response.data.data);
      return response.data.data;
    }
    
    console.log(`⚠️ No enrichment data found for ${domainOrEmail}`);
    return null;
  } catch (error) {
    console.error('Apollo enrichment error:', error);
    return null;
  }
}
