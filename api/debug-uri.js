// Debug MongoDB URI format
export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    const uri = process.env.MONGODB_URI || process.env.MONGO_URI;
    
    if (!uri) {
      return res.status(200).json({
        success: false,
        error: 'No MongoDB URI found',
        environment: {
          MONGO_URI: process.env.MONGO_URI ? 'SET' : 'NOT SET',
          MONGODB_URI: process.env.MONGODB_URI ? 'SET' : 'NOT SET'
        }
      });
    }
    
    // Parse URI to check format (safely)
    const uriParts = {
      length: uri.length,
      protocol: uri.split('://')[0],
      hasCredentials: uri.includes('@'),
      hasSRV: uri.includes('mongodb+srv'),
      hasRetryWrites: uri.includes('retryWrites'),
      hasMajority: uri.includes('w=majority'),
      hasSSL: uri.includes('ssl=true') || uri.includes('tls=true'),
      queryParams: uri.split('?')[1] || 'none'
    };
    
    return res.status(200).json({
      success: true,
      timestamp: new Date().toISOString(),
      uriAnalysis: uriParts,
      recommendations: {
        shouldIncludeRetryWrites: !uriParts.hasRetryWrites,
        shouldIncludeMajority: !uriParts.hasMajority,
        usingModernProtocol: uriParts.hasSRV
      }
    });
    
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
}
