// Enhanced multi-tenant types and interfaces
// File: src/types/tenant.ts

export interface Tenant {
  _id?: string;                  // MongoDB ObjectId
  tenantId: string;              // tenant_uuid_here
  name: string;                  // "Acme Corp"
  domain: string;                // "acme.com" 
  subdomain: string;             // "acme" (for acme.zectorcrm.com)
  
  // Subscription & Billing
  plan: 'starter' | 'professional' | 'enterprise';
  features: string[];            // ['advanced_analytics', 'api_access']
  subscription: {
    status: 'active' | 'trial' | 'suspended' | 'cancelled';
    startDate: Date;
    endDate?: Date;
    trialEnd?: Date;
    billingCycle: 'monthly' | 'yearly';
  };
  
  // Configuration
  settings: {
    trackingDomains: string[];   // Domains they want to track
    apiKeys?: {
      clearbit?: string;
      hunter?: string;
      ipinfo?: string;
    };
    branding: {
      logo?: string;
      primaryColor?: string;
      customDomain?: string;     // custom.domain.com
    };
    integrations: {
      [key: string]: any;        // CRM integrations, webhooks, etc.
    };
    gdpr: {
      enabled: boolean;
      cookiePolicy?: string;
      privacyPolicy?: string;
    };
  };
  
  // Statistics
  stats?: {
    totalVisits: number;
    totalCompanies: number;
    monthlyApiCalls: number;
    storageUsed: number;         // in MB
  };
  
  createdAt: Date;
  updatedAt: Date;
}

export interface TenantUser {
  _id?: string;
  tenantId: string;
  email: string;
  name: string;
  role: 'owner' | 'admin' | 'viewer';
  permissions: string[];
  hashedPassword?: string;      // Only for password-based auth
  isActive: boolean;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Updated tracking data with tenant isolation
export interface TenantAwareVisit {
  _id?: string;
  tenantId: string;             // NEW: Tenant isolation
  sessionId: string;
  customerId?: string;          // Keep for backward compatibility
  domain: string;
  
  // Tracking data
  userAgent: string;
  startTime: Date;
  referrer?: string;
  pages: Array<{
    url: string;
    title: string;
    timestamp: Date;
  }>;
  events: TrackingEvent[];
  gdprCompliant: boolean;
  createdAt: Date;
  lastActivity?: Date;
}

export interface TenantAwareCompany {
  _id?: string;
  tenantId: string;             // NEW: Tenant isolation
  
  // Company data
  name?: string;
  domain?: string;
  industry?: string;
  size?: string;
  location?: {
    city?: string;
    country?: string;
    region?: string;
  };
  
  // Contact info
  email?: string;
  phone?: string;
  website?: string;
  
  // CRM data
  lastVisit: Date;
  totalVisits: number;
  score: number;                // 0-100
  status: 'hot' | 'warm' | 'cold' | 'new';
  tags: string[];
  
  // Enrichment data
  enrichment?: {
    source: string[];           // ['ip', 'domain', 'email']
    confidence: number;         // 0-1
    lastEnriched: Date;
  };
  
  createdAt: Date;
  updatedAt: Date;
}

export interface TrackingEvent {
  eventType: string;
  timestamp: Date;
  data: Record<string, any>;
  url: string;
}

// Tenant context for API calls
export interface TenantContext {
  tenantId: string;
  userId?: string;
  userRole?: string;
  permissions?: string[];
}

// Multi-tenant API response wrapper
export interface TenantApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  tenantId: string;
  timestamp: string;
}

// Plan limits and features
export interface PlanLimits {
  plan: string;
  limits: {
    maxCompanies: number;
    maxApiCalls: number;        // per month
    maxUsers: number;
    storageLimit: number;       // in MB
    dataRetention: number;      // in days
  };
  features: string[];
}

export const PLAN_LIMITS: Record<string, PlanLimits> = {
  starter: {
    plan: 'starter',
    limits: {
      maxCompanies: 1000,
      maxApiCalls: 10000,
      maxUsers: 2,
      storageLimit: 500,
      dataRetention: 90
    },
    features: ['basic_analytics', 'email_alerts', 'csv_export']
  },
  professional: {
    plan: 'professional',
    limits: {
      maxCompanies: 10000,
      maxApiCalls: 100000,
      maxUsers: 10,
      storageLimit: 5000,
      dataRetention: 365
    },
    features: ['advanced_analytics', 'api_access', 'integrations', 'custom_branding']
  },
  enterprise: {
    plan: 'enterprise',
    limits: {
      maxCompanies: -1,         // unlimited
      maxApiCalls: -1,          // unlimited
      maxUsers: -1,             // unlimited
      storageLimit: -1,         // unlimited
      dataRetention: -1         // unlimited
    },
    features: ['all_features', 'priority_support', 'custom_domain', 'white_label']
  }
};

// Utility types for multi-tenant operations
export type TenantOperation = 'create' | 'read' | 'update' | 'delete';
export type TenantResource = 'companies' | 'visits' | 'users' | 'settings' | 'analytics';

export interface TenantPermission {
  resource: TenantResource;
  operations: TenantOperation[];
}

// Default permissions by role
export const DEFAULT_PERMISSIONS: Record<string, TenantPermission[]> = {
  owner: [
    { resource: 'companies', operations: ['create', 'read', 'update', 'delete'] },
    { resource: 'visits', operations: ['read', 'delete'] },
    { resource: 'users', operations: ['create', 'read', 'update', 'delete'] },
    { resource: 'settings', operations: ['create', 'read', 'update', 'delete'] },
    { resource: 'analytics', operations: ['read'] }
  ],
  admin: [
    { resource: 'companies', operations: ['create', 'read', 'update', 'delete'] },
    { resource: 'visits', operations: ['read'] },
    { resource: 'users', operations: ['create', 'read', 'update'] },
    { resource: 'settings', operations: ['read', 'update'] },
    { resource: 'analytics', operations: ['read'] }
  ],
  viewer: [
    { resource: 'companies', operations: ['read'] },
    { resource: 'visits', operations: ['read'] },
    { resource: 'analytics', operations: ['read'] }
  ]
};
