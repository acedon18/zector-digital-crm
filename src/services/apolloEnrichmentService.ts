// Apollo.io Company Enrichment Service
// This service enriches leads with company data using our backend API endpoint
// which prevents CORS issues when calling external APIs

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

const API_BASE = import.meta.env.VITE_API_URL || '';

export async function enrichCompanyWithApollo(domainOrEmail: string): Promise<ApolloCompanyData | null> {
  try {
    const response = await fetch(`${API_BASE}/api/enrich`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        domain: domainOrEmail.includes('@') ? undefined : domainOrEmail,
        email: domainOrEmail.includes('@') ? domainOrEmail : undefined,
      }),
    });

    if (!response.ok) {
      console.error(`Enrichment API error: ${response.status} ${response.statusText}`);
      return null;
    }

    const result = await response.json();
    
    if (result.success && result.data) {
      return result.data;
    }
    
    return null;
  } catch (error) {
    console.error('Apollo enrichment error:', error);
    return null;
  }
}
