// Enhanced tracking API endpoint with multiple method support
export default function handler(req, res) {
  // Enable CORS first
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Accept');
  res.setHeader('Access-Control-Max-Age', '86400'); // Cache preflight for 24 hours
  
  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  // Handle GET request (image beacon fallback)
  if (req.method === 'GET') {
    try {
      const trackingData = req.query.data ? JSON.parse(req.query.data) : null;
      
      if (trackingData) {
        console.log('Tracking data received via GET:', trackingData.event);
      }
      
      // Return 1x1 transparent pixel for image beacon
      res.setHeader('Content-Type', 'image/gif');
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      
      // 1x1 transparent GIF in base64
      const pixel = Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64');
      return res.status(200).send(pixel);
      
    } catch (error) {
      console.error('Error processing GET tracking request:', error);
      return res.status(400).json({ error: 'Invalid tracking data' });
    }
  }
  
  // Handle POST request (main tracking method)
  if (req.method === 'POST') {
    try {
      const trackingData = req.body;
      
      if (trackingData && trackingData.event) {
        console.log('Tracking data received via POST:', trackingData.event, trackingData.customerId);
      }
      
      return res.status(200).json({
        success: true,
        message: 'Tracking data received',
        event: trackingData?.event || 'unknown',
        timestamp: new Date().toISOString()
      });
      
    } catch (error) {
      console.error('Error processing POST tracking request:', error);
      return res.status(400).json({ error: 'Invalid tracking data' });
    }
  }
  
  // Handle other methods
  return res.status(405).json({ error: 'Method not allowed' });
}
