// Backend API endpoint for company enrichment using Apollo.io
// This prevents CORS issues when calling external APIs from the frontend

// Environment variables for Apollo.io API
const APOLLO_API_KEY = process.env.APOLLO_API_KEY || process.env.VITE_APOLLO_API_KEY || '2SbDoScjvV30ZmpgOMArTg';
const APOLLO_API_URL = 'https://api.apollo.io/v1/mixed/company/enrich';

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false, 
      error: 'Method not allowed',
      message: 'Only POST requests are allowed for enrichment'
    });
  }

  try {
    const { domain, email } = req.body;

    if (!domain && !email) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required parameters',
        message: 'Either domain or email is required for enrichment'
      });
    }    console.log(`🔍 Enriching company data for: ${domain || email}`);
    console.log(`🔑 Apollo API Key available: ${APOLLO_API_KEY ? 'Yes' : 'No'}`);
    console.log(`🔑 Apollo API Key length: ${APOLLO_API_KEY ? APOLLO_API_KEY.length : 0}`);
    console.log(`🔑 Apollo API Key first 4 chars: ${APOLLO_API_KEY ? APOLLO_API_KEY.substring(0, 4) + '...' : 'N/A'}`);

    if (!APOLLO_API_KEY || APOLLO_API_KEY === 'your_apollo_api_key_here') {
      console.warn('🚨 Apollo API key not configured - returning enhanced mock data');
      console.log(`🔑 Actual key value check: "${APOLLO_API_KEY}"`);
      
      // Return enhanced mock data based on domain
      const companyName = domain ? domain.split('.')[0].charAt(0).toUpperCase() + domain.split('.')[0].slice(1) : 'Sample Company';
      let industry = 'Technology';
      let size = '11-50 employees';
      let location = 'United States';
      
      // Smart mock data based on domain patterns
      if (domain?.includes('tech') || domain?.includes('software')) {
        industry = 'Technology';
        size = '51-200 employees';
      } else if (domain?.includes('finance') || domain?.includes('bank')) {
        industry = 'Financial Services';
        size = '201-500 employees';
      } else if (domain?.includes('health') || domain?.includes('medical')) {
        industry = 'Healthcare';
        size = '101-250 employees';
      } else if (domain?.includes('edu') || domain?.includes('university')) {
        industry = 'Education';
        size = '501-1000 employees';
      }

      return res.status(200).json({
        success: true,
        data: {
          name: companyName,
          domain: domain || 'example.com',
          industry: industry,
          size: size,
          location: location,
          website_url: domain ? `https://${domain}` : '',
          description: `${companyName} - Enhanced mock data (Apollo API key not configured)`,
          confidence: 0.6
        },
        source: 'enhanced_mock'
      });
    }    // Call Apollo.io API from backend to avoid CORS
    console.log(`📡 Calling Apollo.io API for: ${domain || email}`);
    
    const requestBody = domain ? { domain: domain } : { email: email };
    console.log(`📡 Apollo API request body:`, JSON.stringify(requestBody));
    
    const apolloResponse = await fetch(APOLLO_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
        'Api-Key': APOLLO_API_KEY,
      },
      body: JSON.stringify(requestBody)
    });

    console.log(`📡 Apollo API response status: ${apolloResponse.status}`);
    
    if (!apolloResponse.ok) {
      const errorText = await apolloResponse.text();
      console.error(`Apollo API error: ${apolloResponse.status} ${apolloResponse.statusText}`);
      console.error(`Apollo API error details:`, errorText);
      
      // Return enhanced fallback data instead of error
      return res.status(200).json({
        success: true,
        data: {
          name: domain ? domain.split('.')[0].charAt(0).toUpperCase() + domain.split('.')[0].slice(1) : 'Unknown Company',
          domain: domain || 'unknown.com',
          industry: 'Technology',
          size: '11-50 employees',
          website_url: domain ? `https://${domain}` : '',
          description: 'Company data from enhanced fallback (Apollo API error)',
          confidence: 0.4
        },
        source: 'enhanced_fallback'
      });
    }    const apolloData = await apolloResponse.json();
    console.log(`✅ Apollo.io response received for ${domain || email}`);
    console.log(`Apollo response data:`, JSON.stringify(apolloData, null, 2));

    if (apolloData && apolloData.organization) {
      // Apollo returns data in 'organization' field
      const org = apolloData.organization;
      return res.status(200).json({
        success: true,
        data: {
          name: org.name,
          domain: org.website_url?.replace(/^https?:\/\//, '').replace(/\/$/, ''),
          industry: org.industry,
          size: org.estimated_num_employees ? `${org.estimated_num_employees} employees` : 'Unknown',
          website_url: org.website_url,
          description: `${org.name} - Real data from Apollo.io`,
          confidence: 0.9
        },
        source: 'apollo_api'
      });
    } else if (apolloData && apolloData.company) {
      return res.status(200).json({
        success: true,
        data: {
          ...apolloData.company,
          confidence: 0.9
        },
        source: 'apollo_api'
      });
    } else {
      // Return enhanced fallback data if no company found
      return res.status(200).json({
        success: true,
        data: {
          name: domain ? domain.split('.')[0].charAt(0).toUpperCase() + domain.split('.')[0].slice(1) : 'Unknown Company',
          domain: domain || 'unknown.com',
          industry: 'Unknown',
          size: 'Unknown',
          website_url: domain ? `https://${domain}` : '',
          description: 'Company data not available in Apollo.io',
          confidence: 0.2
        },
        source: 'no_data_fallback'
      });
    }

  } catch (error) {
    console.error('Enrichment API error:', error);
    
    // Return enhanced fallback data instead of error
    const { domain, email } = req.body;
    return res.status(200).json({
      success: true,
      data: {
        name: domain ? domain.split('.')[0].charAt(0).toUpperCase() + domain.split('.')[0].slice(1) : 'Error Company',
        domain: domain || email || 'unknown.com',
        industry: 'Unknown',
        size: 'Unknown',
        website_url: domain ? `https://${domain}` : '',
        description: 'Error occurred during enrichment - using fallback data',
        confidence: 0.1
      },
      source: 'error_fallback'
    });
  }
}
