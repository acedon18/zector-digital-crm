// MongoDB Connection Test för Zector Digital Leads CRM
import { MongoClient } from 'mongodb';
import 'dotenv/config';

const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI;

async function testMongoConnection() {
  console.log('🚀 Testar MongoDB-anslutning...');
  console.log('📍 URI:', MONGO_URI ? 'URI hittad' : '❌ Ingen URI i environment');
  
  if (!MONGO_URI) {
    console.error('❌ MONGO_URI saknas i environment variables');
    console.log('💡 Lägg till MONGO_URI i .env.local filen');
    return;
  }

  try {
    console.log('🔗 Ansluter till MongoDB Atlas...');
    const client = new MongoClient(MONGO_URI, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    
    await client.connect();
    console.log('✅ Anslutning lyckades!');
    
    const db = client.db();
    console.log(`📊 Ansluten till databas: ${db.databaseName || 'default'}`);
    
    // Testa att lista collections
    console.log('📋 Listar befintliga collections...');
    const collections = await db.listCollections().toArray();
    console.log(`📦 Hittade ${collections.length} collections:`, 
      collections.map(c => c.name).join(', ') || 'Inga collections än'
    );
    
    // Testa att skriva test-data
    console.log('✍️ Testar att skriva test-data...');
    const testCollection = db.collection('connection_test');
    const testDoc = {
      test: true,
      message: 'Test från Zector CRM MongoDB setup',
      timestamp: new Date(),
      version: '1.0.0'
    };
    
    const insertResult = await testCollection.insertOne(testDoc);
    console.log('✅ Test-dokument skapat med ID:', insertResult.insertedId);
    
    // Testa att läsa data
    console.log('👀 Testar att läsa test-data...');
    const foundDoc = await testCollection.findOne({ _id: insertResult.insertedId });
    console.log('✅ Test-dokument läst:', foundDoc ? 'Framgång' : 'Misslyckades');
    
    // Rensa test-data
    console.log('🧹 Rensar test-data...');
    await testCollection.deleteOne({ _id: insertResult.insertedId });
    console.log('✅ Test-data rensad');
    
    // Testa tracking collection
    console.log('🎯 Testar tracking_events collection...');
    const trackingCollection = db.collection('tracking_events');
    const sampleTracking = {
      event: 'page_view',
      domain: 'test-domain.com',
      url: '/test-page',
      timestamp: new Date(),
      visitor_id: 'test-visitor-123',
      test: true
    };
    
    const trackingResult = await trackingCollection.insertOne(sampleTracking);
    console.log('✅ Sample tracking event skapad:', trackingResult.insertedId);
    
    // Testa companies collection
    console.log('🏢 Testar companies collection...');
    const companiesCollection = db.collection('companies');
    const sampleCompany = {
      name: 'Test Company AB',
      domain: 'testcompany.se',
      industry: 'Technology',
      lastVisit: new Date(),
      totalVisits: 1,
      score: 75,
      status: 'warm',
      test: true
    };
    
    const companyResult = await companiesCollection.insertOne(sampleCompany);
    console.log('✅ Sample company skapad:', companyResult.insertedId);
    
    // Kolla statistics
    console.log('📊 Databas-statistik:');
    const trackingCount = await trackingCollection.countDocuments({ test: { $ne: true } });
    const companiesCount = await companiesCollection.countDocuments({ test: { $ne: true } });
    console.log(`   📈 Tracking events: ${trackingCount}`);
    console.log(`   🏢 Companies: ${companiesCount}`);
    
    // Rensa test-data
    console.log('🧹 Rensar all test-data...');
    await trackingCollection.deleteMany({ test: true });
    await companiesCollection.deleteMany({ test: true });
    
    await client.close();
    console.log('🔒 Anslutning stängd');
    
    console.log('\n🎉 MONGODB KONFIGURATION LYCKADES!');
    console.log('✅ Din databas är redo för production');
    console.log('🚀 Du kan nu deploya till Vercel med real data');
    
  } catch (error) {
    console.error('❌ MongoDB-anslutning misslyckades:');
    console.error('🔍 Fel:', error.message);
    
    if (error.message.includes('Authentication failed')) {
      console.log('\n💡 Felsökning för Authentication failed:');
      console.log('   1. Kontrollera username/password i connection string');
      console.log('   2. Se till att database user finns i MongoDB Atlas');
      console.log('   3. Verifiera att user har rätt behörigheter');
    }
    
    if (error.message.includes('ENOTFOUND') || error.message.includes('timeout')) {
      console.log('\n💡 Felsökning för Network errors:');
      console.log('   1. Kontrollera Network Access i MongoDB Atlas');
      console.log('   2. Lägg till din IP-adress eller 0.0.0.0/0');
      console.log('   3. Vänta på att cluster blir färdig (5-10 min)');
    }
    
    if (error.message.includes('SSL') || error.message.includes('TLS')) {
      console.log('\n💡 Felsökning för SSL/TLS errors:');
      console.log('   1. Lägg till &ssl=true i connection string');
      console.log('   2. Kontrollera att du använder mongodb+srv:// prefix');
    }
    
    console.log('\n📋 Kontrollera:');
    console.log('   - MongoDB Atlas cluster är online');
    console.log('   - Environment variable MONGO_URI är korrekt satt');
    console.log('   - Network access tillåter anslutningar');
    console.log('   - Database user har rätt behörigheter');
  }
}

// Kör testet
testMongoConnection();
