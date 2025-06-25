// User Management API - Handle tenant users and authentication
import { MongoClient, ObjectId } from 'mongodb';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';

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

// Validate user data
function validateUserData(userData) {
  const required = ['email', 'firstName', 'lastName', 'tenantId'];
  const missing = required.filter(field => !userData[field]);
  
  if (missing.length > 0) {
    throw new Error(`Missing required fields: ${missing.join(', ')}`);
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(userData.email)) {
    throw new Error('Invalid email format');
  }
}

// Create default user structure
function createUserStructure(userData, hashedPassword = null) {
  return {
    userId: uuidv4(),
    email: userData.email.toLowerCase(),
    firstName: userData.firstName,
    lastName: userData.lastName,
    tenantId: userData.tenantId,
    role: userData.role || 'user', // admin, manager, user, viewer
    
    profile: {
      avatar: userData.profile?.avatar || '',
      timezone: userData.profile?.timezone || 'UTC',
      language: userData.profile?.language || 'en',
      phone: userData.profile?.phone || '',
      department: userData.profile?.department || '',
      title: userData.profile?.title || ''
    },
    
    permissions: {
      dashboard: userData.permissions?.dashboard !== false,
      analytics: userData.permissions?.analytics !== false,
      leads: userData.permissions?.leads !== false,
      companies: userData.permissions?.companies !== false,
      settings: userData.permissions?.settings || userData.role === 'admin',
      billing: userData.permissions?.billing || userData.role === 'admin',
      userManagement: userData.permissions?.userManagement || userData.role === 'admin'
    },
    
    preferences: {
      emailNotifications: userData.preferences?.emailNotifications !== false,
      realTimeAlerts: userData.preferences?.realTimeAlerts !== false,
      digestFrequency: userData.preferences?.digestFrequency || 'daily'
    },
    
    authentication: {
      passwordHash: hashedPassword,
      lastLogin: null,
      loginCount: 0,
      isActive: true,
      emailVerified: false,
      emailVerificationToken: uuidv4(),
      passwordResetToken: null,
      passwordResetExpires: null,
      twoFactorEnabled: false,
      twoFactorSecret: null
    },
    
    createdAt: new Date(),
    updatedAt: new Date(),
    createdBy: userData.createdBy || null
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
    const usersCollection = db.collection('users');

    switch (req.method) {
      case 'GET':
        return await handleGetUsers(req, res, usersCollection);
      case 'POST':
        return await handleCreateUser(req, res, usersCollection);
      case 'PUT':
        return await handleUpdateUser(req, res, usersCollection);
      case 'DELETE':
        return await handleDeleteUser(req, res, usersCollection);
      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Users API error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

// GET /api/users - List users for a tenant or get specific user
async function handleGetUsers(req, res, usersCollection) {
  const { userId, email, tenantId } = req.query;
  const requestTenantId = req.headers['x-tenant-id'] || tenantId;

  if (!requestTenantId) {
    return res.status(400).json({ error: 'Tenant ID is required' });
  }

  let query = { tenantId: requestTenantId };
  
  if (userId) {
    query.userId = userId;
  } else if (email) {
    query.email = email.toLowerCase();
  }

  if (Object.keys(query).length > 1) {
    // Get single user (exclude sensitive auth data)
    const user = await usersCollection.findOne(query, {
      projection: {
        'authentication.passwordHash': 0,
        'authentication.twoFactorSecret': 0,
        'authentication.emailVerificationToken': 0,
        'authentication.passwordResetToken': 0
      }
    });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    return res.status(200).json(user);
  } else {
    // List all users for tenant (paginated)
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const users = await usersCollection
      .find(query, {
        projection: {
          'authentication.passwordHash': 0,
          'authentication.twoFactorSecret': 0,
          'authentication.emailVerificationToken': 0,
          'authentication.passwordResetToken': 0
        }
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();

    const total = await usersCollection.countDocuments(query);

    return res.status(200).json({
      users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  }
}

// POST /api/users - Create new user
async function handleCreateUser(req, res, usersCollection) {
  try {
    validateUserData(req.body);

    // Check if user already exists
    const existingUser = await usersCollection.findOne({
      email: req.body.email.toLowerCase(),
      tenantId: req.body.tenantId
    });

    if (existingUser) {
      return res.status(400).json({ error: 'User already exists in this tenant' });
    }

    // Hash password if provided
    let hashedPassword = null;
    if (req.body.password) {
      hashedPassword = await bcrypt.hash(req.body.password, 12);
    }

    const newUser = createUserStructure(req.body, hashedPassword);
    const result = await usersCollection.insertOne(newUser);

    // Remove sensitive data from response
    delete newUser.authentication.passwordHash;
    delete newUser.authentication.emailVerificationToken;

    return res.status(201).json({
      ...newUser,
      _id: result.insertedId
    });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
}

// PUT /api/users - Update existing user
async function handleUpdateUser(req, res, usersCollection) {
  const { userId } = req.query;
  const tenantId = req.headers['x-tenant-id'] || req.body.tenantId;
  
  if (!userId || !tenantId) {
    return res.status(400).json({ error: 'userId and tenantId are required' });
  }

  try {
    const updateData = { ...req.body };
    delete updateData._id;
    delete updateData.userId;
    delete updateData.tenantId;
    delete updateData.createdAt;
    delete updateData.authentication; // Don't allow direct auth updates
    updateData.updatedAt = new Date();

    // Handle password update separately
    if (req.body.newPassword) {
      const hashedPassword = await bcrypt.hash(req.body.newPassword, 12);
      updateData['authentication.passwordHash'] = hashedPassword;
    }

    const result = await usersCollection.updateOne(
      { userId, tenantId },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const updatedUser = await usersCollection.findOne(
      { userId, tenantId },
      {
        projection: {
          'authentication.passwordHash': 0,
          'authentication.twoFactorSecret': 0,
          'authentication.emailVerificationToken': 0,
          'authentication.passwordResetToken': 0
        }
      }
    );
    
    return res.status(200).json(updatedUser);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
}

// DELETE /api/users - Delete user (soft delete)
async function handleDeleteUser(req, res, usersCollection) {
  const { userId } = req.query;
  const tenantId = req.headers['x-tenant-id'];
  
  if (!userId || !tenantId) {
    return res.status(400).json({ error: 'userId and tenantId are required' });
  }

  const result = await usersCollection.updateOne(
    { userId, tenantId },
    { 
      $set: { 
        'authentication.isActive': false,
        deletedAt: new Date(),
        updatedAt: new Date()
      }
    }
  );

  if (result.matchedCount === 0) {
    return res.status(404).json({ error: 'User not found' });
  }

  return res.status(200).json({ message: 'User deleted successfully' });
}
