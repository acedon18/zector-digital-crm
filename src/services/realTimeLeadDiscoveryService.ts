// Real-time Lead Discovery Service - Monitors platform changes and discovers new leads
import { Company } from '@/types/leads';
import { PlatformType } from '@/types/integrations';
import { dataEnrichmentService } from './dataEnrichmentService';
import { platformSyncService } from './platformSyncService';
import { PlatformServiceFactory } from './platformApiService';

export interface LeadDiscoveryConfig {
  enableRealTimeDiscovery: boolean;
  discoveryInterval: number; // minutes
  platforms: PlatformType[];
  minEngagementScore: number;
  autoEnrichNewLeads: boolean;
  notifyOnNewLeads: boolean;
}

export interface DiscoveredLead {
  company: Company;
  discoverySource: PlatformType;
  discoveryTimestamp: Date;
  engagementData: Record<string, any>;
  confidence: number;
  reasons: string[];
}

export interface LeadDiscoveryEvent {
  type: 'new_lead' | 'lead_updated' | 'high_value_activity' | 'conversion_event';
  lead: DiscoveredLead;
  timestamp: Date;
}

export class RealTimeLeadDiscoveryService {
  private isRunning = false;
  private discoveryInterval: NodeJS.Timeout | null = null;
  private config: LeadDiscoveryConfig;
  private listeners: Array<(event: LeadDiscoveryEvent) => void> = [];
  private lastDiscoveryRun: Date | null = null;

  constructor(config?: Partial<LeadDiscoveryConfig>) {
    this.config = {
      enableRealTimeDiscovery: true,
      discoveryInterval: 5, // Every 5 minutes
      platforms: ['google_analytics', 'google_ads', 'meta_ads', 'hubspot'],
      minEngagementScore: 60,
      autoEnrichNewLeads: true,
      notifyOnNewLeads: true,
      ...config
    };

    this.loadConfig();
  }

  private loadConfig() {
    try {
      const stored = localStorage.getItem('lead_discovery_config');
      if (stored) {
        const storedConfig = JSON.parse(stored);
        this.config = { ...this.config, ...storedConfig };
      }
    } catch (error) {
      console.error('Failed to load discovery config:', error);
    }
  }

  private saveConfig() {
    try {
      localStorage.setItem('lead_discovery_config', JSON.stringify(this.config));
    } catch (error) {
      console.error('Failed to save discovery config:', error);
    }
  }

  // Start real-time lead discovery
  start() {
    if (this.isRunning) return;

    this.isRunning = true;
    console.log('Starting real-time lead discovery service');

    // Initial discovery run
    this.runDiscovery();

    // Schedule recurring discovery
    if (this.config.enableRealTimeDiscovery) {
      this.discoveryInterval = setInterval(() => {
        this.runDiscovery();
      }, this.config.discoveryInterval * 60 * 1000);
    }
  }

  // Stop the discovery service
  stop() {
    if (!this.isRunning) return;

    this.isRunning = false;
    console.log('Stopping real-time lead discovery service');

    if (this.discoveryInterval) {
      clearInterval(this.discoveryInterval);
      this.discoveryInterval = null;
    }
  }

  // Main discovery function
  private async runDiscovery() {
    try {
      console.log('Running lead discovery across platforms...');
      const startTime = new Date();

      const discoveryPromises = this.config.platforms.map(platform => 
        this.discoverLeadsFromPlatform(platform)
      );

      const results = await Promise.allSettled(discoveryPromises);
      const discoveredLeads: DiscoveredLead[] = [];

      results.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          discoveredLeads.push(...result.value);
        } else {
          console.error(`Discovery failed for ${this.config.platforms[index]}:`, result.reason);
        }
      });

      // Process discovered leads
      for (const lead of discoveredLeads) {
        await this.processDiscoveredLead(lead);
      }

      this.lastDiscoveryRun = startTime;
      console.log(`Discovery completed. Found ${discoveredLeads.length} potential leads.`);

    } catch (error) {
      console.error('Lead discovery run failed:', error);
    }
  }

  // Discover leads from a specific platform
  private async discoverLeadsFromPlatform(platform: PlatformType): Promise<DiscoveredLead[]> {
    const service = PlatformServiceFactory.createService(platform);
    const discoveredLeads: DiscoveredLead[] = [];

    try {
      switch (platform) {
        case 'google_analytics':
          const gaLeads = await this.discoverFromGoogleAnalytics(service);
          discoveredLeads.push(...gaLeads);
          break;

        case 'google_ads':
          const adLeads = await this.discoverFromGoogleAds(service);
          discoveredLeads.push(...adLeads);
          break;

        case 'meta_ads':
          const metaLeads = await this.discoverFromMetaAds(service);
          discoveredLeads.push(...metaLeads);
          break;

        case 'hubspot':
          const hubspotLeads = await this.discoverFromHubSpot(service);
          discoveredLeads.push(...hubspotLeads);
          break;

        default:
          console.log(`Discovery not implemented for ${platform}`);
      }
    } catch (error) {
      console.error(`Failed to discover from ${platform}:`, error);
    }

    return discoveredLeads;
  }

  // Google Analytics lead discovery
  private async discoverFromGoogleAnalytics(service: any): Promise<DiscoveredLead[]> {
    const dateRange = {
      from: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
      to: new Date()
    };

    const trafficData = await service.getWebsiteTraffic('GA_PROPERTY_ID', dateRange);
    const conversionData = await service.getConversionEvents('GA_PROPERTY_ID');

    // Mock implementation - in real scenario, analyze GA data for high-value sessions
    const leads: DiscoveredLead[] = [];

    // Look for high-engagement sessions
    if (trafficData.sessions > 100) {
      const mockLead: DiscoveredLead = {
        company: {
          id: `ga_discovery_${Date.now()}`,
          name: 'High Traffic Company',
          domain: 'high-traffic.com',
          industry: 'Technology',
          size: 'Unknown',
          location: { city: 'Unknown', country: 'Unknown' },
          lastVisit: new Date(),
          totalVisits: trafficData.sessions,
          score: Math.min(100, Math.floor(trafficData.sessions / 10)),
          status: 'warm',
          tags: ['Google Analytics', 'High Traffic']
        },
        discoverySource: 'google_analytics',
        discoveryTimestamp: new Date(),
        engagementData: {
          sessions: trafficData.sessions,
          pageviews: trafficData.pageviews,
          avgSessionDuration: trafficData.avgSessionDuration,
          conversions: conversionData.formSubmissions
        },
        confidence: 0.7,
        reasons: ['High session volume', 'Form submissions detected']
      };

      if (mockLead.company.score >= this.config.minEngagementScore) {
        leads.push(mockLead);
      }
    }

    return leads;
  }

  // Google Ads lead discovery
  private async discoverFromGoogleAds(service: any): Promise<DiscoveredLead[]> {
    const dateRange = {
      from: new Date(Date.now() - 24 * 60 * 60 * 1000),
      to: new Date()
    };

    const campaignData = await service.getCampaignData('CUSTOMER_ID', dateRange);
    const leads: DiscoveredLead[] = [];

    // Look for high-converting campaigns
    campaignData.campaigns.forEach((campaign: any, index: number) => {
      if (campaign.conversions > 0) {
        const lead: DiscoveredLead = {
          company: {
            id: `gads_discovery_${Date.now()}_${index}`,
            name: `Google Ads Lead ${index + 1}`,
            domain: `gads-lead-${index}.com`,
            industry: 'Technology',
            size: 'Unknown',
            location: { city: 'Unknown', country: 'Unknown' },
            lastVisit: new Date(),
            totalVisits: campaign.clicks,
            score: Math.min(100, campaign.conversions * 20 + 50),
            status: campaign.conversions > 5 ? 'hot' : 'warm',
            tags: ['Google Ads', 'Conversion', campaign.name]
          },
          discoverySource: 'google_ads',
          discoveryTimestamp: new Date(),
          engagementData: {
            campaignName: campaign.name,
            clicks: campaign.clicks,
            conversions: campaign.conversions,
            cost: campaign.cost,
            ctr: campaign.ctr
          },
          confidence: 0.8,
          reasons: [`${campaign.conversions} conversions`, `${campaign.clicks} clicks`]
        };

        if (lead.company.score >= this.config.minEngagementScore) {
          leads.push(lead);
        }
      }
    });

    return leads;
  }

  // Meta Ads lead discovery
  private async discoverFromMetaAds(service: any): Promise<DiscoveredLead[]> {
    const dateRange = {
      from: new Date(Date.now() - 24 * 60 * 60 * 1000),
      to: new Date()
    };

    const campaignData = await service.getCampaignInsights('AD_ACCOUNT_ID', dateRange);
    const leads: DiscoveredLead[] = [];

    campaignData.campaigns.forEach((campaign: any, index: number) => {
      if (campaign.leads > 0) {
        const lead: DiscoveredLead = {
          company: {
            id: `meta_discovery_${Date.now()}_${index}`,
            name: `Meta Ads Lead ${index + 1}`,
            domain: `meta-lead-${index}.com`,
            industry: 'Technology',
            size: 'Unknown',
            location: { city: 'Unknown', country: 'Unknown' },
            lastVisit: new Date(),
            totalVisits: campaign.clicks,
            score: Math.min(100, campaign.leads * 15 + 40),
            status: campaign.leads > 3 ? 'hot' : 'warm',
            tags: ['Meta Ads', 'Lead Generation', campaign.name]
          },
          discoverySource: 'meta_ads',
          discoveryTimestamp: new Date(),
          engagementData: {
            campaignName: campaign.name,
            clicks: campaign.clicks,
            leads: campaign.leads,
            spend: campaign.spend,
            cpl: campaign.cpl
          },
          confidence: 0.85,
          reasons: [`${campaign.leads} leads generated`, `CPL: $${campaign.cpl}`]
        };

        if (lead.company.score >= this.config.minEngagementScore) {
          leads.push(lead);
        }
      }
    });

    return leads;
  }

  // HubSpot lead discovery
  private async discoverFromHubSpot(service: any): Promise<DiscoveredLead[]> {
    const contacts = await service.getContacts(100);
    const leads: DiscoveredLead[] = [];

    // Look for recent high-value contacts
    contacts.contacts.forEach((contact: any) => {
      const lastActivity = new Date(contact.lastActivity);
      const hoursSinceActivity = (Date.now() - lastActivity.getTime()) / (1000 * 60 * 60);

      if (hoursSinceActivity <= 24) { // Activity in last 24 hours
        const lead: DiscoveredLead = {
          company: {
            id: `hubspot_discovery_${contact.id}`,
            name: contact.company || 'HubSpot Contact',
            domain: contact.email ? contact.email.split('@')[1] : 'unknown.com',
            industry: 'Unknown',
            size: 'Unknown',
            location: { city: 'Unknown', country: 'Unknown' },
            lastVisit: lastActivity,
            totalVisits: 1,
            score: 70,
            status: contact.leadStatus === 'new' ? 'hot' : 'warm',
            tags: ['HubSpot', 'CRM Contact', contact.source || 'Unknown Source']
          },
          discoverySource: 'hubspot',
          discoveryTimestamp: new Date(),
          engagementData: {
            email: contact.email,
            firstName: contact.firstName,
            lastName: contact.lastName,
            leadStatus: contact.leadStatus,
            source: contact.source,
            lastActivity: contact.lastActivity
          },
          confidence: 0.9,
          reasons: ['Recent CRM activity', 'Qualified contact']
        };

        if (lead.company.score >= this.config.minEngagementScore) {
          leads.push(lead);
        }
      }
    });

    return leads;
  }

  // Process a discovered lead
  private async processDiscoveredLead(lead: DiscoveredLead) {
    try {
      // Check if this lead already exists
      const existingLead = await this.findExistingLead(lead.company.domain);
      
      if (existingLead) {
        // Update existing lead with new data
        await this.updateExistingLead(existingLead, lead);
        this.notifyListeners({
          type: 'lead_updated',
          lead,
          timestamp: new Date()
        });
      } else {
        // Auto-enrich new lead if enabled
        if (this.config.autoEnrichNewLeads) {
          try {
            const enrichedData = await dataEnrichmentService.enrichCompany(lead.company);
            lead.company = enrichedData.company;
          } catch (error) {
            console.warn('Failed to enrich new lead:', error);
          }
        }

        // Notify about new lead
        this.notifyListeners({
          type: 'new_lead',
          lead,
          timestamp: new Date()
        });
      }

      // Check for high-value activity
      if (lead.company.score >= 80 || lead.confidence >= 0.9) {
        this.notifyListeners({
          type: 'high_value_activity',
          lead,
          timestamp: new Date()
        });
      }

    } catch (error) {
      console.error('Failed to process discovered lead:', error);
    }
  }

  // Find existing lead by domain
  private async findExistingLead(domain: string): Promise<Company | null> {
    // In real implementation, this would query your database
    // For now, return null to treat all as new leads
    return null;
  }

  // Update existing lead with new discovery data
  private async updateExistingLead(existingLead: Company, discoveredLead: DiscoveredLead) {
    // In real implementation, this would update the database
    console.log('Updating existing lead with new data:', {
      existing: existingLead.name,
      discovered: discoveredLead.company.name,
      newScore: discoveredLead.company.score
    });
  }

  // Event listener management
  addEventListener(listener: (event: LeadDiscoveryEvent) => void) {
    this.listeners.push(listener);
  }

  removeEventListener(listener: (event: LeadDiscoveryEvent) => void) {
    const index = this.listeners.indexOf(listener);
    if (index > -1) {
      this.listeners.splice(index, 1);
    }
  }

  private notifyListeners(event: LeadDiscoveryEvent) {
    this.listeners.forEach(listener => {
      try {
        listener(event);
      } catch (error) {
        console.error('Event listener error:', error);
      }
    });
  }

  // Configuration management
  updateConfig(newConfig: Partial<LeadDiscoveryConfig>) {
    this.config = { ...this.config, ...newConfig };
    this.saveConfig();

    // Restart service with new config if it was running
    if (this.isRunning) {
      this.stop();
      this.start();
    }
  }

  getConfig(): LeadDiscoveryConfig {
    return { ...this.config };
  }

  // Status and metrics
  getStatus() {
    return {
      isRunning: this.isRunning,
      lastDiscoveryRun: this.lastDiscoveryRun,
      nextDiscoveryRun: this.lastDiscoveryRun && this.config.enableRealTimeDiscovery
        ? new Date(this.lastDiscoveryRun.getTime() + this.config.discoveryInterval * 60 * 1000)
        : null,
      enabledPlatforms: this.config.platforms,
      minEngagementScore: this.config.minEngagementScore,
      listenerCount: this.listeners.length
    };
  }

  // Manual discovery trigger
  async discoverNow(): Promise<{ discovered: number; processed: number }> {
    console.log('Manual discovery triggered');
    
    const startTime = Date.now();
    await this.runDiscovery();
    const endTime = Date.now();
    
    console.log(`Manual discovery completed in ${endTime - startTime}ms`);
    
    // Return mock metrics for now
    return {
      discovered: Math.floor(Math.random() * 5) + 1,
      processed: Math.floor(Math.random() * 3) + 1
    };
  }
}

// Export singleton instance
export const realTimeLeadDiscoveryService = new RealTimeLeadDiscoveryService();
