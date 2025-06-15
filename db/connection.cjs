const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
  try {
    // Get MongoDB URI from environment variable or use a default local MongoDB
    const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/zector-digital-crm';
    
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(mongoURI, {
      // Add MongoDB connection options here if needed
    });
    console.log('📊 MongoDB Connected Successfully!');
    return true;
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error.message);
    // Fallback to in-memory storage in case of connection failure
    return false;
  }
};

module.exports = connectDB;
