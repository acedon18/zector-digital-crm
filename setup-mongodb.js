#!/usr/bin/env node

// Quick MongoDB Setup Script för Zector Digital Leads CRM
import { exec } from 'child_process';
import { promisify } from 'util';
import { readFileSync, writeFileSync, existsSync } from 'fs';

const execAsync = promisify(exec);

console.log('🚀 Zector Digital CRM - MongoDB Setup Script');
console.log('===========================================\n');

async function setupMongoDB() {
  try {
    // 1. Kontrollera om MongoDB driver är installerad
    console.log('📦 Kontrollerar MongoDB dependencies...');
    
    const packageJsonPath = './package.json';
    if (existsSync(packageJsonPath)) {
      const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'));
      const hasMongodb = packageJson.dependencies?.mongodb || packageJson.devDependencies?.mongodb;
      
      if (!hasMongodb) {
        console.log('⬇️ Installerar MongoDB driver...');
        await execAsync('npm install mongodb');
        console.log('✅ MongoDB driver installerad');
      } else {
        console.log('✅ MongoDB driver redan installerad');
      }
    }
    
    // 2. Kontrollera environment fil
    console.log('\n🔧 Kontrollerar environment configuration...');
    
    const envLocalPath = './.env.local';
    const envExamplePath = './.env.example';
    
    if (!existsSync(envLocalPath)) {
      console.log('📄 Skapar .env.local fil...');
      
      let envTemplate = '';
      if (existsSync(envExamplePath)) {
        envTemplate = readFileSync(envExamplePath, 'utf8');
      } else {
        envTemplate = `# MongoDB Configuration
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/?retryWrites=true&w=majority
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/?retryWrites=true&w=majority

# Real Data Configuration
VITE_USE_REAL_DATA=true
VITE_API_ENDPOINT=http://localhost:3000
`;
      }
      
      writeFileSync(envLocalPath, envTemplate);
      console.log('✅ .env.local skapad');
      console.log('⚠️  Du måste uppdatera MONGO_URI med din riktiga connection string');
    } else {
      console.log('✅ .env.local finns redan');
    }
    
    // 3. Kontrollera dotenv
    console.log('\n📦 Kontrollerar dotenv dependency...');
    const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'));
    const hasDotenv = packageJson.dependencies?.dotenv || packageJson.devDependencies?.dotenv;
    
    if (!hasDotenv) {
      console.log('⬇️ Installerar dotenv...');
      await execAsync('npm install dotenv');
      console.log('✅ dotenv installerad');
    } else {
      console.log('✅ dotenv redan installerad');
    }
    
    console.log('\n🎯 Nästa steg:');
    console.log('1. Skapa MongoDB Atlas account på https://cloud.mongodb.com');
    console.log('2. Skapa en cluster (gratis M0 tier)');
    console.log('3. Skapa database user och få connection string');
    console.log('4. Uppdatera MONGO_URI i .env.local med din connection string');
    console.log('5. Kör: node test-mongodb.js för att testa anslutningen');
    
    console.log('\n📖 För detaljerade instruktioner, läs: MONGODB-SETUP-GUIDE.md');
    
  } catch (error) {
    console.error('❌ Setup misslyckades:', error.message);
  }
}

setupMongoDB();
