// Backend API endpoint for company enrichment using Apollo.io
// This prevents CORS issues when calling external APIs from the frontend

// Environment variables for Apollo.io API
const APOLLO_API_KEY = process.env.APOLLO_API_KEY || '';
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
    }

    if (!APOLLO_API_KEY) {
      console.warn('Apollo API key not configured - returning mock data');
      return res.status(200).json({
        success: true,
        data: {
          name: 'Sample Company',
          domain: domain || 'example.com',
          industry: 'Technology',
          size: '11-50 employees',
          website_url: `https://${domain || 'example.com'}`,
          description: 'Sample company data (Apollo API key not configured)',
          confidence: 0.3
        }
      });
    }    // Call Apollo.io API from backend to avoid CORS
    const apolloResponse = await fetch(APOLLO_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
        'Api-Key': APOLLO_API_KEY,
      },
      body: JSON.stringify({ 
        domain: domain || email 
      })
    });

    if (!apolloResponse.ok) {
      console.error(`Apollo API error: ${apolloResponse.status} ${apolloResponse.statusText}`);
      
      // Return fallback data instead of error
      return res.status(200).json({
        success: true,
        data: {
          name: 'Unknown Company',
          domain: domain || 'unknown.com',
          industry: 'Unknown',
          size: 'Unknown',
          website_url: domain ? `https://${domain}` : '',
          description: 'Company data not available',
          confidence: 0.1
        }
      });
    }

    const apolloData = await apolloResponse.json();

    if (apolloData && apolloData.company) {
      return res.status(200).json({
        success: true,
        data: {
          ...apolloData.company,
          confidence: 0.8
        }
      });
    } else {
      // Return fallback data if no company found
      return res.status(200).json({
        success: true,
        data: {
          name: 'Unknown Company',
          domain: domain || 'unknown.com',
          industry: 'Unknown',
          size: 'Unknown',
          website_url: domain ? `https://${domain}` : '',
          description: 'Company data not available',
          confidence: 0.1
        }
      });
    }

  } catch (error) {
    console.error('Enrichment API error:', error);
    
    // Return fallback data instead of error
    const { domain, email } = req.body;
    return res.status(200).json({
      success: true,
      data: {
        name: 'Error Enriching Company',
        domain: domain || email || 'unknown.com',
        industry: 'Unknown',
        size: 'Unknown',
        website_url: domain ? `https://${domain}` : '',
        description: 'Error occurred during enrichment',
        confidence: 0.1
      }
    });
  }
}
