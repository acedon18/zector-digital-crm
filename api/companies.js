// Companies API endpoint
export default function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  try {
    // Return sample data for now
    const sampleCompanies = [
      {
        id: '1',
        name: 'Sample Company',
        domain: 'example.com',
        status: 'warm',
        lastVisit: new Date().toISOString(),
        totalVisits: 5
      }
    ];
    
    return res.status(200).json({
      success: true,
      companies: sampleCompanies,
      total: sampleCompanies.length
    });
    
  } catch (error) {
    console.error('Companies API error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch companies',
      details: error.message
    });
  }
}
