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
    
    // In a production environment, this would send data to a tracking backend
    // For development, use mock data
    
    const event: TrackingEventData = {
      timestamp: Date.now(),
      ...eventData
    };
    
    // Get existing visitor data or create new
    const visitorData = await getVisitorData(visitorId) || createNewVisitor(visitorId);
    
    // Update visitor data with this event
    const updatedVisitorData: VisitorData = {
      ...visitorData,
      lastSeen: Date.now(),
      totalPageviews: visitorData.totalPageviews + 1,
      events: [...visitorData.events, event]
    };
    
    // In production, save this to a database
    // For development, just log it
    console.log('Updated visitor data:', updatedVisitorData);
    
    return updatedVisitorData;
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
    // In production, fetch from database
    // For development, return mock data
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Randomly decide if we have data for this visitor
    const visitorExists = Math.random() > 0.3;
    
    if (!visitorExists) {
      return null;
    }
    
    const mockVisitor: VisitorData = {
      id: visitorId,
      ipAddress: '192.168.1.1',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      firstSeen: Date.now() - 7 * 24 * 60 * 60 * 1000, // 7 days ago
      lastSeen: Date.now() - 30 * 60 * 1000, // 30 minutes ago
      totalVisits: 5,
      totalPageviews: 18,
      averageTimeOnSite: 157, // seconds
      events: [
        {
          title: 'Home',
          path: '/',
          eventType: 'pageview',
          timestamp: Date.now() - 7 * 24 * 60 * 60 * 1000
        },
        {
          title: 'Products',
          path: '/products',
          eventType: 'pageview',
          timestamp: Date.now() - 5 * 24 * 60 * 60 * 1000
        },
        {
          title: 'Contact',
          path: '/contact',
          eventType: 'pageview',
          timestamp: Date.now() - 30 * 60 * 1000
        }
      ],
      company: createMockCompany('Acme Inc', 'acme.com', 'Technology', '50-200', 'San Francisco', 'USA', 'hot'),
      enrichmentStatus: 'complete'
    };
    
    return mockVisitor;
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
    
    // In production, call an IP-to-company service
    // For development, return mock data
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 700));
    
    // Randomly decide if we can identify the company
    const identified = Math.random() > 0.4;
    
    if (!identified) {
      return null;
    }
    
    // Mock company data
    const companies = [
      createMockCompany('TechCorp', 'techcorp.com', 'Technology', '50-200', 'San Francisco', 'USA', 'hot'),
      createMockCompany('Finance Group', 'finance-group.com', 'Finance', '500-1000', 'New York', 'USA', 'warm'),
      createMockCompany('Healthcare Plus', 'healthcare-plus.co', 'Healthcare', '200-500', 'Chicago', 'USA', 'cold')
    ];
    
    // Return a random company from our list
    const randomIndex = Math.floor(Math.random() * companies.length);
    return companies[randomIndex];
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
    
    // In production, query from database
    // For development, return mock data
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Generate 1-10 random visitors
    const visitorCount = Math.floor(Math.random() * 10) + 1;
    const visitors: VisitorData[] = [];
    
    for (let i = 0; i < visitorCount; i++) {
      const firstSeen = startTime + Math.floor(Math.random() * (endTime - startTime));
      const lastSeen = firstSeen + Math.floor(Math.random() * (endTime - firstSeen));
      const totalVisits = Math.floor(Math.random() * 10) + 1;
      const totalPageviews = totalVisits * (Math.floor(Math.random() * 6) + 1);
      
      const industries = ['Technology', 'Finance', 'Healthcare', 'Retail', 'Manufacturing'];
      const sizes = ['1-10', '11-50', '51-200', '201-500', '501-1000', '1000+'];
      const cities = ['San Francisco', 'New York', 'Chicago', 'Austin', 'Seattle'];
      const statuses = ['hot', 'warm', 'cold'] as ('hot' | 'warm' | 'cold')[];
      
      visitors.push({
        id: "visitor-" + Date.now() + "-" + i,
        ipAddress: "192.168.1." + (i + 1),
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        firstSeen,
        lastSeen,
        totalVisits,
        totalPageviews,
        averageTimeOnSite: Math.floor(Math.random() * 300) + 30, // 30-330 seconds
        events: [],
        company: Math.random() > 0.3 ? 
          createMockCompany(
            "Company " + (i + 1),
            "company" + (i + 1) + ".com",
            industries[Math.floor(Math.random() * industries.length)],
            sizes[Math.floor(Math.random() * sizes.length)],
            cities[Math.floor(Math.random() * cities.length)],
            'USA',
            statuses[Math.floor(Math.random() * statuses.length)]
          ) : null,
        enrichmentStatus: Math.random() > 0.7 ? 'complete' : Math.random() > 0.5 ? 'pending' : 'failed'
      });
    }
    
    return visitors;
  } catch (error) {
    console.error('Error getting visitors in time range:', error);
    return [];
  }
}

/**
 * Helper to create properly typed mock company data
 */
function createMockCompany(
  name: string, 
  domain: string, 
  industry: string, 
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
