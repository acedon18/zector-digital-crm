#!/usr/bin/env node

// Admin Client Onboarding Script for Zector Digital CRM
// This script helps you quickly onboard new clients as tenants

import { MongoClient } from 'mongodb';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';
import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
config({ path: join(__dirname, '..', '.env.local') });
config({ path: join(__dirname, '..', '.env') });

console.log('🏢 Zector Digital CRM - Client Onboarding Tool');
console.log('='.repeat(50));

// Configuration
const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI;

if (!MONGO_URI) {
  console.log('❌ MongoDB connection required. Set MONGO_URI in .env.local');
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

function generateTenantId(companyName) {
  return companyName
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, '-')
    .substring(0, 20) + '-' + Math.random().toString(36).substring(2, 8);
}

function generateTemporaryPassword() {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
  let password = '';
  for (let i = 0; i < 12; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

function generateTrackingScript(tenantId, domain) {
  return `<!-- Zector Digital Lead Tracking Script for ${domain} -->
<script>
(function() {
  var script = document.createElement('script');
  script.src = 'https://zector-digital-crm-leads.vercel.app/tracking.js';
  script.setAttribute('data-tenant-id', '${tenantId}');
  script.setAttribute('data-domain', '${domain}');
  script.setAttribute('data-track-leads', 'true');
  script.async = true;
  document.head.appendChild(script);
})();
</script>`;
}

async function createTenant(db, clientInfo) {
  const tenantId = generateTenantId(clientInfo.name);
  const tenant = {
    tenantId,
    name: clientInfo.name,
    domain: clientInfo.domain,
    plan: clientInfo.plan || 'professional',
    status: 'active',
    createdAt: new Date(),
    settings: {
      brandColor: clientInfo.brandColor || '#0066cc',
      logo: clientInfo.logo || '',
      customDomain: clientInfo.customDomain || '',
      timezone: clientInfo.timezone || 'UTC'
    },
    limits: getPlanLimits(clientInfo.plan || 'professional'),
    usage: {
      monthlyVisits: 0,
      totalUsers: 0,
      storageUsed: 0,
      apiCalls: 0,
      lastUpdated: new Date()
    },
    contact: {
      email: clientInfo.adminEmail,
      phone: clientInfo.phone || '',
      address: clientInfo.address || ''
    },
    billing: {
      plan: clientInfo.plan || 'professional',
      status: 'trial', // trial, active, suspended
      trialEndsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    }
  };

  await db.collection('tenants').insertOne(tenant);
  return tenant;
}

async function createAdminUser(db, tenantId, adminInfo) {
  const temporaryPassword = generateTemporaryPassword();
  const hashedPassword = await bcrypt.hash(temporaryPassword, 10);
  
  const user = {
    userId: uuidv4(),
    tenantId,
    email: adminInfo.email,
    name: adminInfo.name,
    role: 'admin',
    permissions: [
      'read', 'write', 'delete', 
      'manage_users', 'manage_settings', 
      'view_analytics', 'export_data'
    ],
    password: hashedPassword,
    status: 'active',
    createdAt: new Date(),
    lastLogin: null,
    profile: {
      firstName: adminInfo.firstName || adminInfo.name.split(' ')[0],
      lastName: adminInfo.lastName || adminInfo.name.split(' ').slice(1).join(' '),
      phone: adminInfo.phone || '',
      timezone: adminInfo.timezone || 'UTC'
    },
    settings: {
      emailNotifications: true,
      dashboardLanguage: 'en',
      theme: 'light'
    }
  };

  await db.collection('users').insertOne(user);
  return { user, temporaryPassword };
}

function getPlanLimits(plan) {
  const plans = {
    starter: {
      monthlyVisits: 10000,
      users: 3,
      dataRetentionDays: 90,
      apiCallsPerMonth: 5000,
      customBranding: false,
      advancedAnalytics: false
    },
    professional: {
      monthlyVisits: 50000,
      users: 10,
      dataRetentionDays: 365,
      apiCallsPerMonth: 25000,
      customBranding: true,
      advancedAnalytics: true
    },
    enterprise: {
      monthlyVisits: 250000,
      users: 50,
      dataRetentionDays: 1095, // 3 years
      apiCallsPerMonth: 100000,
      customBranding: true,
      advancedAnalytics: true,
      whiteLabel: true,
      customDomain: true
    }
  };
  
  return plans[plan] || plans.professional;
}

function createWelcomePackage(tenant, admin, trackingScript) {
  return {
    welcomeEmail: {
      to: admin.user.email,
      subject: `Welcome to Zector Digital CRM - ${tenant.name} Setup Complete!`,
      html: `
        <h2>Welcome to Zector Digital CRM!</h2>
        <p>Your lead tracking system for <strong>${tenant.name}</strong> is now ready to go!</p>
        
        <h3>🔑 Your Login Details:</h3>
        <ul>
          <li><strong>Dashboard:</strong> <a href="https://zector-digital-crm-leads.vercel.app">https://zector-digital-crm-leads.vercel.app</a></li>
          <li><strong>Email:</strong> ${admin.user.email}</li>
          <li><strong>Temporary Password:</strong> ${admin.temporaryPassword}</li>
          <li><strong>Tenant ID:</strong> ${tenant.tenantId}</li>
        </ul>
        
        <h3>🚀 Quick Setup Steps:</h3>
        <ol>
          <li>Login to your dashboard with the credentials above</li>
          <li>Change your password (you'll be prompted)</li>
          <li>Add the tracking script to your website</li>
          <li>Watch your leads come in!</li>
        </ol>
        
        <h3>📊 Your Plan Details:</h3>
        <ul>
          <li><strong>Plan:</strong> ${tenant.plan.toUpperCase()}</li>
          <li><strong>Monthly Visits:</strong> ${tenant.limits.monthlyVisits.toLocaleString()}</li>
          <li><strong>Users:</strong> ${tenant.limits.users}</li>
          <li><strong>Data Retention:</strong> ${tenant.limits.dataRetentionDays} days</li>
          <li><strong>Trial Period:</strong> 30 days</li>
        </ul>
        
        <p><strong>Need help?</strong> Reply to this email or contact our support team.</p>
        <p>Best regards,<br>Zector Digital Team</p>
      `
    },
    installationGuide: {
      title: `Installation Guide for ${tenant.name}`,
      trackingScript,
      steps: [
        'Add the tracking script to your website\'s <head> section',
        'Verify installation by visiting your website and checking the dashboard',
        'Configure email alerts for new leads',
        'Customize your dashboard settings'
      ]
    },
    supportInfo: {
      dashboardUrl: 'https://zector-digital-crm-leads.vercel.app',
      supportEmail: 'support@zectordigital.com',
      documentationUrl: 'https://docs.zectordigital.com'
    }
  };
}

async function onboardClient(clientInfo) {
  let client, db;
  
  try {
    console.log('🔌 Connecting to database...');
    ({ client, db } = await connectToDatabase());
    
    console.log(`🏢 Creating tenant for: ${clientInfo.name}`);
    const tenant = await createTenant(db, clientInfo);
    
    console.log(`👤 Creating admin user: ${clientInfo.adminName}`);
    const admin = await createAdminUser(db, tenant.tenantId, {
      email: clientInfo.adminEmail,
      name: clientInfo.adminName,
      firstName: clientInfo.adminFirstName,
      lastName: clientInfo.adminLastName,
      phone: clientInfo.adminPhone,
      timezone: clientInfo.timezone
    });
    
    console.log('📝 Generating tracking script...');
    const trackingScript = generateTrackingScript(tenant.tenantId, tenant.domain);
    
    console.log('📦 Creating welcome package...');
    const welcomePackage = createWelcomePackage(tenant, admin, trackingScript);
    
    // Success summary
    console.log('\n✅ CLIENT ONBOARDING COMPLETE!');
    console.log('='.repeat(50));
    console.log(`🏢 Tenant: ${tenant.name}`);
    console.log(`🆔 Tenant ID: ${tenant.tenantId}`);
    console.log(`🌐 Domain: ${tenant.domain}`);
    console.log(`📦 Plan: ${tenant.plan}`);
    console.log(`👤 Admin: ${admin.user.name} (${admin.user.email})`);
    console.log(`🔑 Temp Password: ${admin.temporaryPassword}`);
    console.log(`📊 Dashboard: https://zector-digital-crm-leads.vercel.app`);
    
    console.log('\n📋 NEXT STEPS:');
    console.log('1. Send welcome email to client');
    console.log('2. Provide tracking script for website installation');
    console.log('3. Schedule onboarding call if needed');
    console.log('4. Monitor initial setup and usage');
    
    return {
      tenant,
      admin,
      trackingScript,
      welcomePackage
    };
    
  } catch (error) {
    console.error('❌ Onboarding failed:', error.message);
    throw error;
  } finally {
    if (client) {
      await client.close();
    }
  }
}

// Example usage - you can modify this or call the function with your own data
async function main() {
  const exampleClient = {
    name: 'Acme Corporation',
    domain: 'acme.com',
    plan: 'professional', // starter, professional, enterprise
    adminName: 'John Smith',
    adminFirstName: 'John',
    adminLastName: 'Smith',
    adminEmail: 'admin@acme.com',
    adminPhone: '+1-555-123-4567',
    brandColor: '#0066cc',
    timezone: 'America/New_York',
    address: '123 Business St, City, State 12345'
  };
  
  console.log('🎯 DEMO: Onboarding sample client...\n');
  
  try {
    const result = await onboardClient(exampleClient);
    
    console.log('\n📄 TRACKING SCRIPT TO SEND TO CLIENT:');
    console.log('-'.repeat(50));
    console.log(result.trackingScript);
    console.log('-'.repeat(50));
    
  } catch (error) {
    console.error('Demo failed:', error.message);
  }
}

// Export for use as a module
export { onboardClient, createTenant, createAdminUser, generateTrackingScript };

// Run demo if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
