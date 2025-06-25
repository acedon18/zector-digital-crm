#!/usr/bin/env node

// Multi-Tenant Database Migration Script
// This script migrates existing single-tenant data to multi-tenant schema

import { MongoClient } from 'mongodb';
import { v4 as uuidv4 } from 'uuid';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configuration
const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI;
const DEFAULT_TENANT_ID = 'zector-digital-tenant-001';
const DEFAULT_TENANT_NAME = 'Zector Digital ES';
const DEFAULT_TENANT_DOMAIN = 'zectordigital.es';

if (!MONGO_URI) {
  console.error('❌ Error: MONGO_URI environment variable is required');
  process.exit(1);
}

async function connectToDatabase() {
  const client = new MongoClient(MONGO_URI, {
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
    connectTimeoutMS: 10000,
    maxIdleTimeMS: 30000,
    tls: true,
    tlsAllowInvalidCertificates: false,
    tlsAllowInvalidHostnames: false
  });
  
  await client.connect();
  const db = client.db();
  return { client, db };
}

async function createDefaultTenant(db) {
  console.log('📝 Creating default tenant...');
  
  const tenantsCollection = db.collection('tenants');
  
  // Check if default tenant already exists
  const existingTenant = await tenantsCollection.findOne({ tenantId: DEFAULT_TENANT_ID });
  if (existingTenant) {
    console.log('✅ Default tenant already exists');
    return existingTenant;
  }
  
  const defaultTenant = {
    tenantId: DEFAULT_TENANT_ID,
    name: DEFAULT_TENANT_NAME,
    domain: DEFAULT_TENANT_DOMAIN,
    subdomain: 'zectordigital',
    plan: 'professional',
    
    subscription: {
      status: 'active',
      startDate: new Date(),
      endDate: null,
      trialEnd: null,
      billingCycle: 'monthly'
    },
    
    settings: {
      trackingDomains: [DEFAULT_TENANT_DOMAIN, 'www.zectordigital.es'],
      apiKeys: {
        clearbit: '',
        hunter: '',
        ipinfo: ''
      },
      branding: {
        logo: '',
        primaryColor: '#ff6b35',
        customDomain: ''
      },
      gdpr: {
        enabled: true,
        cookieNotice: true,
        dataRetentionDays: 365
      },
      notifications: {
        email: true,
        realTime: true,
        digest: 'daily'
      }
    },
    
    limits: {
      monthlyVisits: 10000,
      emailAlerts: 500,
      dataExports: 25,
      apiCalls: 50000,
      dataRetentionDays: 365
    },
    
    createdAt: new Date(),
    updatedAt: new Date(),
    isActive: true
  };
  
  const result = await tenantsCollection.insertOne(defaultTenant);
  console.log(`✅ Created default tenant with ID: ${result.insertedId}`);
  
  return defaultTenant;
}

async function migrateVisitsCollection(db) {
  console.log('📝 Migrating visits collection...');
  
  const visitsCollection = db.collection('visits');
  
  // Count existing visits without tenantId
  const visitsWithoutTenant = await visitsCollection.countDocuments({ 
    tenantId: { $exists: false } 
  });
  
  if (visitsWithoutTenant === 0) {
    console.log('✅ All visits already have tenantId');
    return;
  }
  
  console.log(`📊 Found ${visitsWithoutTenant} visits without tenantId`);
  
  // Update all visits without tenantId
  const result = await visitsCollection.updateMany(
    { tenantId: { $exists: false } },
    { 
      $set: { 
        tenantId: DEFAULT_TENANT_ID,
        updatedAt: new Date()
      }
    }
  );
  
  console.log(`✅ Updated ${result.modifiedCount} visits with tenantId`);
}

async function migrateCompaniesCollection(db) {
  console.log('📝 Migrating companies collection...');
  
  const companiesCollection = db.collection('companies');
  
  // Count existing companies without tenantId
  const companiesWithoutTenant = await companiesCollection.countDocuments({ 
    tenantId: { $exists: false } 
  });
  
  if (companiesWithoutTenant === 0) {
    console.log('✅ All companies already have tenantId');
    return;
  }
  
  console.log(`📊 Found ${companiesWithoutTenant} companies without tenantId`);
  
  // Update all companies without tenantId
  const result = await companiesCollection.updateMany(
    { tenantId: { $exists: false } },
    { 
      $set: { 
        tenantId: DEFAULT_TENANT_ID,
        updatedAt: new Date()
      }
    }
  );
  
  console.log(`✅ Updated ${result.modifiedCount} companies with tenantId`);
}

async function migrateEventsCollection(db) {
  console.log('📝 Migrating events collection...');
  
  const eventsCollection = db.collection('events');
  
  // Count existing events without tenantId
  const eventsWithoutTenant = await eventsCollection.countDocuments({ 
    tenantId: { $exists: false } 
  });
  
  if (eventsWithoutTenant === 0) {
    console.log('✅ All events already have tenantId');
    return;
  }
  
  console.log(`📊 Found ${eventsWithoutTenant} events without tenantId`);
  
  // Update all events without tenantId
  const result = await eventsCollection.updateMany(
    { tenantId: { $exists: false } },
    { 
      $set: { 
        tenantId: DEFAULT_TENANT_ID,
        processedAt: new Date()
      }
    }
  );
  
  console.log(`✅ Updated ${result.modifiedCount} events with tenantId`);
}

async function createIndexes(db) {
  console.log('📝 Creating database indexes...');
  
  try {
    // Tenants collection indexes
    await db.collection('tenants').createIndex({ tenantId: 1 }, { unique: true });
    await db.collection('tenants').createIndex({ domain: 1 }, { unique: true });
    await db.collection('tenants').createIndex({ subdomain: 1 }, { unique: true });
    await db.collection('tenants').createIndex({ isActive: 1 });
    
    // Users collection indexes
    await db.collection('users').createIndex({ userId: 1 }, { unique: true });
    await db.collection('users').createIndex({ tenantId: 1, email: 1 }, { unique: true });
    await db.collection('users').createIndex({ 'authentication.isActive': 1 });
    
    // Visits collection indexes
    await db.collection('visits').createIndex({ tenantId: 1, sessionId: 1 });
    await db.collection('visits').createIndex({ tenantId: 1, startTime: -1 });
    await db.collection('visits').createIndex({ tenantId: 1, domain: 1 });
    
    // Companies collection indexes
    await db.collection('companies').createIndex({ tenantId: 1, domain: 1 });
    await db.collection('companies').createIndex({ tenantId: 1, lastVisit: -1 });
    
    // Events collection indexes
    await db.collection('events').createIndex({ tenantId: 1, timestamp: -1 });
    await db.collection('events').createIndex({ tenantId: 1, sessionId: 1 });
    
    console.log('✅ Created database indexes');
  } catch (error) {
    console.log('⚠️  Some indexes may already exist:', error.message);
  }
}

async function validateMigration(db) {
  console.log('📝 Validating migration...');
  
  const collections = ['visits', 'companies', 'events'];
  let isValid = true;
  
  for (const collectionName of collections) {
    const collection = db.collection(collectionName);
    const withoutTenant = await collection.countDocuments({ tenantId: { $exists: false } });
    const withTenant = await collection.countDocuments({ tenantId: DEFAULT_TENANT_ID });
    
    console.log(`📊 ${collectionName}: ${withTenant} with tenantId, ${withoutTenant} without`);
    
    if (withoutTenant > 0) {
      console.log(`❌ Migration incomplete for ${collectionName}`);
      isValid = false;
    }
  }
  
  // Check tenant exists
  const tenantsCollection = db.collection('tenants');
  const tenantCount = await tenantsCollection.countDocuments({ tenantId: DEFAULT_TENANT_ID });
  
  if (tenantCount === 0) {
    console.log('❌ Default tenant not found');
    isValid = false;
  }
  
  if (isValid) {
    console.log('✅ Migration validation successful!');
  } else {
    console.log('❌ Migration validation failed!');
  }
  
  return isValid;
}

async function main() {
  console.log('🚀 Starting multi-tenant database migration...');
  console.log(`📍 Target MongoDB: ${MONGO_URI.replace(/\/\/[^:]*:[^@]*@/, '//***:***@')}`);
  console.log(`🏢 Default Tenant: ${DEFAULT_TENANT_NAME} (${DEFAULT_TENANT_ID})`);
  console.log('');
  
  let client;
  
  try {
    // Connect to database
    console.log('🔌 Connecting to MongoDB...');
    const connection = await connectToDatabase();
    client = connection.client;
    const db = connection.db;
    console.log('✅ Connected to MongoDB');
    console.log('');
    
    // Run migration steps
    await createDefaultTenant(db);
    await migrateVisitsCollection(db);
    await migrateCompaniesCollection(db);
    await migrateEventsCollection(db);
    await createIndexes(db);
    
    console.log('');
    await validateMigration(db);
    
    console.log('');
    console.log('🎉 Multi-tenant migration completed successfully!');
    console.log('');
    console.log('📋 Next Steps:');
    console.log('1. Update your tracking script with the new tenantId');
    console.log('2. Test the multi-tenant APIs');
    console.log('3. Create additional tenants as needed');
    console.log('4. Set up user accounts for each tenant');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    if (client) {
      await client.close();
      console.log('🔌 Disconnected from MongoDB');
    }
  }
}

// Run migration if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export {
  main,
  createDefaultTenant,
  migrateVisitsCollection,
  migrateCompaniesCollection,
  migrateEventsCollection,
  createIndexes,
  validateMigration
};
