// Snabb SSL Test för MongoDB Connection
import { MongoClient } from 'mongodb';
import 'dotenv/config';

// Test olika SSL-konfigurationer
const testConfigurations = [
  {
    name: 'Standard SSL Config',
    uri: process.env.MONGO_URI || process.env.MONGODB_URI,
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      maxPoolSize: 10,
      retryWrites: true,
      w: 'majority',
      ssl: true,
      sslValidate: false,
      authSource: 'admin'
    }
  },
  {
    name: 'Minimal SSL Config',
    uri: (process.env.MONGO_URI || process.env.MONGODB_URI) + '&ssl=true',
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true
    }
  },
  {
    name: 'TLS Allow Invalid Config',
    uri: (process.env.MONGO_URI || process.env.MONGODB_URI) + '&ssl=true&authSource=admin&tlsAllowInvalidCertificates=true',
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 10000
    }
  }
];

async function testSSLConfigurations() {
  console.log('🔧 Testar SSL/TLS MongoDB-konfigurationer...\n');
  
  if (!process.env.MONGO_URI && !process.env.MONGODB_URI) {
    console.error('❌ Ingen MongoDB URI hittad i environment variables');
    return;
  }

  for (let i = 0; i < testConfigurations.length; i++) {
    const config = testConfigurations[i];
    console.log(`🧪 Test ${i + 1}: ${config.name}`);
    console.log(`📍 URI: ${config.uri.substring(0, 50)}...`);
    
    try {
      const client = new MongoClient(config.uri, config.options);
      
      console.log('   🔗 Ansluter...');
      await client.connect();
      
      console.log('   ✅ Anslutning lyckades!');
      
      const db = client.db();
      console.log(`   📊 Databas: ${db.databaseName || 'default'}`);
      
      // Testa att läsa collections
      const collections = await db.listCollections().toArray();
      console.log(`   📦 Collections: ${collections.length} (${collections.map(c => c.name).join(', ')})`);
      
      // Testa att läsa från companies collection
      const companiesCount = await db.collection('companies').countDocuments();
      console.log(`   🏢 Companies count: ${companiesCount}`);
      
      await client.close();
      console.log('   🔒 Anslutning stängd\n');
      
      // Om första konfigurationen fungerar, använd den
      if (i === 0) {
        console.log('🎉 FÖRSTA KONFIGURATIONEN FUNGERAR! Denna används i API:et.');
        break;
      }
      
    } catch (error) {
      console.log(`   ❌ Fel: ${error.message}`);
      
      if (error.message.includes('SSL') || error.message.includes('TLS')) {
        console.log('   🔍 SSL/TLS-fel upptäckt');
      } else if (error.message.includes('Authentication')) {
        console.log('   🔍 Autentiseringsfel upptäckt');
      } else if (error.message.includes('timeout')) {
        console.log('   🔍 Timeout-fel upptäckt');
      }
      console.log('');
    }
  }
  
  console.log('🎯 Test slutfört. Använd den konfiguration som fungerade för Vercel Environment Variables.');
}

testSSLConfigurations();
