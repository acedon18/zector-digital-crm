// Authentication API - Handle multi-tenant login/logout
import { MongoClient } from 'mongodb';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

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

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRY = process.env.JWT_EXPIRY || '7d';

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { db } = await connectToDatabase();
    const { email, password, tenantId } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find user by email
    const usersCollection = db.collection('users');
    let userQuery = { 
      email: email.toLowerCase(),
      'authentication.isActive': true
    };

    // If tenantId is provided, filter by it
    if (tenantId) {
      userQuery.tenantId = tenantId;
    }

    const user = await usersCollection.findOne(userQuery);

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.authentication.passwordHash);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Get tenant information
    const tenantsCollection = db.collection('tenants');
    const tenant = await tenantsCollection.findOne({ 
      tenantId: user.tenantId,
      isActive: true
    });

    if (!tenant) {
      return res.status(401).json({ error: 'Tenant not found or inactive' });
    }

    // Check if tenant subscription is active
    if (tenant.subscription.status === 'suspended' || tenant.subscription.status === 'cancelled') {
      return res.status(403).json({ 
        error: 'Account suspended',
        details: `Your organization's subscription is ${tenant.subscription.status}. Please contact support.`
      });
    }

    // Update user login stats
    await usersCollection.updateOne(
      { userId: user.userId },
      {
        $set: {
          'authentication.lastLogin': new Date(),
          updatedAt: new Date()
        },
        $inc: {
          'authentication.loginCount': 1
        }
      }
    );

    // Generate JWT token
    const tokenPayload = {
      userId: user.userId,
      tenantId: user.tenantId,
      email: user.email,
      role: user.role
    };

    const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: JWT_EXPIRY });

    // Remove sensitive data from response
    const sanitizedUser = {
      ...user,
      authentication: {
        ...user.authentication,
        passwordHash: undefined,
        emailVerificationToken: undefined,
        passwordResetToken: undefined,
        twoFactorSecret: undefined
      }
    };

    // Return user, tenant, and token
    return res.status(200).json({
      success: true,
      user: sanitizedUser,
      tenant: tenant,
      token: token,
      expiresIn: JWT_EXPIRY
    });

  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}
