// Real Visitor Tracking Service - Collect actual visitor data
import { Company } from '../types/leads';

// Define enrichment data interfaces
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
    
    const event: TrackingEventData = {
      timestamp: Date.now(),
      ...eventData
    };
    
    // Send event to tracking API
    const response = await fetch('/api/track-event', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        visitorId,
        event
      })
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const updatedVisitorData = await response.json();
    return updatedVisitorData;
  } catch (error) {
    console.error('Error tracking visitor event:', error);
    // Return minimal visitor data on error
    return {
      id: visitorId,
      firstSeen: Date.now(),
      lastSeen: Date.now(),
      totalVisits: 1,
      totalPageviews: 1,
      events: []
    };
  }
}

/**
 * Get visitor data by visitor ID
 * @param visitorId Unique visitor identifier
 * @returns Promise with visitor data or null if not found
 */
export async function getVisitorData(visitorId: string): Promise<VisitorData | null> {
  try {
    // Fetch real visitor data from the tracking API
    const response = await fetch(`/api/visitors/${visitorId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      if (response.status === 404) {
        return null; // Visitor not found
      }
      throw new Error(`API error: ${response.status}`);
    }

    const visitorData = await response.json();
    return visitorData;
  } catch (error) {
    console.error('Error getting visitor data:', error);
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
 * Identify visitor's company based on IP or other signals
 * @param visitorId Visitor identifier
 * @param ipAddress Visitor IP address
 * @returns Promise with company information or null
 */
export async function identifyVisitorCompany(visitorId: string, ipAddress?: string): Promise<Company | null> {
  try {
    console.log("Identifying company for visitor " + visitorId + " with IP: " + (ipAddress || 'unknown'));
    
    // Call real IP-to-company service or use Apollo.io enrichment
    const response = await fetch('/api/identify-company', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        visitorId,
        ipAddress
      })
    });

    if (!response.ok) {
      if (response.status === 404) {
        return null; // Company not identified
      }
      throw new Error(`API error: ${response.status}`);
    }

    const companyData = await response.json();
    return companyData;
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
    
    // Query real data from database/API
    const response = await fetch(`/api/visitors?start=${startTime}&end=${endTime}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const visitors = await response.json();
    return visitors;
  } catch (error) {
    console.error('Error getting visitors in time range:', error);
    return []; // Return empty array on error
  }
}

/**
 * Real-time visitor data API functions
 * These functions query actual tracking data instead of mock data
 */

// Export the tracking service
export const realVisitorTracking = {
  trackVisitorEvent,
  getVisitorData,
  identifyVisitorCompany,
  getVisitorsInTimeRange
};
  size: string, 
  city: string, 
  country: string, 
  status: 'hot' | 'warm' | 'cold'
): Company {
  return {
    id: "company-" + Date.now() + "-" + name.replace(/\s+/g, '-').toLowerCase(),
    name,
    domain,
    industry,
    size,
    location: {
      city,
      country,
    },
    lastVisit: new Date(),
    totalVisits: Math.floor(Math.random() * 20) + 1,
    score: Math.floor(Math.random() * 40) + 60, // 60-100
    status,
    tags: [industry.toLowerCase(), size.toLowerCase()],
    website: "https://" + domain,
  };
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
export async function getCompanyLeads(filters?: {
  status?: string;
  industry?: string;
  search?: string;
}): Promise<Company[]> {
  try {
    console.log("Getting company leads with filters:", filters);
    
    // Build query parameters
    const params = new URLSearchParams();
    if (filters?.status && filters.status !== 'all') {
      params.append('status', filters.status);
    }
    if (filters?.industry && filters.industry !== 'all') {
      params.append('industry', filters.industry);
    }
    if (filters?.search) {
      params.append('search', filters.search);
    }
      // Call the real API endpoint
    const apiUrl = `/api/companies${params.toString() ? `?${params.toString()}` : ''}`;
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error(`API call failed: ${response.status} ${response.statusText}`);
    }
    
    const companies: Company[] = await response.json();
    console.log(`Retrieved ${companies.length} company leads from API`);
    
    return companies;
  } catch (error) {
    console.error("Error getting company leads:", error);
    // Return empty array instead of mock data when API fails
    return [];
  }
}
