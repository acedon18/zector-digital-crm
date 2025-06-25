# 🏢 Multi-Tenant CRM Migration Plan

## 🎯 Implementation Progress Status

### ✅ COMPLETED (Phase 1)
- [x] **Backend API Infrastructure**
  - ✅ Tenant Management API (`/api/tenants`)
  - ✅ User Management API (`/api/users`)
  - ✅ Multi-tenant Visits API (`/api/visits`)
  - ✅ Authentication API (`/api/auth/login`)
  - ✅ Updated tracking API with tenant support
  - ✅ Updated companies API with tenant filtering

- [x] **Frontend Components**
  - ✅ TenantContext with React hooks
  - ✅ TenantOnboarding component
  - ✅ TenantSwitcher component
  - ✅ Multi-tenant API utilities

- [x] **Tracking Script Updates**
  - ✅ Added tenantId support to tracking script
  - ✅ Multi-tenant data collection

### 🚧 IN PROGRESS (Phase 2)
- [ ] **Database Migration Scripts**
  - [ ] Migration script for existing data
  - [ ] Index optimization for tenant queries
  - [ ] Data cleanup and validation

- [ ] **Authentication & Authorization**
  - [ ] JWT middleware for API protection
  - [ ] Role-based access control
  - [ ] Session management

### 📋 PENDING (Phase 3)
- [ ] **Frontend Integration**
  - [ ] Login/Register pages
  - [ ] Tenant dashboard integration
  - [ ] User management UI
  - [ ] Plan limits enforcement

- [ ] **Advanced Features**
  - [ ] Subdomain routing
  - [ ] Custom branding per tenant
  - [ ] Billing integration
  - [ ] Usage analytics per tenant

## Overview
Transform the current single-tenant Zector Digital CRM into a multi-tenant SaaS platform supporting multiple clients.

## Current State
- Single `customerId` field for data isolation
- MongoDB collections: `visits`, `companies`, `events`
- Hardcoded tracking domains and API keys
- Single frontend dashboard

## Target Architecture

### 1. Database Schema Changes

#### New Collections:
```javascript
// tenants collection
{
  _id: ObjectId,
  tenantId: "tenant_uuid_here",
  name: "Client Company Name",
  domain: "clientcompany.com",
  subdomain: "clientcompany", // for clientcompany.zectorcrm.com
  plan: "starter|professional|enterprise",
  
  // Subscription
  subscription: {
    status: "active|trial|suspended|cancelled",
    startDate: ISODate,
    endDate: ISODate,
    trialEnd: ISODate,
    billingCycle: "monthly|yearly"
  },
  
  // Configuration
  settings: {
    trackingDomains: ["clientcompany.com", "blog.clientcompany.com"],
    apiKeys: {
      clearbit: "...",
      hunter: "...",
      ipinfo: "..."
    },
    branding: {
      logo: "https://...",
      primaryColor: "#ff6b35",
      customDomain: "crm.clientcompany.com"
    },
    gdpr: {
      enabled: true,
      cookiePolicy: "https://...",
      privacyPolicy: "https://..."
    }
  },
  
  createdAt: ISODate,
  updatedAt: ISODate
}

// tenant_users collection
{
  _id: ObjectId,
  tenantId: "tenant_uuid_here",
  email: "admin@clientcompany.com",
  name: "John Doe",
  role: "owner|admin|viewer",
  permissions: ["view_analytics", "export_data", "manage_settings"],
  hashedPassword: "...",
  isActive: true,
  lastLogin: ISODate,
  createdAt: ISODate
}
```

#### Updated Existing Collections:
```javascript
// visits collection - ADD tenantId
{
  _id: ObjectId,
  tenantId: "tenant_uuid_here",    // NEW: Tenant isolation
  sessionId: "...",
  customerId: "...",               // Keep for backward compatibility
  domain: "...",
  // ... existing fields
}

// companies collection - ADD tenantId
{
  _id: ObjectId,
  tenantId: "tenant_uuid_here",    // NEW: Tenant isolation
  name: "Company Name",
  domain: "company.com",
  // ... existing fields
}

// events collection - ADD tenantId
{
  _id: ObjectId,
  tenantId: "tenant_uuid_here",    // NEW: Tenant isolation
  sessionId: "...",
  // ... existing fields
}
```

### 2. API Changes

#### New Endpoints:
- `POST /api/tenants` - Create new tenant
- `GET /api/tenants/:tenantId` - Get tenant info
- `PUT /api/tenants/:tenantId` - Update tenant settings
- `POST /api/auth/login` - Tenant user login
- `POST /api/auth/register` - Register new tenant
- `GET /api/tenants/:tenantId/tracking-script` - Generate custom tracking script

#### Updated Endpoints:
- `GET /api/companies?tenantId=xxx` - Filter by tenant
- `GET /api/visitors?tenantId=xxx` - Filter by tenant
- `POST /api/track` - Accept tenantId in payload

### 3. Frontend Changes

#### New Features:
- **Multi-tenant authentication system**
- **Tenant onboarding flow**
- **Tenant settings management**
- **Custom branding per tenant**
- **Subdomain routing** (`clientname.zectorcrm.com`)

#### Updated Features:
- **Dashboard filters by tenantId**
- **API calls include tenant context**
- **User management per tenant**

### 4. Tracking Script Changes
- **Dynamic tenant detection**
- **Tenant-specific API endpoints**
- **Custom domain support**

## Implementation Phases

### Phase 1: Database Migration (Day 1-2)
1. Create tenant and tenant_users collections
2. Add tenantId to existing collections
3. Migrate existing data to default tenant
4. Create database indexes for performance

### Phase 2: Backend API Updates (Day 3-4)
1. Update tracking API to handle tenantId
2. Create tenant management APIs
3. Add authentication/authorization
4. Update companies/visitors APIs

### Phase 3: Frontend Refactoring (Day 5-6)
1. Add authentication system
2. Create tenant onboarding flow
3. Update dashboard for multi-tenant
4. Add tenant settings page

### Phase 4: Deployment & Testing (Day 7)
1. Deploy updated system
2. Test multi-tenant isolation
3. Create demo tenants
4. Document new features

## Migration Script Preview

```javascript
// MongoDB migration script
use('zector_crm_db');

// 1. Create default tenant for existing data
const defaultTenant = {
  tenantId: "default_zector_digital",
  name: "Zector Digital (Default)",
  domain: "zectordigital.es",
  subdomain: "default",
  plan: "enterprise",
  subscription: {
    status: "active",
    startDate: new Date(),
    billingCycle: "yearly"
  },
  settings: {
    trackingDomains: ["zectordigital.es"],
    branding: {
      primaryColor: "#3b82f6"
    },
    gdpr: {
      enabled: true
    }
  },
  createdAt: new Date(),
  updatedAt: new Date()
};

db.tenants.insertOne(defaultTenant);

// 2. Add tenantId to existing visits
db.visits.updateMany(
  { tenantId: { $exists: false } },
  { $set: { tenantId: "default_zector_digital" } }
);

// 3. Add tenantId to existing companies
db.companies.updateMany(
  { tenantId: { $exists: false } },
  { $set: { tenantId: "default_zector_digital" } }
);

// 4. Create indexes for performance
db.visits.createIndex({ tenantId: 1 });
db.companies.createIndex({ tenantId: 1 });
db.tenants.createIndex({ tenantId: 1 }, { unique: true });
db.tenants.createIndex({ subdomain: 1 }, { unique: true });
```

## Benefits After Migration

### For You (Zector Digital):
- 🏢 **Multiple client support** - Onboard unlimited clients
- 💰 **SaaS revenue model** - Recurring subscription income
- 📊 **Usage analytics** - Track per-tenant usage and performance
- 🔧 **Easy client management** - Centralized tenant administration

### For Your Clients:
- 🔒 **Data isolation** - Complete privacy and security
- 🎨 **Custom branding** - White-label dashboard with their colors/logo
- 🌐 **Custom domains** - Use their own domain for the CRM
- 👥 **Team management** - Multiple users per organization
- 📈 **Scalable plans** - Starter to Enterprise packages

### Technical Benefits:
- 🏗️ **Scalable architecture** - Handle thousands of tenants
- 🔐 **Secure multi-tenancy** - Proper data isolation
- 🚀 **Easy deployment** - Subdomain-based routing
- 🔧 **Maintainable code** - Clean separation of concerns

## Next Steps
1. **Review and approve this plan**
2. **Begin Phase 1: Database migration**
3. **Set up development environment for multi-tenant testing**
4. **Create first demo tenant for testing**

Let me know when you're ready to start implementing! 🚀
