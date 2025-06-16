// API route for tracking on Vercel serverless
const mongoose = require('mongoose');
require('dotenv').config();

// MongoDB connection function
async function connectToDB() {
  try {
    const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/zector-digital-crm';
    await mongoose.connect(mongoURI);
    console.log('MongoDB connected successfully');
    return true;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    return false;
  }
}

// Simple handler for the track endpoint
module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    // Log the tracking data
    console.log('Tracking data received:', req.body);
    
    // Basic validation
    const { customerId, domain, event } = req.body;
    if (!customerId || !domain || !event) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    // For now, simply acknowledge receipt of the tracking data
    // In a future update, we'll store this in the database
    return res.status(200).json({ 
      success: true, 
      message: 'Tracking data received',
      data: {
        timestamp: new Date(),
        event,
        customerId,
        domain
      }
    });
    
  } catch (error) {
    console.error('Error in track endpoint:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
