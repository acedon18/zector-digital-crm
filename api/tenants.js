// Tenant Management API - CRUD operations for tenants
import { MongoClient, ObjectId } from 'mongodb';
import { v4 as uuidv4 } from 'uuid';

let cachedClient = null;
let cachedDb = null;

async function connectToDatabase() {
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb };
  }

  const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI;
  if (!MONGO_URI) {
    throw new Error('MongoDB URI not found in environment variables');
  }

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

  cachedClient = client;
  cachedDb = db;

  return { client, db };
}

// Validate tenant data
function validateTenantData(tenantData) {
  const required = ['name', 'domain'];
  const missing = required.filter(field => !tenantData[field]);
  
  if (missing.length > 0) {
    throw new Error(`Missing required fields: ${missing.join(', ')}`);
  }

  // Validate domain format
  const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-_]*\.?[a-zA-Z0-9-_]*[a-zA-Z0-9]$/;
  if (!domainRegex.test(tenantData.domain)) {
    throw new Error('Invalid domain format');
  }
}

// Create default tenant structure
function createTenantStructure(tenantData) {
  return {
    tenantId: uuidv4(),
    name: tenantData.name,
    domain: tenantData.domain,
    subdomain: tenantData.subdomain || tenantData.name.toLowerCase().replace(/[^a-z0-9]/g, ''),
    plan: tenantData.plan || 'starter',
    
    subscription: {
      status: 'trial',
      startDate: new Date(),
      endDate: null,
      trialEnd: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days trial
      billingCycle: 'monthly'
    },
    
    settings: {
      trackingDomains: [tenantData.domain],
      apiKeys: {
        clearbit: tenantData.apiKeys?.clearbit || '',
        hunter: tenantData.apiKeys?.hunter || '',
        ipinfo: tenantData.apiKeys?.ipinfo || ''
      },
      branding: {
        logo: tenantData.branding?.logo || '',
        primaryColor: tenantData.branding?.primaryColor || '#ff6b35',
        customDomain: tenantData.branding?.customDomain || ''
      },
      gdpr: {
        enabled: tenantData.gdpr?.enabled || true,
        cookieNotice: tenantData.gdpr?.cookieNotice || true,
        dataRetentionDays: tenantData.gdpr?.dataRetentionDays || 365
      },
      notifications: {
        email: tenantData.notifications?.email || true,
        realTime: tenantData.notifications?.realTime || true,
        digest: tenantData.notifications?.digest || 'daily'
      }
    },
    
    limits: {
      monthlyVisits: tenantData.limits?.monthlyVisits || 1000,
      emailAlerts: tenantData.limits?.emailAlerts || 100,
      dataExports: tenantData.limits?.dataExports || 5,
      apiCalls: tenantData.limits?.apiCalls || 10000,
      dataRetentionDays: tenantData.limits?.dataRetentionDays || 90
    },
    
    createdAt: new Date(),
    updatedAt: new Date(),
    isActive: true
  };
}

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Tenant-ID');
  
  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const { db } = await connectToDatabase();
    const tenantsCollection = db.collection('tenants');

    switch (req.method) {
      case 'GET':
        return await handleGetTenants(req, res, tenantsCollection);
      case 'POST':
        return await handleCreateTenant(req, res, tenantsCollection);
      case 'PUT':
        return await handleUpdateTenant(req, res, tenantsCollection);
      case 'DELETE':
        return await handleDeleteTenant(req, res, tenantsCollection);
      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Tenants API error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

// GET /api/tenants - List all tenants or get specific tenant
async function handleGetTenants(req, res, tenantsCollection) {
  const { tenantId, domain, subdomain } = req.query;

  let query = {};
  
  if (tenantId) {
    query.tenantId = tenantId;
  } else if (domain) {
    query.domain = domain;
  } else if (subdomain) {
    query.subdomain = subdomain;
  }

  if (Object.keys(query).length > 0) {
    // Get single tenant
    const tenant = await tenantsCollection.findOne(query);
    if (!tenant) {
      return res.status(404).json({ error: 'Tenant not found' });
    }
    return res.status(200).json(tenant);
  } else {
    // List all tenants (paginated)
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const tenants = await tenantsCollection
      .find({})
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();

    const total = await tenantsCollection.countDocuments({});

    return res.status(200).json({
      tenants,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  }
}

// POST /api/tenants - Create new tenant
async function handleCreateTenant(req, res, tenantsCollection) {
  try {
    validateTenantData(req.body);

    // Check if domain or subdomain already exists
    const existingTenant = await tenantsCollection.findOne({
      $or: [
        { domain: req.body.domain },
        { subdomain: req.body.subdomain || req.body.name.toLowerCase().replace(/[^a-z0-9]/g, '') }
      ]
    });

    if (existingTenant) {
      return res.status(400).json({ error: 'Domain or subdomain already exists' });
    }

    const newTenant = createTenantStructure(req.body);
    const result = await tenantsCollection.insertOne(newTenant);

    return res.status(201).json({
      ...newTenant,
      _id: result.insertedId
    });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
}

// PUT /api/tenants - Update existing tenant
async function handleUpdateTenant(req, res, tenantsCollection) {
  const { tenantId } = req.query;
  
  if (!tenantId) {
    return res.status(400).json({ error: 'tenantId is required' });
  }

  try {
    const updateData = { ...req.body };
    delete updateData._id;
    delete updateData.tenantId;
    delete updateData.createdAt;
    updateData.updatedAt = new Date();

    const result = await tenantsCollection.updateOne(
      { tenantId },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'Tenant not found' });
    }

    const updatedTenant = await tenantsCollection.findOne({ tenantId });
    return res.status(200).json(updatedTenant);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
}

// DELETE /api/tenants - Delete tenant (soft delete)
async function handleDeleteTenant(req, res, tenantsCollection) {
  const { tenantId } = req.query;
  
  if (!tenantId) {
    return res.status(400).json({ error: 'tenantId is required' });
  }

  const result = await tenantsCollection.updateOne(
    { tenantId },
    { 
      $set: { 
        isActive: false,
        deletedAt: new Date(),
        updatedAt: new Date()
      }
    }
  );

  if (result.matchedCount === 0) {
    return res.status(404).json({ error: 'Tenant not found' });
  }

  return res.status(200).json({ message: 'Tenant deleted successfully' });
}
