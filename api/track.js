// Simple tracking API endpoint
export default function handler(req, res) {
  // Enable CORS first
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  // Return simple response regardless of method for now
  return res.status(200).json({
    success: true,
    message: 'Tracking endpoint working',
    method: req.method,
    timestamp: new Date().toISOString()
  });
}
