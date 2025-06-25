#!/usr/bin/env node

// Interactive Admin Client Onboarding CLI
// Run this script to interactively onboard new clients

import readline from 'readline';
import { onboardClient } from './admin-onboard-client.js';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

function validateDomain(domain) {
  const re = /^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]\.[a-zA-Z]{2,}$/;
  return re.test(domain);
}

async function collectClientInfo() {
  console.log('🏢 Zector Digital CRM - Interactive Client Onboarding');
  console.log('='.repeat(55));
  console.log('Please provide the following information about your new client:\n');

  const clientInfo = {};

  // Company Information
  console.log('📋 COMPANY INFORMATION:');
  clientInfo.name = await question('Company Name: ');
  
  let domain;
  do {
    domain = await question('Company Domain (e.g., acme.com): ');
    if (!validateDomain(domain)) {
      console.log('❌ Please enter a valid domain (e.g., company.com)');
    }
  } while (!validateDomain(domain));
  clientInfo.domain = domain;

  // Plan Selection
  console.log('\n📦 PLAN SELECTION:');
  console.log('1. Starter (10K visits/month, 3 users, $29/month)');
  console.log('2. Professional (50K visits/month, 10 users, $99/month)');
  console.log('3. Enterprise (250K visits/month, 50 users, $299/month)');
  
  let planChoice;
  do {
    planChoice = await question('Select plan (1-3): ');
  } while (!['1', '2', '3'].includes(planChoice));
  
  const plans = { '1': 'starter', '2': 'professional', '3': 'enterprise' };
  clientInfo.plan = plans[planChoice];

  // Admin User Information
  console.log('\n👤 ADMIN USER INFORMATION:');
  clientInfo.adminFirstName = await question('Admin First Name: ');
  clientInfo.adminLastName = await question('Admin Last Name: ');
  clientInfo.adminName = `${clientInfo.adminFirstName} ${clientInfo.adminLastName}`;
  
  let adminEmail;
  do {
    adminEmail = await question('Admin Email: ');
    if (!validateEmail(adminEmail)) {
      console.log('❌ Please enter a valid email address');
    }
  } while (!validateEmail(adminEmail));
  clientInfo.adminEmail = adminEmail;

  clientInfo.adminPhone = await question('Admin Phone (optional): ') || '';

  // Optional Information
  console.log('\n🎨 CUSTOMIZATION (Optional):');
  clientInfo.brandColor = await question('Brand Color (hex, e.g., #0066cc): ') || '#0066cc';
  clientInfo.timezone = await question('Timezone (e.g., America/New_York): ') || 'UTC';
  clientInfo.address = await question('Company Address (optional): ') || '';

  return clientInfo;
}

async function confirmDetails(clientInfo) {
  console.log('\n📋 CONFIRMATION - Please review the details:');
  console.log('='.repeat(50));
  console.log(`Company: ${clientInfo.name}`);
  console.log(`Domain: ${clientInfo.domain}`);
  console.log(`Plan: ${clientInfo.plan.toUpperCase()}`);
  console.log(`Admin: ${clientInfo.adminName}`);
  console.log(`Email: ${clientInfo.adminEmail}`);
  console.log(`Phone: ${clientInfo.adminPhone || 'Not provided'}`);
  console.log(`Brand Color: ${clientInfo.brandColor}`);
  console.log(`Timezone: ${clientInfo.timezone}`);
  console.log(`Address: ${clientInfo.address || 'Not provided'}`);
  
  const confirm = await question('\n✅ Create this client? (y/n): ');
  return confirm.toLowerCase() === 'y' || confirm.toLowerCase() === 'yes';
}

async function saveClientInfo(clientInfo, result) {
  const fs = await import('fs');
  const path = await import('path');
  
  const clientSummary = {
    onboardedAt: new Date().toISOString(),
    client: clientInfo,
    tenant: {
      tenantId: result.tenant.tenantId,
      status: result.tenant.status,
      plan: result.tenant.plan
    },
    admin: {
      email: result.admin.user.email,
      temporaryPassword: result.admin.temporaryPassword,
      userId: result.admin.user.userId
    },
    trackingScript: result.trackingScript,
    dashboardUrl: 'https://zector-digital-crm-leads.vercel.app'
  };

  const filename = `client-${result.tenant.tenantId}-${Date.now()}.json`;
  const filepath = path.join(process.cwd(), 'onboarded-clients', filename);
  
  // Create directory if it doesn't exist
  const dir = path.dirname(filepath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  
  fs.writeFileSync(filepath, JSON.stringify(clientSummary, null, 2));
  
  console.log(`💾 Client information saved to: ${filepath}`);
  return filepath;
}

async function main() {
  try {
    // Collect client information
    const clientInfo = await collectClientInfo();
    
    // Confirm details
    const confirmed = await confirmDetails(clientInfo);
    if (!confirmed) {
      console.log('❌ Onboarding cancelled.');
      rl.close();
      return;
    }

    console.log('\n🚀 Creating client tenant...');
    
    // Onboard the client
    const result = await onboardClient(clientInfo);
    
    // Save client information to file
    const savedFile = await saveClientInfo(clientInfo, result);
    
    console.log('\n🎉 CLIENT ONBOARDING SUCCESSFUL!');
    console.log('='.repeat(50));
    
    console.log('\n📧 SEND THESE DETAILS TO YOUR CLIENT:');
    console.log('-'.repeat(40));
    console.log('Dashboard URL: https://zector-digital-crm-leads.vercel.app');
    console.log(`Login Email: ${result.admin.user.email}`);
    console.log(`Temporary Password: ${result.admin.temporaryPassword}`);
    console.log(`Tenant ID: ${result.tenant.tenantId}`);
    
    console.log('\n📝 TRACKING SCRIPT FOR THEIR WEBSITE:');
    console.log('-'.repeat(40));
    console.log(result.trackingScript);
    
    console.log('\n📋 NEXT STEPS:');
    console.log('1. Send login credentials to client');
    console.log('2. Provide tracking script installation guide');
    console.log('3. Schedule onboarding call');
    console.log('4. Monitor initial setup');
    
    console.log(`\n💾 Full details saved to: ${savedFile}`);
    
  } catch (error) {
    console.error('\n❌ Onboarding failed:', error.message);
    console.error('Please check your MongoDB connection and try again.');
  } finally {
    rl.close();
  }
}

// Run the interactive onboarding
main();
