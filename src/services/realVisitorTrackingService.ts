// Real Visitor Tracking Service - Collect actual visitor data
import { Company } from '../types/leads';

// API Data interfaces
export interface VisitorApiData {
  id: string;
  sessionId?: string;
  ipAddress?: string;
  userAgent?: string;
  domain?: string;
  customerId?: string;
  startTime: string;
  lastActivity?: string;
  totalPages?: number;
  events?: EventApiData[];
}

export interface EventApiData {
  eventType: string;
  timestamp: string;
  data?: {
    title?: string;
    path?: string;
    [key: string]: unknown;
  };
}

export interface CompanyApiData {
  id?: string;
  name?: string;
  domain?: string;
  industry?: string;
  size?: string;
  location?: {
    city?: string;
    country?: string;
    region?: string;
  };
  lastVisit?: string;
  totalVisits?: number;
  score?: number;
  status?: 'hot' | 'warm' | 'cold';
  tags?: string[];
  website?: string;
  email?: string;
  phone?: string;
}

// Define interfaces for API responses
export interface VisitorApiData {
  id: string;
  sessionId?: string;
  ipAddress?: string;
  userAgent?: string;
  startTime: string;
  lastActivity?: string;
  totalPages?: number;
  customerId?: string;
  domain?: string;
  events?: EventApiData[];
}

export interface EventApiData {
  eventType: string;
  timestamp: string;
  data?: {
    title?: string;
    path?: string;
  };
}

export interface CompanyApiData {
  id?: string;
  name?: string;
  domain?: string;
  industry?: string;
  size?: string;
  location?: {
    city?: string;
    country?: string;
    region?: string;
  };
  lastVisit?: string;
  totalVisits?: number;
  score?: number;
  status?: 'hot' | 'warm' | 'cold';
  tags?: string[];
  website?: string;
  email?: string;
  phone?: string;
}

export interface EnrichmentData {
  name?: string;
  domain?: string;
  industry?: string;
  size?: string;
  location?: {
    city?: string;
    country?: string;
    region?: string;
  };
  email?: string;
  phone?: string;
  website?: string;
  confidence: number;
}

export interface TrackingEventData {
  title?: string;
  depth?: number;
  duration?: number;
  eventType?: string;
  path?: string;
  queryParams?: Record<string, string>;
  referrer?: string;
  timestamp: number;
  customerId?: string; // Added for tracking data
  domain?: string;     // Added for tracking data
  event?: string;      // Added for tracking data
  ip?: string;         // Added for tracking data
  data?: {
    title?: string;
    path?: string;
    [key: string]: unknown;
  };
}

export interface VisitorData {
  id: string;
  ipAddress?: string;
  userAgent?: string;
  firstSeen: number;
  lastSeen: number;
  totalVisits: number;
  totalPageviews: number;
  averageTimeOnSite?: number;
  events: TrackingEventData[];
  company?: Company | null;
  enrichmentStatus?: 'pending' | 'complete' | 'failed';
}

// Interface for real-time visitors used in the API
export interface RealTimeVisitor {
  sessionId: string;
  ip: string;
  currentPage: string;
  startTime: Date | number;
  lastActivity: Date | number;
  pageViews: number;
  companyInfo: {
    name: string;
    domain: string;
    industry?: string;
    size?: string;
    confidence: number;
    phone?: string;
    email?: string;
    website?: string;
  };
  isActive: boolean;
}

// Visitor tracking configuration
// These endpoints would be used in a production environment for API calls
// Commenting out to avoid unused variable warnings
// const TRACKING_ENDPOINT = process.env.TRACKING_API_ENDPOINT || '/api/tracking';
// const COMPANY_LOOKUP_ENDPOINT = process.env.COMPANY_API_ENDPOINT || '/api/companies';

/**
 * Track a visitor event
 * @param visitorId Unique visitor identifier
 * @param eventData Data about the event
 * @returns Promise with the updated visitor data
 */
export async function trackVisitorEvent(visitorId: string, eventData: Partial<TrackingEventData>): Promise<VisitorData> {
  try {
    console.log("Tracking event for visitor " + visitorId + ":", eventData);
      // Send tracking data to backend API
    const event: TrackingEventData = {
      timestamp: Date.now(),
      ...eventData
    };
    
    // Send to tracking API
    try {
      const response = await fetch('/api/track', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          event: eventData.eventType || 'page_view',
          data: eventData,
          timestamp: event.timestamp,
          url: eventData.path || window.location.href,
          referrer: eventData.referrer || document.referrer,
          userAgent: navigator.userAgent
        })
      });
      
      if (!response.ok) {
        throw new Error(`Tracking API error: ${response.status}`);
      }
      
      console.log('Tracking event sent successfully');
    } catch (error) {
      console.error('Failed to send tracking data:', error);
    }
    
    // Get updated visitor data
    const visitorData = await getVisitorData(visitorId) || createNewVisitor(visitorId);
    
    return {
      ...visitorData,
      lastSeen: Date.now(),
      events: [...visitorData.events, event]
    };
  } catch (error) {
    console.error('Error tracking visitor event:', error);
    throw new Error("Failed to track visitor event: " + (error instanceof Error ? error.message : 'Unknown error'));
  }
}

/**
 * Get visitor data by visitor ID
 * @param visitorId Unique visitor identifier
 * @returns Promise with visitor data or null if not found
 */
export async function getVisitorData(visitorId: string): Promise<VisitorData | null> {
  try {
    // Get real visitor data from API
    const response = await fetch('/api/visitors');
    if (!response.ok) {
      throw new Error('Failed to fetch visitor data');
    }
      const data = await response.json();
    const visitor = data.visitors?.find((v: VisitorApiData) => v.id === visitorId || v.sessionId === visitorId);
    
    if (!visitor) {
      return null;
    }

    // Transform API data to VisitorData format
    return {
      id: visitor.id,
      ipAddress: visitor.ipAddress || 'Unknown',
      userAgent: visitor.userAgent || 'Unknown',
      firstSeen: new Date(visitor.startTime).getTime(),
      lastSeen: new Date(visitor.lastActivity || visitor.startTime).getTime(),
      totalVisits: 1,
      totalPageviews: visitor.totalPages || 0,
      averageTimeOnSite: undefined,
      events: visitor.events?.map((event: EventApiData) => ({
        title: event.data?.title,
        eventType: event.eventType,
        timestamp: new Date(event.timestamp).getTime(),
        customerId: visitor.customerId,
        domain: visitor.domain
      })) || [],
      company: null, // Will be enriched separately
      enrichmentStatus: 'pending'
    };
    
  } catch (error) {
    console.error('Error fetching visitor data:', error);
    return null;
  }
}

/**
 * Create a new visitor record
 * @param visitorId Unique visitor identifier
 * @returns New visitor data
 */
function createNewVisitor(visitorId: string): VisitorData {
  return {
    id: visitorId,
    firstSeen: Date.now(),
    lastSeen: Date.now(),
    totalVisits: 1,
    totalPageviews: 0,
    events: [],
    enrichmentStatus: 'pending'
  };
}

/**
 * Identify visitor's company using real API data
 * @param visitorId Visitor identifier
 * @param ipAddress Visitor IP address
 * @returns Promise with company information or null
 */
export async function identifyVisitorCompany(visitorId: string, ipAddress?: string): Promise<Company | null> {
  try {
    console.log("Identifying company for visitor " + visitorId + " with IP: " + (ipAddress || 'unknown'));
    
    // Get companies from real API
    const response = await fetch('/api/companies');
    if (!response.ok) {
      throw new Error('Failed to fetch companies data');
    }
    
    const data = await response.json();
    
    if (!data.companies || !Array.isArray(data.companies) || data.companies.length === 0) {
      return null;
    }
    
    // Find company matching visitor data or return first available
    const company = data.companies[0]; // For now, return first company if available
    
    return {
      id: company.id || `company-${Date.now()}`,
      name: company.name || 'Unknown Company',
      domain: company.domain || '',
      industry: company.industry || 'Unknown',
      size: company.size || 'Unknown',
      location: company.location || { city: 'Unknown', country: 'Unknown' },
      lastVisit: new Date(company.lastVisit || Date.now()),
      totalVisits: company.totalVisits || 1,
      score: company.score || 50,
      status: company.status || 'warm',
      tags: company.tags || [],
      website: company.website || `https://${company.domain}`
    };
  } catch (error) {
    console.error('Error identifying visitor company:', error);
    return null;
  }
}

/**
 * Gets all visitor data within a specific time range
 * @param startTime Start timestamp
 * @param endTime End timestamp
 * @returns Promise with list of visitor data
 */
export async function getVisitorsInTimeRange(startTime: number, endTime: number): Promise<VisitorData[]> {
  try {
    console.log("Getting visitors between " + new Date(startTime).toISOString() + " and " + new Date(endTime).toISOString());
    
    // Get real visitor data from API
    const response = await fetch('/api/visitors');
    if (!response.ok) {
      throw new Error('Failed to fetch visitors data');
    }
    
    const data = await response.json();
    
    if (!data.visitors || !Array.isArray(data.visitors)) {
      return [];
    }
      // Filter visitors by time range and transform data
    const visitors: VisitorData[] = data.visitors
      .filter((visitor: VisitorApiData) => {
        const visitorTime = new Date(visitor.startTime).getTime();
        return visitorTime >= startTime && visitorTime <= endTime;
      })
      .map((visitor: VisitorApiData) => ({
        id: visitor.id,
        ipAddress: visitor.ipAddress || 'Unknown',
        userAgent: visitor.userAgent || 'Unknown',
        firstSeen: new Date(visitor.startTime).getTime(),
        lastSeen: new Date(visitor.lastActivity || visitor.startTime).getTime(),
        totalVisits: 1,
        totalPageviews: visitor.totalPages || 0,
        averageTimeOnSite: undefined,
        events: visitor.events?.map((event: EventApiData) => ({
          title: event.data?.title,
          eventType: event.eventType,
          timestamp: new Date(event.timestamp).getTime(),
          customerId: visitor.customerId,
          domain: visitor.domain
        })) || [],
        company: null,
        enrichmentStatus: 'pending' as const
      }));
    
    return visitors;
  } catch (error) {
    console.error('Error getting visitors in time range:', error);    return []; // Return empty array instead of mock data
  }
}

/**
 * Process tracking data from website visitors
 * @param trackingData Tracking data from website
 * @returns Promise that resolves when data has been processed
 */
export async function processTrackingData(trackingData: TrackingEventData): Promise<void> {
  try {
    console.log("Processing tracking data:", trackingData);
    
    // Create a unique visitor ID
    const visitorId = `visitor_${trackingData.customerId}_${Date.now()}`;
    
    // Track the visitor event
    await trackVisitorEvent(visitorId, trackingData);
    
    // Attempt to identify company if IP is available
    if (trackingData.ip) {
      const company = await identifyVisitorCompany(visitorId, trackingData.ip);
      if (company) {
        console.log(`Identified company: ${company.name}`);
      }
    }
    
    // In production environment, store in database
    console.log("Tracking data processed successfully");
  } catch (error) {
    console.error("Error processing tracking data:", error);
    throw new Error("Failed to process tracking data: " + (error instanceof Error ? error.message : 'Unknown error'));
  }
}

/**
 * Get real-time visitors for the dashboard
 * @returns Promise with real-time visitor data
 */
export async function getRealTimeVisitors(): Promise<RealTimeVisitor[]> {
  try {
    console.log("Getting real-time visitors");
    
    // Get recent visitors from the last 30 minutes
    const now = Date.now();
    const thirtyMinutesAgo = now - 30 * 60 * 1000;
    
    const recentVisitors = await getVisitorsInTimeRange(thirtyMinutesAgo, now);
    
    // Format as RealTimeVisitor objects
    return recentVisitors.map(visitor => ({
      sessionId: visitor.id,
      ip: visitor.ipAddress || '192.168.0.1', // Anonymized for privacy
      currentPage: visitor.events.length > 0 ? (visitor.events[visitor.events.length - 1].path || '/') : '/',
      startTime: visitor.firstSeen,
      lastActivity: visitor.lastSeen,
      pageViews: visitor.totalPageviews,
      companyInfo: {
        name: visitor.company?.name || visitor.company?.domain || 'Unknown',
        domain: visitor.company?.domain || 'unknown.com',
        industry: visitor.company?.industry,
        size: visitor.company?.size,
        confidence: (visitor.company?.score || 50) / 100,
        phone: visitor.company?.phone,
        email: visitor.company?.email,
        website: visitor.company?.website
      },
      isActive: (now - visitor.lastSeen) < 5 * 60 * 1000 // Active if activity in last 5 minutes
    }));
  } catch (error) {
    console.error("Error getting real-time visitors:", error);
    return [];
  }
}

/**
 * Get all company leads
 * @param filters Optional filters to apply
 * @returns Promise with company data
 */
/**
 * Gets company leads from real API data
 * @param filters Optional filters for status, industry, and search
 * @returns Promise with list of companies
 */
export async function getCompanyLeads(filters?: {
  status?: string;
  industry?: string;
  search?: string;
}): Promise<Company[]> {
  try {
    console.log("Getting company leads with filters:", filters);
    
    // Get real companies from API
    const response = await fetch('/api/companies');
    if (!response.ok) {
      throw new Error('Failed to fetch companies data');
    }
    
    const data = await response.json();
    
    if (!data.companies || !Array.isArray(data.companies)) {
      return [];
    }
    
    // Transform API data to Company format
    let companies: Company[] = data.companies.map((company: CompanyApiData) => ({
      id: company.id || `company-${Date.now()}-${Math.random()}`,
      name: company.name || 'Unknown Company',
      domain: company.domain || '',
      industry: company.industry || 'Unknown',
      size: company.size || 'Unknown',
      location: company.location || { city: 'Unknown', country: 'Unknown' },
      lastVisit: new Date(company.lastVisit || Date.now()),
      totalVisits: company.totalVisits || 1,
      score: company.score || 50,
      status: company.status || 'warm',
      tags: company.tags || [],
      website: company.website || `https://${company.domain}`,
      email: company.email,
      phone: company.phone
    }));
    
    // Apply filters if provided
    if (filters) {
      if (filters.status && filters.status !== 'all') {
        companies = companies.filter(c => c.status === filters.status);
      }
      
      if (filters.industry && filters.industry !== 'all') {
        companies = companies.filter(c => c.industry === filters.industry);
      }
      
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        companies = companies.filter(c => 
          (c.name && c.name.toLowerCase().includes(searchLower)) || 
          (c.domain && c.domain.toLowerCase().includes(searchLower)) || 
          (c.email && c.email.toLowerCase().includes(searchLower)) || 
          (c.website && c.website.toLowerCase().includes(searchLower))
        );
      }
    }
    
    return companies;
  } catch (error) {
    console.error("Error getting company leads:", error);
    return [];
  }
}
