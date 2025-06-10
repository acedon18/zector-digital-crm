export interface Company {
  id: string;
  name: string;
  domain: string;
  industry: string;
  size: string;
  location: {
    city: string;
    country: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  lastVisit: Date;
  totalVisits: number;
  score: number;
  status: 'hot' | 'warm' | 'cold';
  tags: string[];
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
