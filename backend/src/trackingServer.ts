// Backend Tracking Endpoint - Handle incoming visitor data
// Clean TypeScript implementation with proper types

import express from 'express';
import type { Request, Response } from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
// import * as realVisitorTrackingService from '../services/realVisitorTrackingService';
// import type { Company } from '../types/leads';

// Initialize environment variables
dotenv.config();

// Define MongoDB query interface for type safety
interface CompanyQuery {
  status?: string;
  industry?: string;
  minConfidence?: string;
  score?: { $gte: number };
  $or?: Array<Record<string, RegExp | string | boolean | number>>;
}

// Create Express app
const app = express();
const router = express.Router();

// Setup middleware
app.use(cors());
app.use(express.json());

// Register all routes
app.use('/', router);

// MongoDB connection setup
const connectDB = async (): Promise<boolean> => {
  try {
    const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/zector-digital-crm';
    
    console.log('🔌 TypeScript: Connecting to MongoDB...');
    await mongoose.connect(mongoURI);
    console.log('📊 TypeScript: MongoDB Connected Successfully!');
    return true;
  } catch (error) {
    console.error('❌ TypeScript: MongoDB Connection Error:', error);
    // Fallback to in-memory storage in case of connection failure
    return false;
  }
};

// ...existing code from trackingServer.ts.bak (schemas, endpoints, etc.)...

export default app;
