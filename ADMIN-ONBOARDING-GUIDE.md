# 🏢 Admin Guide: Client/Tenant Onboarding Workflow

## Overview
As the admin of Zector Digital CRM, you have multiple ways to onboard new clients as tenants. Each tenant gets their own isolated environment with their own users, data, and settings.

## 🎯 Onboarding Methods

### Method 1: Admin Dashboard (Recommended)
Direct admin control with full customization

### Method 2: Self-Service Onboarding
Client fills out the onboarding form themselves

### Method 3: API-Based Setup
Programmatic tenant creation for bulk operations

---

## 📋 Method 1: Admin Dashboard Workflow

### Step 1: Create New Tenant (Admin Action)
```javascript
// POST /api/tenants
{
  "name": "Client Company Name",
  "domain": "clientdomain.com", 
  "plan": "professional", // starter, professional, enterprise
  "settings": {
    "brandColor": "#0066cc",
    "logo": "https://clientdomain.com/logo.png",
    "customDomain": "tracking.clientdomain.com"
  },
  "limits": {
    "monthlyVisits": 50000,
    "users": 10,
    "dataRetentionDays": 365
  }
}
```

### Step 2: Create Client Admin User
```javascript
// POST /api/users
{
  "tenantId": "client-tenant-001",
  "email": "admin@clientdomain.com",
  "name": "Client Admin Name",
  "role": "admin",
  "password": "temporary_password_123"
}
```

### Step 3: Generate Tracking Script
```html
<!-- Custom tracking script for client -->
<script>
(function() {
  var script = document.createElement('script');
  script.src = 'https://your-domain.com/tracking.js';
  script.setAttribute('data-tenant-id', 'client-tenant-001');
  script.setAttribute('data-domain', 'clientdomain.com');
  document.head.appendChild(script);
})();
</script>
```

### Step 4: Send Welcome Package
- Login credentials
- Tracking script installation guide
- Dashboard tour link
- Support contact information

---

## 🔄 Method 2: Self-Service Onboarding

### Client Experience:
1. **Landing Page**: Client visits your signup page
2. **Company Info**: Basic details and domain verification
3. **Plan Selection**: Choose subscription tier
4. **Admin Setup**: Create their admin account
5. **Tracking Setup**: Get their custom tracking script

### Admin Approval Process:
- Review new tenant applications
- Verify domain ownership
- Approve/reject signups
- Set custom limits if needed

---

## 🤖 Method 3: API-Based Bulk Setup

### Batch Tenant Creation Script:
```javascript
// scripts/bulk-onboard-clients.js
const clients = [
  {
    name: "Acme Corp",
    domain: "acme.com",
    adminEmail: "admin@acme.com",
    plan: "professional"
  },
  {
    name: "Beta Industries", 
    domain: "beta.com",
    adminEmail: "admin@beta.com",
    plan: "enterprise"
  }
];

for (const client of clients) {
  // Create tenant
  const tenant = await createTenant(client);
  
  // Create admin user
  const admin = await createTenantAdmin(tenant.tenantId, client.adminEmail);
  
  // Generate tracking script
  const script = generateTrackingScript(tenant.tenantId, client.domain);
  
  // Send welcome email
  await sendWelcomeEmail(client, admin.password, script);
}
```

---

## 🎨 Admin Dashboard Features

### Tenant Management Panel:
- **Tenant List**: View all clients with status indicators
- **Usage Analytics**: Monitor per-tenant resource usage
- **Plan Management**: Upgrade/downgrade client plans
- **Support Tools**: Access client environments for support

### Key Admin Actions:
1. **Create Tenant** → Instant isolated environment
2. **Set Limits** → Control resource usage per plan
3. **Manage Users** → Add/remove users for any tenant
4. **Monitor Usage** → Track visits, API calls, storage
5. **Generate Reports** → Client performance summaries
6. **Handle Support** → Switch context to any tenant

---

## 🔧 Technical Implementation

### Database Structure:
```javascript
// Tenants Collection
{
  tenantId: "client-001",
  name: "Client Name",
  domain: "client.com",
  plan: "professional",
  status: "active", // active, suspended, trial
  createdAt: "2025-06-25T10:00:00Z",
  settings: { /* custom branding */ },
  limits: { /* plan limits */ },
  usage: { /* current usage stats */ }
}

// Users Collection  
{
  userId: "user-001",
  tenantId: "client-001", // Links user to tenant
  email: "admin@client.com",
  role: "admin", // admin, user, viewer
  permissions: ["read", "write", "manage_users"],
  lastLogin: "2025-06-25T10:00:00Z"
}

// Data Collections (visits, companies, etc.)
{
  // All data records include tenantId for isolation
  tenantId: "client-001",
  // ... rest of the data
}
```

### Security & Isolation:
- **Data Isolation**: Every query filtered by tenantId
- **API Security**: JWT tokens include tenant context
- **Role-Based Access**: Different permissions per tenant
- **Resource Limits**: Enforced at API level

---

## 📧 Client Communication Templates

### Welcome Email Template:
```
Subject: Welcome to Zector Digital CRM - Your Tracking System is Ready!

Hi [CLIENT_NAME],

Your lead tracking system is now set up and ready to go!

🔑 **Your Login Details:**
Dashboard: https://crm.zectordigital.com
Email: [ADMIN_EMAIL]
Password: [TEMP_PASSWORD]

📊 **Your Tracking Script:**
Add this code to your website's <head> section:
[CUSTOM_TRACKING_SCRIPT]

🎯 **What's Next:**
1. Login to your dashboard
2. Install the tracking script
3. Watch your leads come in!

Need help? Reply to this email or visit our support center.

Best regards,
Zector Digital Team
```

### Installation Guide Template:
```
# Quick Installation Guide for [CLIENT_NAME]

## Step 1: Add Tracking Script
Copy this code into your website's <head> section:
[TRACKING_SCRIPT]

## Step 2: Verify Installation  
1. Visit your website
2. Check your dashboard for test visits
3. Confirm tracking is working

## Step 3: Configure Alerts
Set up email notifications for new leads

## Support
- Dashboard: [DASHBOARD_URL]
- Support: support@zectordigital.com
- Documentation: [DOCS_URL]
```

---

## 🚀 Automated Onboarding Workflow

### Complete End-to-End Process:
1. **Lead Capture**: Prospect fills signup form
2. **Admin Review**: You approve the new tenant
3. **Auto-Setup**: System creates tenant + admin user
4. **Welcome Package**: Automated email with credentials
5. **Onboarding Call**: Optional setup assistance
6. **Go Live**: Client installs script and starts tracking

### Admin Notifications:
- New tenant signup requests
- Usage limit warnings
- Support ticket alerts
- Payment/billing updates

---

## 📊 Monitoring & Management

### Admin Dashboard Views:
- **Overview**: All tenants at a glance
- **Usage**: Resource consumption per client
- **Revenue**: Subscription and billing overview
- **Support**: Open tickets and issues
- **Analytics**: Platform-wide performance metrics

### Health Monitoring:
- Tenant-specific uptime monitoring
- API response times per tenant
- Database performance per tenant
- Alert system for issues

---

## 💡 Best Practices

### Onboarding Best Practices:
1. **Domain Verification**: Ensure client owns the domain
2. **Plan Matching**: Match plan to client needs
3. **Gradual Rollout**: Start with test environment
4. **Training Session**: Offer dashboard walkthrough
5. **Documentation**: Provide comprehensive guides

### Ongoing Management:
1. **Regular Check-ins**: Monitor client satisfaction
2. **Usage Reviews**: Optimize plans based on usage
3. **Feature Updates**: Notify clients of new features
4. **Support Proactively**: Address issues before they escalate

---

This system gives you complete control over client onboarding while providing multiple paths to accommodate different client types and your business processes!
