// Visitors API endpoint
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
    const sampleVisitors = [
      {
        id: '1',
        sessionId: 'session_1',
        domain: 'example.com',
        ipAddress: '192.168.1.1',
        startTime: new Date().toISOString(),
        pages: 3
      }
    ];
    
    return res.status(200).json({
      success: true,
      visitors: sampleVisitors,
      total: sampleVisitors.length
    });
    
  } catch (error) {
    console.error('Visitors API error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch visitors',
      details: error.message
    });
  }
}
