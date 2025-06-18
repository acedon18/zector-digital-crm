// Simple test endpoint that doesn't interact with the database
module.exports = (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  return res.status(200).json({
    status: 'ok',
    message: 'API is working',
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV || 'development',
    request: {
      method: req.method,
      url: req.url,
      headers: req.headers['host']
    }
  });
};
