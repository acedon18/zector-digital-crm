// Discover leads API endpoint
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
    const sampleLeads = [
      {
        id: '1',
        company: 'Potential Lead Co.',
        domain: 'potentiallead.com',
        score: 75,
        status: 'hot',
        discovered: new Date().toISOString()
      }
    ];
    
    return res.status(200).json({
      success: true,
      leads: sampleLeads,
      total: sampleLeads.length
    });
    
  } catch (error) {
    console.error('Discover leads API error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to discover leads',
      details: error.message
    });
  }
}
