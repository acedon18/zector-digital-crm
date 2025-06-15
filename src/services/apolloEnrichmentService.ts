// Apollo.io Company Enrichment Service
// This service enriches leads with company data from Apollo.io using domain or email

import axios from 'axios';

const APOLLO_API_KEY = process.env.APOLLO_API_KEY || '';
const APOLLO_API_URL = 'https://api.apollo.io/v1/mixed/company/enrich';

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
}

export async function enrichCompanyWithApollo(domainOrEmail: string): Promise<ApolloCompanyData | null> {
  if (!APOLLO_API_KEY) {
    throw new Error('Apollo API key is not set in environment variables.');
  }
  try {
    const response = await axios.post(
      APOLLO_API_URL,
      { domain: domainOrEmail },
      {
        headers: {
          'Cache-Control': 'no-cache',
          'Content-Type': 'application/json',
          'Api-Key': APOLLO_API_KEY,
        },
      }
    );
    if (response.data && response.data.company) {
      return response.data.company;
    }
    return null;
  } catch (error) {
    console.error('Apollo enrichment error:', error);
    return null;
  }
}
