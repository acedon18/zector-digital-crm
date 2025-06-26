// Database backup script - Create backup before cleanup
// This script creates a backup of your database before removing mock data

import { MongoClient } from 'mongodb';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

async function connectToDatabase() {
  const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI;
  if (!MONGO_URI) {
    throw new Error('MongoDB URI not found in environment variables');
  }

  const client = new MongoClient(MONGO_URI, {
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
    connectTimeoutMS: 10000,
    maxIdleTimeMs: 30000,
    tls: true,
    tlsAllowInvalidCertificates: false,
    tlsAllowInvalidHostnames: false
  });
  
  await client.connect();
  const db = client.db();
  return { client, db };
}

async function createBackup() {
  try {
    console.log('💾 Creating database backup before cleanup...');
    const { client, db } = await connectToDatabase();
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupDir = path.join(process.cwd(), 'backups');
    
    // Create backups directory if it doesn't exist
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }
    
    const collections = await db.listCollections().toArray();
    console.log(`Found ${collections.length} collections to backup`);
    
    const backupData = {
      timestamp,
      database: db.databaseName,
      collections: {}
    };
    
    for (const collection of collections) {
      const collectionName = collection.name;
      console.log(`📦 Backing up collection: ${collectionName}`);
      
      const coll = db.collection(collectionName);
      const documents = await coll.find().toArray();
      
      backupData.collections[collectionName] = documents;
      console.log(`  Backed up ${documents.length} documents`);
    }
    
    const backupFilePath = path.join(backupDir, `database-backup-${timestamp}.json`);
    fs.writeFileSync(backupFilePath, JSON.stringify(backupData, null, 2));
    
    console.log(`✅ Backup created successfully: ${backupFilePath}`);
    console.log(`📊 Backup size: ${(fs.statSync(backupFilePath).size / 1024 / 1024).toFixed(2)} MB`);
    
    await client.close();
    return backupFilePath;
    
  } catch (error) {
    console.error('❌ Backup failed:', error);
    throw error;
  }
}

// Run backup
createBackup()
  .then((backupPath) => {
    console.log('\n🎉 Backup completed successfully!');
    console.log(`📁 Backup saved to: ${backupPath}`);
    console.log('\nYou can now run the cleanup script safely.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Backup failed:', error);
    process.exit(1);
  });
