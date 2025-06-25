#!/usr/bin/env node

// Quick Demo: Admin Onboarding Process
// This shows exactly how you would onboard a new client

import { MongoClient } from 'mongodb';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';

const MONGO_URI = 'mongodb+srv://zector:b9yyEkABZVUjJucO@zectorleadcrm.27lnmjh.mongodb.net/zector_crm?retryWrites=true&w=majority';

console.log('🎯 DEMO: Admin Client Onboarding Process');
console.log('=' * 50);

// Demo client information
const demoClient = {
  name: 'Demo Corp Inc',
  domain: 'democorp.com',
  plan: 'professional',
  adminName: 'Jane Doe',
  adminEmail: 'admin@democorp.com',
  adminPhone: '+1-555-987-6543'
};

async function demoOnboarding() {
  const client = new MongoClient(MONGO_URI);
  
  try {
    await client.connect();
    const db = client.db();
    
    console.log('✅ Connected to MongoDB');
    
    // Step 1: Create Tenant
    const tenantId = `democorp-${Math.random().toString(36).substring(2, 8)}`;
    const tenant = {
      tenantId,
      name: demoClient.name,
      domain: demoClient.domain,
      plan: demoClient.plan,
      status: 'active',
      createdAt: new Date(),
      settings: {
        brandColor: '#0066cc',
        timezone: 'UTC'
      },
      limits: {
        monthlyVisits: 50000,
        users: 10,
        dataRetentionDays: 365
      }
    };
    
    await db.collection('tenants').insertOne(tenant);
    console.log(`✅ Created tenant: ${tenant.name} (${tenantId})`);
    
    // Step 2: Create Admin User
    const temporaryPassword = 'TempPass' + Math.random().toString(36).substring(2, 8);
    const hashedPassword = await bcrypt.hash(temporaryPassword, 10);
    
    const adminUser = {
      userId: uuidv4(),
      tenantId,
      email: demoClient.adminEmail,
      name: demoClient.adminName,
      role: 'admin',
      permissions: ['read', 'write', 'delete', 'manage_users', 'manage_settings'],
      password: hashedPassword,
      status: 'active',
      createdAt: new Date()
    };
    
    await db.collection('users').insertOne(adminUser);
    console.log(`✅ Created admin user: ${adminUser.name} (${adminUser.email})`);
    
    // Step 3: Generate Tracking Script
    const trackingScript = `<!-- Zector Digital Lead Tracking Script for ${demoClient.domain} -->
<script>
(function() {
  var script = document.createElement('script');
  script.src = 'https://zector-digital-crm-leads.vercel.app/tracking.js';
  script.setAttribute('data-tenant-id', '${tenantId}');
  script.setAttribute('data-domain', '${demoClient.domain}');
  script.setAttribute('data-track-leads', 'true');
  script.async = true;
  document.head.appendChild(script);
})();
</script>`;
    
    console.log('✅ Generated custom tracking script');
    
    // Summary
    console.log('\n🎉 CLIENT ONBOARDING COMPLETE!');
    console.log('=' * 40);
    console.log(`Company: ${tenant.name}`);
    console.log(`Domain: ${tenant.domain}`);
    console.log(`Tenant ID: ${tenantId}`);
    console.log(`Plan: ${tenant.plan.toUpperCase()}`);
    console.log(`Admin: ${adminUser.name}`);
    console.log(`Email: ${adminUser.email}`);
    console.log(`Temp Password: ${temporaryPassword}`);
    console.log(`Dashboard: https://zector-digital-crm-leads.vercel.app`);
    
    console.log('\n📧 SEND TO CLIENT:');
    console.log('-' * 30);
    console.log('Subject: Welcome to Zector Digital CRM!');
    console.log('');
    console.log('Hi Jane,');
    console.log('');
    console.log('Your lead tracking system is ready!');
    console.log('');
    console.log('Login Details:');
    console.log(`- Dashboard: https://zector-digital-crm-leads.vercel.app`);
    console.log(`- Email: ${adminUser.email}`);
    console.log(`- Password: ${temporaryPassword}`);
    console.log('');
    console.log('Add this tracking script to your website:');
    console.log('');
    console.log(trackingScript);
    console.log('');
    console.log('Best regards,');
    console.log('Zector Digital Team');
    
    console.log('\n📊 WHAT HAPPENS NEXT:');
    console.log('1. Client logs in and changes password');
    console.log('2. Client installs tracking script on website');
    console.log('3. Lead tracking starts immediately');
    console.log('4. Client can add team members');
    console.log('5. Analytics and reports available 24/7');
    
  } catch (error) {
    console.error('❌ Demo failed:', error.message);
  } finally {
    await client.close();
  }
}

// Run the demo
demoOnboarding();
