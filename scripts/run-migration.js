#!/usr/bin/env node

// Run Multi-Tenant Migration with Environment Setup
import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
config({ path: join(__dirname, '..', '.env.local') });
config({ path: join(__dirname, '..', '.env') });
config({ path: join(__dirname, '..', '.env.production') });

console.log('🔧 Multi-Tenant Migration Setup');
console.log('');

// Check if MONGO_URI is available
const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;

if (!mongoUri) {
  console.log('❌ MongoDB Connection Not Found');
  console.log('');
  console.log('📋 To run the migration, you need to set up your MongoDB connection:');
  console.log('');
  console.log('Option 1: Create .env.local file');
  console.log('  1. Copy .env.local.example to .env.local');
  console.log('  2. Replace the MONGO_URI with your actual MongoDB connection string');
  console.log('  3. Run: node scripts/run-migration.js');
  console.log('');
  console.log('Option 2: Set environment variable temporarily');
  console.log('  Windows PowerShell:');
  console.log('  $env:MONGO_URI="your_connection_string"; node scripts/migrate-to-multi-tenant.js');
  console.log('');
  console.log('  Windows CMD:');
  console.log('  set MONGO_URI=your_connection_string && node scripts/migrate-to-multi-tenant.js');
  console.log('');
  console.log('  Linux/Mac:');
  console.log('  MONGO_URI="your_connection_string" node scripts/migrate-to-multi-tenant.js');
  console.log('');
  console.log('📍 Get your MongoDB connection string from:');
  console.log('  - MongoDB Atlas: https://cloud.mongodb.com');
  console.log('  - Local MongoDB: mongodb://localhost:27017/your_database_name');
  console.log('  - Docker MongoDB: mongodb://localhost:27017/zector_crm');
  console.log('');
  console.log('🔑 Your connection string should look like:');
  console.log('  mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority');
  process.exit(1);
}

console.log('✅ MongoDB Connection Found');
console.log(`📍 Database: ${mongoUri.replace(/\/\/[^:]*:[^@]*@/, '//***:***@')}`);
console.log('');

// Import and run the migration
try {
  const { main } = await import('./migrate-to-multi-tenant.js');
  await main();
} catch (error) {
  console.error('❌ Migration failed:', error.message);
  process.exit(1);
}
