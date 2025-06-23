// Inspektera befintliga data i MongoDB
import { MongoClient } from 'mongodb';
import 'dotenv/config';

const MONGO_URI = process.env.MONGO_URI;

async function inspectData() {
  try {
    const client = new MongoClient(MONGO_URI);
    await client.connect();
    const db = client.db();
    
    console.log('🔍 Inspekterar befintliga data...\n');
    
    // Kolla companies
    console.log('🏢 COMPANIES COLLECTION:');
    const companies = await db.collection('companies').find({}).limit(10).toArray();
    console.log(`📊 Totalt: ${companies.length} companies`);
    companies.forEach((company, i) => {
      console.log(`${i+1}. ${company.name || 'Unnamed'} (${company.domain || 'No domain'})`);
      console.log(`   Industry: ${company.industry || 'Unknown'}`);
      console.log(`   Last Visit: ${company.lastVisit || 'Never'}`);
      console.log(`   Visits: ${company.totalVisits || 0}`);
      console.log('');
    });
    
    // Kolla visits/tracking
    console.log('📈 VISITS COLLECTION:');
    const visits = await db.collection('visits').find({}).limit(5).toArray();
    console.log(`📊 Totalt: ${visits.length} visits`);
    visits.forEach((visit, i) => {
      console.log(`${i+1}. ${visit.url || 'No URL'} - ${visit.timestamp || 'No timestamp'}`);
    });
    
    // Kolla customers
    console.log('\n👥 CUSTOMERS COLLECTION:');
    const customers = await db.collection('customers').find({}).limit(5).toArray();
    console.log(`📊 Totalt: ${customers.length} customers`);
    customers.forEach((customer, i) => {
      console.log(`${i+1}. ${customer.email || 'No email'} - ${customer.name || 'No name'}`);
    });
    
    // Kolla tracking scripts
    console.log('\n📜 TRACKINGSCRIPTS COLLECTION:');
    const scripts = await db.collection('trackingscripts').find({}).limit(3).toArray();
    console.log(`📊 Totalt: ${scripts.length} tracking scripts`);
    
    await client.close();
    
  } catch (error) {
    console.error('❌ Fel:', error.message);
  }
}

inspectData();
