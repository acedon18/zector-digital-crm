// Ultra-simple test endpoint with no dependencies at all
module.exports = (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Return a static response with no dynamic content
  return res.status(200).send('API test endpoint is working');
};
