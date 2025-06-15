// Real Visitor Tracking Service - Collect actual visitor data
import { Company } from '@/types/leads';

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
  [key: string]: string | number | boolean | undefined;
}

export interface CreateSessionData {
  sessionId: string;
  ip: string;
  userAgent: string;
  domain: string;
  customerId: string;
  referrer?: string;
  timestamp: Date;
}

export interface EmailSearchResult {
  value: string;
  type: string;
  first_name?: string;
  confidence: number;
}

export interface VisitorSession {
  id: string;
  ip: string;
  anonymizedIp?: string;
  userAgent: string;
  timestamp: Date;
  domain: string;
  referrer?: string;
  pages: PageVisit[];
  sessionDuration?: number;
  companyInfo?: CompanyInfo;
}

export interface PageVisit {
  url: string;
  title: string;
  timestamp: Date;
  timeOnPage?: number;
  scrollDepth?: number;
}

export interface CompanyInfo {
  name?: string;
  domain: string;
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
  enrichedAt: Date;
  enrichmentSource: string[];
  confidence: number;
}

export interface RealTimeVisitor {
  sessionId: string;
  ip: string;
  currentPage: string;
  startTime: Date;
  lastActivity: Date;
  pageViews: number;
  companyInfo?: CompanyInfo;
  isActive: boolean;
}

class RealVisitorTrackingService {
  private apiEndpoint = import.meta.env.VITE_API_ENDPOINT || 'https://api.zectordigital.com';
  private activeSessions = new Map<string, RealTimeVisitor>();
    // Store incoming tracking data from your website
  async processTrackingData(data: {
    event: string;
    customerId: string;
    domain: string;
    ip?: string;
    userAgent: string;
    url: string;
    referrer?: string;
    timestamp: string;
    anonymizeIp?: boolean;
    data?: TrackingEventData;
  }): Promise<void> {
    try {
      const sessionId = this.generateSessionId(data.ip || 'unknown', data.userAgent);
      
      // Get or create session
      let session = await this.getSession(sessionId);
      if (!session) {
        session = await this.createSession({
          sessionId,
          ip: data.ip || 'unknown',
          userAgent: data.userAgent,
          domain: data.domain,
          customerId: data.customerId,
          referrer: data.referrer,
          timestamp: new Date(data.timestamp)
        });
      }

      // Process different event types
      switch (data.event) {
        case 'page_view':
          await this.recordPageView(sessionId, {
            url: data.url,
            title: data.data?.title || 'Unknown',
            timestamp: new Date(data.timestamp)
          });
          break;
        case 'form_submission':
          await this.recordFormSubmission(sessionId, data.data);
          break;
        case 'scroll_depth':
          await this.updateScrollDepth(sessionId, data.url, data.data?.depth || 0);
          break;
        case 'session_end':
          await this.endSession(sessionId, data.data?.duration || 0);
          break;
      }

      // Try to enrich company data if we haven't done it yet
      if (!session.companyInfo && data.domain) {
        await this.enrichCompanyData(sessionId, data.domain, data.ip);
      }

    } catch (error) {
      console.error('Error processing tracking data:', error);
    }
  }

  // Enrich visitor data with company information
  private async enrichCompanyData(sessionId: string, domain: string, ip?: string): Promise<CompanyInfo | null> {
    try {
      const enrichmentResults = await Promise.allSettled([
        this.enrichFromIP(ip),
        this.enrichFromDomain(domain),
        this.enrichFromEmailDomains(domain),
        this.enrichFromBusinessDirectories(domain)
      ]);

      const companyInfo: Partial<CompanyInfo> = {
        domain,
        enrichedAt: new Date(),
        enrichmentSource: [],
        confidence: 0
      };

      let totalConfidence = 0;
      let sourceCount = 0;

      // Process results from different enrichment sources
      enrichmentResults.forEach((result, index) => {
        if (result.status === 'fulfilled' && result.value) {
          const sources = ['ip', 'domain', 'email', 'directory'];
          companyInfo.enrichmentSource!.push(sources[index]);
          
          // Merge data with confidence weighting
          const data = result.value;          if (data.name && !companyInfo.name) companyInfo.name = data.name;
          if (data.industry && !companyInfo.industry) companyInfo.industry = data.industry;
          if (data.size && !companyInfo.size) companyInfo.size = data.size;
          if (data.location && !companyInfo.location) companyInfo.location = data.location;
          if (data.email && !companyInfo.email) companyInfo.email = data.email;
          if (data.phone && !companyInfo.phone) companyInfo.phone = data.phone;
          if (data.website && !companyInfo.website) companyInfo.website = data.website;
          
          totalConfidence += data.confidence || 0;
          sourceCount++;
        }
      });

      companyInfo.confidence = sourceCount > 0 ? totalConfidence / sourceCount : 0;

      if (companyInfo.confidence > 0.3) { // Only save if we have reasonable confidence
        await this.updateSessionCompanyInfo(sessionId, companyInfo as CompanyInfo);
        return companyInfo as CompanyInfo;
      }

      return null;
    } catch (error) {
      console.error('Error enriching company data:', error);
      return null;
    }
  }
  // Enrich data from IP address (using IPinfo.io for business enrichment)
  private async enrichFromIP(ip?: string): Promise<EnrichmentData | null> {
    if (!ip || ip === 'unknown') return null;

    try {
      // IPinfo API
      const token = 'b812b9db5828fe'; // Hårdkodad token
      const response = await fetch(`https://ipinfo.io/${ip}/json?token=${token}`);
      const data = await response.json();

      // If organization/company info is available
      let companyName = undefined;
      let companyDomain = undefined;
      let companyType = undefined;
      if (data.org) {
        // Example: "AS12345 Example Company S.L."
        const orgParts = data.org.split(' ');
        if (orgParts.length > 1) {
          companyName = orgParts.slice(1).join(' ');
        } else {
          companyName = data.org;
        }
      }
      if (data.company) {
        companyName = data.company.name || companyName;
        companyDomain = data.company.domain;
        companyType = data.company.type;
      }

      return {
        name: companyName,
        domain: companyDomain,
        industry: companyType,
        location: {
          city: data.city,
          country: data.country,
          region: data.region
        },
        confidence: companyName ? 0.9 : 0.7
      };
    } catch (error) {
      console.error('IPinfo enrichment failed:', error);
      return null;
    }
  }
  // Enrich data from domain (using WHOIS and business databases)
  private async enrichFromDomain(domain: string): Promise<EnrichmentData | null> {
    try {
      // You can use services like:
      // - Clearbit API
      // - Hunter.io
      // - FullContact
      // - ZoomInfo API
      // - LinkedIn Company API
        // Example with a generic business data API
      const response = await fetch(`https://api.clearbit.com/v2/companies/find?domain=${domain}`, {
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_CLEARBIT_API_KEY}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();        return {
          name: data.name,
          industry: data.category?.industry,
          size: this.mapEmployeeCount(data.metrics?.employees),
          location: {
            city: data.geo?.city,
            country: data.geo?.country
          },
          phone: data.phone,
          website: data.domain ? `https://${data.domain}` : undefined,
          confidence: 0.9
        };
      }
      
      return null;
    } catch (error) {
      console.error('Domain enrichment failed:', error);
      return null;
    }
  }
  // Enrich from email domains and patterns
  private async enrichFromEmailDomains(domain: string): Promise<EnrichmentData | null> {
    try {
      // Use email finding services like Hunter.io
      const response = await fetch(`https://api.hunter.io/v2/domain-search?domain=${domain}&api_key=${import.meta.env.VITE_HUNTER_API_KEY}`);
      
      if (response.ok) {
        const data = await response.json();
        const emails = data.data?.emails || [];
          if (emails.length > 0) {
          // Find the most likely contact email
          const contactEmail = emails.find((email: EmailSearchResult) => 
            email.type === 'generic' || 
            email.first_name?.toLowerCase().includes('contact') ||
            email.first_name?.toLowerCase().includes('info') ||
            email.first_name?.toLowerCase().includes('sales')
          ) || emails[0];
          
          return {
            email: contactEmail.value,
            confidence: contactEmail.confidence / 100
          };
        }
      }
      
      return null;
    } catch (error) {
      console.error('Email enrichment failed:', error);
      return null;
    }
  }
  // Enrich from business directories
  private async enrichFromBusinessDirectories(domain: string): Promise<EnrichmentData | null> {
    try {
      // Use business directory APIs like:
      // - Google Places API
      // - Yelp API
      // - Yellow Pages API
      // - Local business databases
      
      // This is a placeholder - implement based on your preferred service
      return null;
    } catch (error) {
      console.error('Directory enrichment failed:', error);
      return null;
    }
  }

  // Helper methods
  private generateSessionId(ip: string, userAgent: string): string {
    const today = new Date().toISOString().split('T')[0];
    return btoa(`${ip}_${userAgent}_${today}`).replace(/[^a-zA-Z0-9]/g, '').substring(0, 16);
  }

  private mapEmployeeCount(employees?: number): string {
    if (!employees) return 'Unknown';
    if (employees < 10) return '1-10';
    if (employees < 50) return '11-50';
    if (employees < 200) return '51-200';
    if (employees < 1000) return '201-1000';
    return '1000+';
  }

  // Database operations (implement based on your backend)
  private async getSession(sessionId: string): Promise<VisitorSession | null> {
    // Implement database query to get session
    return null;
  }

  private async createSession(data: CreateSessionData): Promise<VisitorSession> {
    // Implement database insert for new session
    return {} as VisitorSession;
  }

  private async recordPageView(sessionId: string, pageVisit: PageVisit): Promise<void> {
    // Implement database update for page view
  }

  private async recordFormSubmission(sessionId: string, formData: TrackingEventData): Promise<void> {
    // Implement database update for form submission
  }

  private async updateScrollDepth(sessionId: string, url: string, depth: number): Promise<void> {
    // Implement database update for scroll depth
  }

  private async endSession(sessionId: string, duration: number): Promise<void> {
    // Implement database update for session end
  }

  private async updateSessionCompanyInfo(sessionId: string, companyInfo: CompanyInfo): Promise<void> {
    // Implement database update for company info
  }

  // Public API methods
  async getRealTimeVisitors(): Promise<RealTimeVisitor[]> {
    try {
      const response = await fetch(`${this.apiEndpoint}/api/visitors/realtime`);
      return await response.json();
    } catch (error) {
      console.error('Failed to get real-time visitors:', error);
      return [];
    }
  }

  async getVisitorSessions(filters?: {
    from?: Date;
    to?: Date;
    domain?: string;
    hasCompanyInfo?: boolean;
  }): Promise<VisitorSession[]> {
    try {
      const params = new URLSearchParams();
      if (filters?.from) params.append('from', filters.from.toISOString());
      if (filters?.to) params.append('to', filters.to.toISOString());
      if (filters?.domain) params.append('domain', filters.domain);
      if (filters?.hasCompanyInfo !== undefined) params.append('hasCompanyInfo', filters.hasCompanyInfo.toString());

      const response = await fetch(`${this.apiEndpoint}/api/visitors/sessions?${params}`);
      return await response.json();
    } catch (error) {
      console.error('Failed to get visitor sessions:', error);
      return [];
    }
  }

  async getCompanyLeads(filters?: {
    minConfidence?: number;
    industry?: string;
    size?: string;
    hasContactInfo?: boolean;
  }): Promise<Company[]> {
    try {
      const sessions = await this.getVisitorSessions({ hasCompanyInfo: true });
      
      return sessions
        .filter(session => session.companyInfo)
        .filter(session => !filters?.minConfidence || (session.companyInfo!.confidence >= filters.minConfidence))
        .filter(session => !filters?.industry || session.companyInfo!.industry === filters.industry)
        .filter(session => !filters?.size || session.companyInfo!.size === filters.size)
        .filter(session => !filters?.hasContactInfo || (session.companyInfo!.email || session.companyInfo!.phone))
        .map(session => this.sessionToCompany(session))
        .filter((company, index, arr) => arr.findIndex(c => c.domain === company.domain) === index); // Remove duplicates
    } catch (error) {
      console.error('Failed to get company leads:', error);
      return [];
    }
  }

  private sessionToCompany(session: VisitorSession): Company {
    const companyInfo = session.companyInfo!;
    
    return {
      id: session.id,
      name: companyInfo.name || companyInfo.domain,
      domain: companyInfo.domain,
      industry: companyInfo.industry || 'Unknown',
      size: companyInfo.size || 'Unknown',      location: {
        city: companyInfo.location?.city || 'Unknown',
        country: companyInfo.location?.country || 'Unknown'
      },
      lastVisit: session.timestamp,
      totalVisits: session.pages.length,
      score: Math.round(companyInfo.confidence * 100),
      status: this.calculateLeadStatus(session),
      tags: this.generateTags(session)
    };
  }

  private calculateLeadStatus(session: VisitorSession): 'hot' | 'warm' | 'cold' {
    const score = session.companyInfo?.confidence || 0;
    const pageViews = session.pages.length;
    const hasContactInfo = !!(session.companyInfo?.email || session.companyInfo?.phone);
    
    if (score > 0.8 && pageViews >= 3 && hasContactInfo) return 'hot';
    if (score > 0.5 && pageViews >= 2) return 'warm';
    return 'cold';
  }

  private generateTags(session: VisitorSession): string[] {
    const tags: string[] = [];
    
    if (session.companyInfo?.email) tags.push('Has Email');
    if (session.companyInfo?.phone) tags.push('Has Phone');
    if (session.pages.length >= 5) tags.push('High Engagement');
    if (session.companyInfo?.confidence && session.companyInfo.confidence > 0.8) tags.push('High Confidence');
    if (session.sessionDuration && session.sessionDuration > 300000) tags.push('Long Session'); // 5+ minutes
    
    return tags;
  }
}

export const realVisitorTrackingService = new RealVisitorTrackingService();
