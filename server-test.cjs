// Minimal server test
console.log('Starting server test...');

try {
  const express = require('express');
  console.log('Express loaded successfully');
  
  const cors = require('cors');
  console.log('CORS loaded successfully');
  
  require('dotenv').config();
  console.log('Dotenv loaded successfully');
  
  const connectDB = require('./db/connection.cjs');
  console.log('Database connection loaded successfully');
  
  const { Company, Visit, Customer, TrackingScript } = require('./db/models.cjs');
  console.log('Database models loaded successfully');
  
  console.log('All modules loaded successfully! Starting actual server...');
  
  // If we get here, let's try to run the actual server
  require('./server.cjs');
  
} catch (error) {
  console.error('Error loading modules:', error);
}
