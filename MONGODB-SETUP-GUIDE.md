# MongoDB Setup Guide for Zector Digital CRM

## 🚀 Quick Setup Options

### Option 1: MongoDB Atlas (Cloud - Recommended)

1. **Sign up for MongoDB Atlas** (free tier available)
   - Go to: https://www.mongodb.com/cloud/atlas
   - Create a free account

2. **Create a new cluster**
   - Choose "Free Shared Cluster"
   - Select your preferred region
   - Wait for cluster to be created (2-3 minutes)

3. **Set up database access**
   - Go to "Database Access" in left sidebar
   - Click "Add New Database User"
   - Choose "Password" authentication
   - Create username/password (save these!)
   - Grant "Atlas Admin" role for development

4. **Set up network access**
   - Go to "Network Access" in left sidebar
   - Click "Add IP Address"
   - Choose "Allow Access from Anywhere" (0.0.0.0/0) for development
   - (For production, use specific IPs)

5. **Get connection string**
   - Go to "Clusters" and click "Connect"
   - Choose "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your actual password
   - Replace `<dbname>` with `zector_crm`

   Example: `mongodb+srv://myuser:mypassword@cluster0.abc123.mongodb.net/zector_crm?retryWrites=true&w=majority`

### Option 2: Local MongoDB

1. **Install MongoDB Community Edition**
   - Windows: Download from https://www.mongodb.com/try/download/community
   - Run the installer with default settings

2. **Start MongoDB service**
   - MongoDB should start automatically after installation
   - Or run: `net start MongoDB` (as administrator)

3. **Use local connection string**
   ```
   mongodb://localhost:27017/zector_crm
   ```

### Option 3: Docker MongoDB

1. **Install Docker Desktop** (if not installed)

2. **Run MongoDB container**
   ```bash
   docker run -d -p 27017:27017 --name zector-mongo -e MONGO_INITDB_DATABASE=zector_crm mongo:latest
   ```

3. **Use Docker connection string**
   ```
   mongodb://localhost:27017/zector_crm
   ```

## 🔧 Setup Steps

1. **Create environment file**
   ```bash
   cp .env.local.example .env.local
   ```

2. **Edit .env.local with your MongoDB connection**
   ```bash
   MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/zector_crm?retryWrites=true&w=majority
   JWT_SECRET=your_random_secret_key_here_make_it_long_and_secure
   ```

3. **Run the migration**
   ```bash
   node scripts/run-migration.js
   ```

## 📋 Environment Variables Needed

```bash
# Required for database
MONGO_URI=your_mongodb_connection_string

# Required for authentication
JWT_SECRET=your_jwt_secret_key

# Optional for development
VITE_USE_REAL_DATA=true
VITE_API_ENDPOINT=http://localhost:3000
```

## 🔑 Example .env.local file

```bash
# MongoDB Atlas example
MONGO_URI=mongodb+srv://zectoruser:mypassword123@cluster0.abc123.mongodb.net/zector_crm?retryWrites=true&w=majority

# Local MongoDB example
# MONGO_URI=mongodb://localhost:27017/zector_crm

# JWT Secret (generate a random string)
JWT_SECRET=super_secret_jwt_key_for_development_change_in_production_12345

# Development settings
VITE_USE_REAL_DATA=true
VITE_API_ENDPOINT=http://localhost:3000
```

## ⚡ Quick Commands

After setting up your .env.local file:

```bash
# Test the connection and run migration
node scripts/run-migration.js

# Start development server
npm run dev

# Test multi-tenant implementation
node scripts/test-multi-tenant.cjs
```

## 🎯 Ready to Go!

Once you have MongoDB set up and the migration completed, your multi-tenant CRM will be ready with:
- ✅ Tenant isolation
- ✅ User management
- ✅ Secure authentication
- ✅ Real-time tracking
- ✅ Analytics dashboard
