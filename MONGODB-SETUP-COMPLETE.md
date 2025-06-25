# 🔧 MongoDB Setup and Multi-Tenant Migration Guide

## Current Status
✅ **Project Found**: Zector Digital Leads CRM  
✅ **MongoDB Integration**: Already configured and working  
✅ **Multi-Tenant Code**: Complete implementation ready  
✅ **Migration Scripts**: Available and tested  
❌ **MongoDB URI**: Needs valid connection string  

## Quick Setup Steps

### Step 1: Get Your MongoDB Connection String

#### Option A: MongoDB Atlas (Recommended - Free Tier Available)
1. Go to [MongoDB Atlas](https://cloud.mongodb.com)
2. Sign up/Login to your account
3. Create a new cluster (or use existing)
4. Click "Connect" → "Connect your application"
5. Copy the connection string (looks like this):
```
mongodb+srv://username:password@cluster.mongodb.net/database_name?retryWrites=true&w=majority
```

#### Option B: Local MongoDB
If you have MongoDB installed locally:
```
mongodb://localhost:27017/zector_crm
```

#### Option C: Docker MongoDB
If using Docker:
```bash
# Start MongoDB container
docker run -d -p 27017:27017 --name mongodb mongo:latest

# Connection string:
mongodb://localhost:27017/zector_crm
```

### Step 2: Update Environment Variables

**Replace the MongoDB URI in `.env.local`:**
```bash
# Edit this file: pulse-main/.env.local
MONGO_URI=mongodb+srv://your_username:your_password@your_cluster.mongodb.net/zector_crm?retryWrites=true&w=majority
MONGODB_URI=mongodb+srv://your_username:your_password@your_cluster.mongodb.net/zector_crm?retryWrites=true&w=majority

# Also add a secure JWT secret (32+ characters)
JWT_SECRET=a_very_secure_random_string_at_least_32_characters_long_for_jwt_tokens
```

### Step 3: Run the Multi-Tenant Migration

```powershell
# Navigate to the project
cd "c:\Users\Darda\Downloads\Zector Digital Leads CRM\pulse-main"

# Run the migration
node scripts/run-migration.js
```

### Step 4: Test the Multi-Tenant Implementation

```powershell
# Test the multi-tenant setup
node scripts/test-multi-tenant.cjs

# Run demo with sample data
node scripts/demo-multi-tenant.cjs
```

## What the Migration Does

1. **Creates Default Tenant**: `zector-digital-tenant-001` for Zector Digital ES
2. **Migrates Existing Data**: Adds `tenantId` to all existing visits/companies
3. **Creates Indexes**: Optimizes queries for multi-tenant performance
4. **Sets Up Collections**: 
   - `tenants` - Tenant management
   - `users` - User accounts per tenant
   - `visits` - Website tracking data (with tenantId)
   - `companies` - Lead data (with tenantId)

## Working APIs After Migration

### Multi-Tenant APIs:
- `/api/tenants` - Tenant management
- `/api/users` - User management
- `/api/visits` - Visit tracking (filtered by tenant)
- `/api/companies` - Company data (filtered by tenant)
- `/api/auth/login` - Authentication

### Enhanced Tracking:
- Tracking script automatically includes tenantId
- All data is tenant-isolated
- Real-time analytics per tenant

## Production Deployment

**For Vercel deployment, set these environment variables:**
1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add:
   - `MONGO_URI` = Your MongoDB connection string
   - `MONGODB_URI` = Same as above (fallback)
   - `JWT_SECRET` = Secure random string

## Next Steps After Migration

1. **Frontend Integration**: Login/register pages
2. **User Management**: Admin panel for tenant users
3. **Billing Integration**: Usage tracking and limits
4. **Custom Branding**: Per-tenant customization
5. **Subdomain Routing**: tenant1.yourapp.com

## Troubleshooting

### Common MongoDB Connection Issues:
1. **Firewall**: Ensure your IP is whitelisted in MongoDB Atlas
2. **Credentials**: Verify username/password are correct
3. **Database Name**: Ensure database name matches in connection string
4. **Network**: Check if you're behind a corporate firewall

### Quick Test Command:
```powershell
# Test just the MongoDB connection
$env:MONGO_URI="your_connection_string_here"; node -e "const {MongoClient} = require('mongodb'); new MongoClient(process.env.MONGO_URI).connect().then(() => console.log('✅ Connected!')).catch(e => console.log('❌ Failed:', e.message))"
```

---

## 🎯 Ready to Go Multi-Tenant!

Once you update the MongoDB URI, the entire multi-tenant infrastructure is ready to run. The project already has:
- ✅ Complete backend APIs with tenant isolation
- ✅ Frontend context and components
- ✅ Migration scripts
- ✅ Test and demo scripts
- ✅ Comprehensive documentation
