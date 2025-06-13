// Integration and platform connection types
export interface PlatformCredentials {
  id: string;
  platform: PlatformType;
  credentials: Record<string, string>;
  isConnected: boolean;
  isActive: boolean;
  lastSync?: Date;
  syncStatus: 'connected' | 'disconnected' | 'syncing' | 'error';
  errorMessage?: string;
}

export type PlatformType = 
  | 'google_analytics'
  | 'google_ads'
  | 'meta_ads'
  | 'tiktok_ads'
  | 'google_tag_manager'
  | 'hubspot'
  | 'pipedrive'
  | 'salesforce';

export interface PlatformConfig {
  id: PlatformType;
  name: string;
  description: string;
  icon: string;
  category: 'analytics' | 'advertising' | 'crm' | 'tracking';
  requiredFields: PlatformField[];
  optional?: boolean;
  features: string[];
}

export interface PlatformField {
  key: string;
  label: string;
  type: 'text' | 'password' | 'url' | 'select' | 'file';
  placeholder?: string;
  required: boolean;
  helpText?: string;
  options?: { value: string; label: string }[];
}

export interface BrandingSettings {
  logo?: string;
  logoUrl?: string;
  companyName: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  accountType: 'agency' | 'end_customer';
  customDomain?: string;
  footerText?: string;
  supportEmail?: string;
  showPoweredBy: boolean;
}

export interface CustomerSettings {
  id: string;
  name: string;
  branding: BrandingSettings;
  integrations: PlatformCredentials[];
  dataSources: string[];
  timezone: string;
  currency: string;
  language: string;
  permissions: CustomerPermissions;
  createdAt: Date;
  lastLogin?: Date;
}

export interface CustomerPermissions {
  canEditBranding: boolean;
  canManageIntegrations: boolean;
  canExportData: boolean;
  canViewAnalytics: boolean;
  canManageUsers: boolean;
  maxUsers: number;
}

export interface PlatformData {
  platform: PlatformType;
  data: Record<string, unknown>;
  lastUpdated: Date;
  metrics: PlatformMetrics;
}

export interface PlatformMetrics {
  impressions?: number;
  clicks?: number;
  conversions?: number;
  spend?: number;
  sessions?: number;
  users?: number;
  leads?: number;
  revenue?: number;
  [key: string]: number | string | boolean | undefined;
}

export interface SyncJob {
  id: string;
  platform: PlatformType;
  status: 'pending' | 'running' | 'completed' | 'failed';
  startedAt: Date;
  completedAt?: Date;
  recordsSynced?: number;
  errorMessage?: string;
}
