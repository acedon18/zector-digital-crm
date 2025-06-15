// seed-data.js - Script to insert sample data into MongoDB
require('dotenv').config();
const mongoose = require('mongoose');
const { Company } = require('./db/models.cjs');

// Connect to MongoDB
const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/zector-digital-crm';
    await mongoose.connect(mongoURI);
    console.log('🔌 Connected to MongoDB for seeding data...');
    return true;
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error.message);
    return false;
  }
};

// Sample companies data
const sampleCompanies = [
  {
    name: 'Tech Solutions Inc',
    domain: 'techsolutions.com',
    industry: 'Technology',
    size: '51-200',
    location: { city: 'San Francisco', country: 'United States' },
    lastVisit: new Date(),
    totalVisits: 15,
    score: 85,
    status: 'hot',
    tags: ['High Engagement', 'Has Email'],
    phone: '+1 (415) 555-1234',
    email: 'contact@techsolutions.com',
    website: 'www.techsolutions.com'
  },
  {
    name: 'Digital Marketing Pro',
    domain: 'digitalmarketing.se',
    industry: 'Marketing',
    size: '11-50',
    location: { city: 'Stockholm', country: 'Sweden' },
    lastVisit: new Date(Date.now() - 60000), // 1 minute ago
    totalVisits: 8,
    score: 72,
    status: 'warm',
    tags: ['Has Phone', 'Social Media'],
    phone: '+46 8 123 456 78',
    email: 'info@digitalmarketing.se',
    website: 'www.digitalmarketing.se'
  },
  {
    name: 'E-commerce Solutions',
    domain: 'ecommerce.com',
    industry: 'Retail',
    size: '201-500',
    location: { city: 'London', country: 'United Kingdom' },
    lastVisit: new Date(Date.now() - 120000), // 2 minutes ago
    totalVisits: 22,
    score: 90,
    status: 'hot',
    tags: ['Enterprise', 'High Value'],
    phone: '+44 20 7946 0958',
    email: 'sales@ecommerce.com',
    website: 'www.ecommerce.com'
  },
  {
    name: 'Finance Experts',
    domain: 'financeexperts.co',
    industry: 'Finance',
    size: '51-200',
    location: { city: 'New York', country: 'United States' },
    lastVisit: new Date(Date.now() - 180000), // 3 minutes ago
    totalVisits: 5,
    score: 60,
    status: 'cold',
    tags: ['New Lead'],
    phone: '+1 (212) 555-6789',
    email: 'info@financeexperts.co',
    website: 'www.financeexperts.co'
  },
  {
    name: 'HealthTech Innovators',
    domain: 'healthtech.io',
    industry: 'Healthcare',
    size: '11-50',
    location: { city: 'Boston', country: 'United States' },
    lastVisit: new Date(Date.now() - 240000), // 4 minutes ago
    totalVisits: 18,
    score: 88,
    status: 'hot',
    tags: ['Healthcare', 'Tech'],
    phone: '+1 (617) 555-4321',
    email: 'contact@healthtech.io',
    website: 'www.healthtech.io'
  }
];

// Seed the database
const seedDB = async () => {
  const connected = await connectDB();
  if (!connected) {
    console.error('Failed to connect to MongoDB. Cannot seed data.');
    process.exit(1);
  }

  try {
    // Clear existing data first
    await Company.deleteMany({});
    console.log('🧹 Cleared existing company data');
    
    // Insert new sample data
    const inserted = await Company.insertMany(sampleCompanies);
    console.log(`🌱 Successfully seeded ${inserted.length} companies`);
    
    // Close the connection
    await mongoose.connection.close();
    console.log('📊 Database connection closed');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

// Execute the seed function
seedDB();
