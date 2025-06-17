export interface Company {
  id: string;
  name?: string;
  domain?: string;
  industry?: string;
  size?: string;
  location?: {
    city?: string;
    country?: string;
    region?: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  lastVisit?: Date;
  lastActive?: number;
  totalVisits?: number;
  revenue?: string;
  employees?: string;
  score?: number;
  confidence?: number;
  status?: string;
  tags?: string[];
  description?: string;
  // Contact information
  phone?: string;
  email?: string;
  website?: string; // Sometimes different from domain
  logo?: string;
  contacts?: ContactPerson[];
}

export interface ContactPerson {
  name?: string;
  title?: string;
  email?: string;
  phone?: string;
  linkedin?: string;
}

export interface Lead {
  id: string;
  companyId?: string;
  company?: Company;
  contactId?: string;
  contact?: ContactPerson;
  source?: string;
  score?: number;
  status?: string;
  createdAt?: Date | number;
  updatedAt?: Date | number;
  notes?: string;
  assignedTo?: string;
  tags?: string[];
  nextFollowUp?: Date | number;
  lastActivity?: Date | number;
  // Extended fields for enrichment and scoring
  email?: string;
  phone?: string;
  companyName?: string;
  industry?: string;
  companySize?: string;
  website?: string;
  location?: string;
  country?: string;
  enriched?: boolean;
  enrichmentError?: string;
  interactions?: {
    websiteVisits?: number;
    downloadedContent?: boolean;
    formSubmissions?: boolean;
    emailOpens?: number;
    emailClicks?: number;
  };
  // Added for compatibility with mock data
  firstName?: string;
  lastName?: string;
  // Added for compatibility with lead discovery events
  discoverySource?: string;
  confidence?: number;
}

export interface Visit {
  id: string;
  companyId: string;
  timestamp: Date;
  ipAddress: string;
  userAgent: string;
  referrer: string;
  pages: PageVisit[];
  sessionDuration: number;
  isReturning: boolean;
}

export interface PageVisit {
  id: string;
  url: string;
  title: string;
  timestamp: Date;
  timeOnPage: number;
  scrollDepth: number;
  interactions: number;
}

export interface TrackingScript {
  id: string;
  customerId: string;
  domain: string;
  scriptCode: string;
  isActive: boolean;
  createdAt: Date;
  lastActivity?: Date;
}

export interface LeadScore {
  companyId: string;
  score: number;
  factors: {
    pageViews: number;
    returnVisits: number;
    timeOnSite: number;
    pricingPageVisits: number;
    contactPageVisits: number;
    downloadActions: number;
  };
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  domain: string;
  isActive: boolean;
  plan: 'basic' | 'professional' | 'enterprise';
  createdAt: Date;
  lastLogin?: Date;
}

export interface Analytics {
  totalVisitors: number;
  newCompanies: number;
  returningCompanies: number;
  hotLeads: number;
  topPages: {
    url: string;
    title: string;
    visits: number;
    uniqueCompanies: number;
  }[];
  trafficSources: {
    source: string;
    visits: number;
    percentage: number;
  }[];
  industryBreakdown: {
    industry: string;
    count: number;
    percentage: number;
  }[];
}
