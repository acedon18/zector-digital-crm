// Data Enrichment Service - Enhance lead data with platform information
import { Company } 
            param($match)
            $typePath = $matches[1]
            $fullTypePath = Join-Path $typesDir "$typePath.ts"
            $relativePath = Get-RelativePath -from $filePath -to $fullTypePath
            # Remove .ts extension from import path
            $relativePath = $relativePath -replace '\.ts;
import { PlatformType } from '@/types/integrations';
import { PlatformServiceFactory } from './platformApiService';

export interface EnrichedLeadData {
  company: Company;
  platformData: {
    [key in PlatformType]?: {
      lastSync: Date;
      data: any;
      metrics?: any;
    };
  };
  enrichmentScore: number;
  lastEnriched: Date;
}

export interface CompanyEnrichmentResult {
  foundMatch: boolean;
  confidence: number;
  sources: PlatformType[];
  enrichedData: Partial<Company>;
  additionalData: Record<string, any>;
}

export class DataEnrichmentService {
  private connectedPlatforms: Set<PlatformType> = new Set();
  
  constructor() {
    // Initialize with connected platforms from localStorage
    this.loadConnectedPlatforms();
  }

  private loadConnectedPlatforms() {
    try {
      const stored = localStorage.getItem('customer_settings');
      if (stored) {
        const settings = JSON.parse(stored);
        if (settings.integrations) {
          Object.keys(settings.integrations).forEach(platform => {
            if (settings.integrations[platform].isConnected) {
              this.connectedPlatforms.add(platform as PlatformType);
            }
          });
        }
      }
    } catch (error) {
      console.error('Failed to load connected platforms:', error);
    }
  }

  // Enrich a single company with data from all connected platforms
  async enrichCompany(company: Company): Promise<EnrichedLeadData> {
    const platformData: EnrichedLeadData['platformData'] = {};
    let enrichmentScore = 0;
    let totalSources = 0;

    // Enrich from Google Analytics if connected
    if (this.connectedPlatforms.has('google_analytics')) {
      try {
        const gaService = PlatformServiceFactory.createService('google_analytics');
        const trafficData = await this.getCompanyTrafficData(company.domain);
        
        platformData.google_analytics = {
          lastSync: new Date(),
          data: trafficData,
          metrics: {
            sessions: trafficData.sessions,
            pageviews: trafficData.pageviews,
            avgSessionDuration: trafficData.avgSessionDuration
          }
        };
        
        enrichmentScore += this.calculateTrafficScore(trafficData);
        totalSources++;
      } catch (error) {
        console.error('Failed to enrich from Google Analytics:', error);
      }
    }

    // Enrich from advertising platforms
    for (const platform of ['google_ads', 'meta_ads', 'tiktok_ads'] as PlatformType[]) {
      if (this.connectedPlatforms.has(platform)) {
        try {
          const adData = await this.getCompanyAdInteractions(company.domain, platform);
          
          platformData[platform] = {
            lastSync: new Date(),
            data: adData,
            metrics: {
              clicks: adData.totalClicks,
              impressions: adData.totalImpressions,
              conversions: adData.totalConversions
            }
          };
          
          enrichmentScore += this.calculateAdScore(adData);
          totalSources++;
        } catch (error) {
          console.error(`Failed to enrich from ${platform}:`, error);
        }
      }
    }

    // Enrich from CRM platforms
    if (this.connectedPlatforms.has('hubspot')) {
      try {
        const crmData = await this.getCompanyCrmData(company.domain, 'hubspot');
        
        platformData.hubspot = {
          lastSync: new Date(),
          data: crmData,
          metrics: {
            contacts: crmData.contactCount,
            deals: crmData.dealCount,
            lastActivity: crmData.lastActivity
          }
        };
        
        enrichmentScore += this.calculateCrmScore(crmData);
        totalSources++;
      } catch (error) {
        console.error('Failed to enrich from HubSpot:', error);
      }
    }

    // Calculate final enrichment score
    const finalScore = totalSources > 0 ? enrichmentScore / totalSources : 0;

    return {
      company: {
        ...company,
        score: Math.max(company.score, Math.floor(finalScore)) // Use higher of existing or enriched score
      },
      platformData,
      enrichmentScore: finalScore,
      lastEnriched: new Date()
    };
  }

  // Enrich multiple companies in batch
  async enrichCompanies(companies: Company[]): Promise<EnrichedLeadData[]> {
    const enrichedCompanies: EnrichedLeadData[] = [];
    
    // Process in batches to avoid overwhelming APIs
    const batchSize = 5;
    for (let i = 0; i < companies.length; i += batchSize) {
      const batch = companies.slice(i, i + batchSize);
      const promises = batch.map(company => this.enrichCompany(company));
      
      try {
        const results = await Promise.allSettled(promises);
        results.forEach((result, index) => {
          if (result.status === 'fulfilled') {
            enrichedCompanies.push(result.value);
          } else {
            console.error(`Failed to enrich company ${batch[index].name}:`, result.reason);
            // Add company without enrichment
            enrichedCompanies.push({
              company: batch[index],
              platformData: {},
              enrichmentScore: 0,
              lastEnriched: new Date()
            });
          }
        });
      } catch (error) {
        console.error('Batch enrichment failed:', error);
      }

      // Add delay between batches to respect rate limits
      if (i + batchSize < companies.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    return enrichedCompanies;
  }

  // Get company traffic data from analytics
  private async getCompanyTrafficData(domain: string) {
    // Mock implementation - in real scenario, would query GA API filtered by domain
    return {
      sessions: Math.floor(Math.random() * 1000) + 100,
      pageviews: Math.floor(Math.random() * 5000) + 500,
      avgSessionDuration: Math.floor(Math.random() * 300) + 60,
      bounceRate: Math.random() * 40 + 30,
      topPages: [
        '/pricing',
        '/features',
        '/demo'
      ],
      trafficSources: {
        organic: Math.floor(Math.random() * 500) + 50,
        direct: Math.floor(Math.random() * 300) + 30,
        referral: Math.floor(Math.random() * 200) + 20
      }
    };
  }

  // Get company ad interaction data
  private async getCompanyAdInteractions(domain: string, platform: PlatformType) {
    // Mock implementation - would query ad platform APIs for domain-specific data
    const baseClicks = Math.floor(Math.random() * 100) + 10;
    return {
      totalClicks: baseClicks,
      totalImpressions: baseClicks * (Math.floor(Math.random() * 20) + 10),
      totalConversions: Math.floor(baseClicks * (Math.random() * 0.1 + 0.01)),
      spend: baseClicks * (Math.random() * 3 + 1),
      campaigns: [
        {
          name: `${platform} Campaign for ${domain}`,
          clicks: baseClicks,
          status: 'active'
        }
      ]
    };
  }

  // Get company CRM data
  private async getCompanyCrmData(domain: string, platform: PlatformType) {
    // Mock implementation - would query CRM APIs for company/domain data
    return {
      contactCount: Math.floor(Math.random() * 10) + 1,
      dealCount: Math.floor(Math.random() * 5),
      totalDealValue: Math.floor(Math.random() * 50000) + 5000,
      lastActivity: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
      leadStatus: ['new', 'qualified', 'opportunity'][Math.floor(Math.random() * 3)],
      contacts: [
        {
          email: `contact@${domain}`,
          name: 'Primary Contact',
          role: 'Decision Maker'
        }
      ]
    };
  }

  // Calculate scoring based on traffic data
  private calculateTrafficScore(trafficData: any): number {
    let score = 0;
    
    // Sessions scoring (0-30 points)
    if (trafficData.sessions > 1000) score += 30;
    else if (trafficData.sessions > 500) score += 20;
    else if (trafficData.sessions > 100) score += 10;
    
    // Engagement scoring (0-25 points)
    if (trafficData.avgSessionDuration > 180) score += 25;
    else if (trafficData.avgSessionDuration > 120) score += 15;
    else if (trafficData.avgSessionDuration > 60) score += 10;
    
    // Bounce rate scoring (0-20 points)
    if (trafficData.bounceRate < 30) score += 20;
    else if (trafficData.bounceRate < 50) score += 10;
    
    return score;
  }

  // Calculate scoring based on ad interaction data
  private calculateAdScore(adData: any): number {
    let score = 0;
    
    // Click volume scoring (0-25 points)
    if (adData.totalClicks > 100) score += 25;
    else if (adData.totalClicks > 50) score += 15;
    else if (adData.totalClicks > 10) score += 10;
    
    // Conversion scoring (0-35 points)
    if (adData.totalConversions > 10) score += 35;
    else if (adData.totalConversions > 5) score += 25;
    else if (adData.totalConversions > 1) score += 15;
    
    return score;
  }

  // Calculate scoring based on CRM data
  private calculateCrmScore(crmData: any): number {
    let score = 0;
    
    // Contact count scoring (0-20 points)
    if (crmData.contactCount > 5) score += 20;
    else if (crmData.contactCount > 2) score += 15;
    else if (crmData.contactCount > 0) score += 10;
    
    // Deal value scoring (0-30 points)
    if (crmData.totalDealValue > 25000) score += 30;
    else if (crmData.totalDealValue > 10000) score += 20;
    else if (crmData.totalDealValue > 0) score += 10;
    
    // Recent activity scoring (0-25 points)
    const daysSinceActivity = (Date.now() - new Date(crmData.lastActivity).getTime()) / (1000 * 60 * 60 * 24);
    if (daysSinceActivity < 7) score += 25;
    else if (daysSinceActivity < 30) score += 15;
    else if (daysSinceActivity < 90) score += 10;
    
    return score;
  }

  // Find potential companies from platform data
  async findNewLeads(): Promise<Company[]> {
    const newLeads: Company[] = [];
    
    // Search Google Analytics for new high-engagement domains
    if (this.connectedPlatforms.has('google_analytics')) {
      const gaLeads = await this.findLeadsFromAnalytics();
      newLeads.push(...gaLeads);
    }
    
    // Search ad platforms for high-converting domains
    for (const platform of ['google_ads', 'meta_ads', 'tiktok_ads'] as PlatformType[]) {
      if (this.connectedPlatforms.has(platform)) {
        const adLeads = await this.findLeadsFromAds(platform);
        newLeads.push(...adLeads);
      }
    }
    
    // Deduplicate by domain
    const uniqueLeads = newLeads.reduce((acc, lead) => {
      if (!acc.find(existing => existing.domain === lead.domain)) {
        acc.push(lead);
      }
      return acc;
    }, [] as Company[]);
    
    return uniqueLeads;
  }

  private async findLeadsFromAnalytics(): Promise<Company[]> {
    // Mock implementation - would query GA for high-value sessions
    return [
      {
        id: `ga_lead_${Date.now()}`,
        name: 'Analytics Discovered Company',
        domain: 'newlead.com',
        industry: 'Technology',
        size: 'Unknown',
        location: { city: 'Stockholm', country: 'Sweden' },
        lastVisit: new Date(),
        totalVisits: Math.floor(Math.random() * 10) + 5,
        score: Math.floor(Math.random() * 40) + 60,
        status: 'warm' as const,
        tags: ['Analytics Discovery', 'High Engagement']
      }
    ];
  }

  private async findLeadsFromAds(platform: PlatformType): Promise<Company[]> {
    // Mock implementation - would query ad platforms for conversion data
    return [
      {
        id: `${platform}_lead_${Date.now()}`,
        name: `${platform} Discovered Company`,
        domain: `${platform}-lead.com`,
        industry: 'Technology',
        size: 'Unknown',
        location: { city: 'Gothenburg', country: 'Sweden' },
        lastVisit: new Date(),
        totalVisits: Math.floor(Math.random() * 5) + 1,
        score: Math.floor(Math.random() * 30) + 50,
        status: 'warm' as const,
        tags: [`${platform} Lead`, 'Ad Conversion']
      }
    ];
  }

  // Update connected platforms when integrations change
  updateConnectedPlatforms(platforms: PlatformType[]) {
    this.connectedPlatforms = new Set(platforms);
  }

  // Get enrichment summary
  getEnrichmentSummary(enrichedData: EnrichedLeadData[]): {
    totalCompanies: number;
    enrichedCompanies: number;
    platformCoverage: Record<PlatformType, number>;
    averageScore: number;
  } {
    const summary = {
      totalCompanies: enrichedData.length,
      enrichedCompanies: enrichedData.filter(e => e.enrichmentScore > 0).length,
      platformCoverage: {} as Record<PlatformType, number>,
      averageScore: 0
    };

    // Calculate platform coverage
    const platformTypes: PlatformType[] = [
      'google_analytics', 'google_ads', 'meta_ads', 'tiktok_ads', 
      'google_tag_manager', 'hubspot', 'pipedrive', 'salesforce'
    ];

    platformTypes.forEach(platform => {
      const companiesWithPlatform = enrichedData.filter(
        e => e.platformData[platform]
      ).length;
      summary.platformCoverage[platform] = companiesWithPlatform;
    });

    // Calculate average enrichment score
    if (enrichedData.length > 0) {
      summary.averageScore = enrichedData.reduce(
        (sum, e) => sum + e.enrichmentScore, 0
      ) / enrichedData.length;
    }

    return summary;
  }
}

// Export singleton instance
export const dataEnrichmentService = new DataEnrichmentService();
, ''
            return "from '$relativePath'"
        ;
import { PlatformType } 
            param($match)
            $typePath = $matches[1]
            $fullTypePath = Join-Path $typesDir "$typePath.ts"
            $relativePath = Get-RelativePath -from $filePath -to $fullTypePath
            # Remove .ts extension from import path
            $relativePath = $relativePath -replace '\.ts;
import { PlatformServiceFactory } from './platformApiService';

export interface EnrichedLeadData {
  company: Company;
  platformData: {
    [key in PlatformType]?: {
      lastSync: Date;
      data: any;
      metrics?: any;
    };
  };
  enrichmentScore: number;
  lastEnriched: Date;
}

export interface CompanyEnrichmentResult {
  foundMatch: boolean;
  confidence: number;
  sources: PlatformType[];
  enrichedData: Partial<Company>;
  additionalData: Record<string, any>;
}

export class DataEnrichmentService {
  private connectedPlatforms: Set<PlatformType> = new Set();
  
  constructor() {
    // Initialize with connected platforms from localStorage
    this.loadConnectedPlatforms();
  }

  private loadConnectedPlatforms() {
    try {
      const stored = localStorage.getItem('customer_settings');
      if (stored) {
        const settings = JSON.parse(stored);
        if (settings.integrations) {
          Object.keys(settings.integrations).forEach(platform => {
            if (settings.integrations[platform].isConnected) {
              this.connectedPlatforms.add(platform as PlatformType);
            }
          });
        }
      }
    } catch (error) {
      console.error('Failed to load connected platforms:', error);
    }
  }

  // Enrich a single company with data from all connected platforms
  async enrichCompany(company: Company): Promise<EnrichedLeadData> {
    const platformData: EnrichedLeadData['platformData'] = {};
    let enrichmentScore = 0;
    let totalSources = 0;

    // Enrich from Google Analytics if connected
    if (this.connectedPlatforms.has('google_analytics')) {
      try {
        const gaService = PlatformServiceFactory.createService('google_analytics');
        const trafficData = await this.getCompanyTrafficData(company.domain);
        
        platformData.google_analytics = {
          lastSync: new Date(),
          data: trafficData,
          metrics: {
            sessions: trafficData.sessions,
            pageviews: trafficData.pageviews,
            avgSessionDuration: trafficData.avgSessionDuration
          }
        };
        
        enrichmentScore += this.calculateTrafficScore(trafficData);
        totalSources++;
      } catch (error) {
        console.error('Failed to enrich from Google Analytics:', error);
      }
    }

    // Enrich from advertising platforms
    for (const platform of ['google_ads', 'meta_ads', 'tiktok_ads'] as PlatformType[]) {
      if (this.connectedPlatforms.has(platform)) {
        try {
          const adData = await this.getCompanyAdInteractions(company.domain, platform);
          
          platformData[platform] = {
            lastSync: new Date(),
            data: adData,
            metrics: {
              clicks: adData.totalClicks,
              impressions: adData.totalImpressions,
              conversions: adData.totalConversions
            }
          };
          
          enrichmentScore += this.calculateAdScore(adData);
          totalSources++;
        } catch (error) {
          console.error(`Failed to enrich from ${platform}:`, error);
        }
      }
    }

    // Enrich from CRM platforms
    if (this.connectedPlatforms.has('hubspot')) {
      try {
        const crmData = await this.getCompanyCrmData(company.domain, 'hubspot');
        
        platformData.hubspot = {
          lastSync: new Date(),
          data: crmData,
          metrics: {
            contacts: crmData.contactCount,
            deals: crmData.dealCount,
            lastActivity: crmData.lastActivity
          }
        };
        
        enrichmentScore += this.calculateCrmScore(crmData);
        totalSources++;
      } catch (error) {
        console.error('Failed to enrich from HubSpot:', error);
      }
    }

    // Calculate final enrichment score
    const finalScore = totalSources > 0 ? enrichmentScore / totalSources : 0;

    return {
      company: {
        ...company,
        score: Math.max(company.score, Math.floor(finalScore)) // Use higher of existing or enriched score
      },
      platformData,
      enrichmentScore: finalScore,
      lastEnriched: new Date()
    };
  }

  // Enrich multiple companies in batch
  async enrichCompanies(companies: Company[]): Promise<EnrichedLeadData[]> {
    const enrichedCompanies: EnrichedLeadData[] = [];
    
    // Process in batches to avoid overwhelming APIs
    const batchSize = 5;
    for (let i = 0; i < companies.length; i += batchSize) {
      const batch = companies.slice(i, i + batchSize);
      const promises = batch.map(company => this.enrichCompany(company));
      
      try {
        const results = await Promise.allSettled(promises);
        results.forEach((result, index) => {
          if (result.status === 'fulfilled') {
            enrichedCompanies.push(result.value);
          } else {
            console.error(`Failed to enrich company ${batch[index].name}:`, result.reason);
            // Add company without enrichment
            enrichedCompanies.push({
              company: batch[index],
              platformData: {},
              enrichmentScore: 0,
              lastEnriched: new Date()
            });
          }
        });
      } catch (error) {
        console.error('Batch enrichment failed:', error);
      }

      // Add delay between batches to respect rate limits
      if (i + batchSize < companies.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    return enrichedCompanies;
  }

  // Get company traffic data from analytics
  private async getCompanyTrafficData(domain: string) {
    // Mock implementation - in real scenario, would query GA API filtered by domain
    return {
      sessions: Math.floor(Math.random() * 1000) + 100,
      pageviews: Math.floor(Math.random() * 5000) + 500,
      avgSessionDuration: Math.floor(Math.random() * 300) + 60,
      bounceRate: Math.random() * 40 + 30,
      topPages: [
        '/pricing',
        '/features',
        '/demo'
      ],
      trafficSources: {
        organic: Math.floor(Math.random() * 500) + 50,
        direct: Math.floor(Math.random() * 300) + 30,
        referral: Math.floor(Math.random() * 200) + 20
      }
    };
  }

  // Get company ad interaction data
  private async getCompanyAdInteractions(domain: string, platform: PlatformType) {
    // Mock implementation - would query ad platform APIs for domain-specific data
    const baseClicks = Math.floor(Math.random() * 100) + 10;
    return {
      totalClicks: baseClicks,
      totalImpressions: baseClicks * (Math.floor(Math.random() * 20) + 10),
      totalConversions: Math.floor(baseClicks * (Math.random() * 0.1 + 0.01)),
      spend: baseClicks * (Math.random() * 3 + 1),
      campaigns: [
        {
          name: `${platform} Campaign for ${domain}`,
          clicks: baseClicks,
          status: 'active'
        }
      ]
    };
  }

  // Get company CRM data
  private async getCompanyCrmData(domain: string, platform: PlatformType) {
    // Mock implementation - would query CRM APIs for company/domain data
    return {
      contactCount: Math.floor(Math.random() * 10) + 1,
      dealCount: Math.floor(Math.random() * 5),
      totalDealValue: Math.floor(Math.random() * 50000) + 5000,
      lastActivity: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
      leadStatus: ['new', 'qualified', 'opportunity'][Math.floor(Math.random() * 3)],
      contacts: [
        {
          email: `contact@${domain}`,
          name: 'Primary Contact',
          role: 'Decision Maker'
        }
      ]
    };
  }

  // Calculate scoring based on traffic data
  private calculateTrafficScore(trafficData: any): number {
    let score = 0;
    
    // Sessions scoring (0-30 points)
    if (trafficData.sessions > 1000) score += 30;
    else if (trafficData.sessions > 500) score += 20;
    else if (trafficData.sessions > 100) score += 10;
    
    // Engagement scoring (0-25 points)
    if (trafficData.avgSessionDuration > 180) score += 25;
    else if (trafficData.avgSessionDuration > 120) score += 15;
    else if (trafficData.avgSessionDuration > 60) score += 10;
    
    // Bounce rate scoring (0-20 points)
    if (trafficData.bounceRate < 30) score += 20;
    else if (trafficData.bounceRate < 50) score += 10;
    
    return score;
  }

  // Calculate scoring based on ad interaction data
  private calculateAdScore(adData: any): number {
    let score = 0;
    
    // Click volume scoring (0-25 points)
    if (adData.totalClicks > 100) score += 25;
    else if (adData.totalClicks > 50) score += 15;
    else if (adData.totalClicks > 10) score += 10;
    
    // Conversion scoring (0-35 points)
    if (adData.totalConversions > 10) score += 35;
    else if (adData.totalConversions > 5) score += 25;
    else if (adData.totalConversions > 1) score += 15;
    
    return score;
  }

  // Calculate scoring based on CRM data
  private calculateCrmScore(crmData: any): number {
    let score = 0;
    
    // Contact count scoring (0-20 points)
    if (crmData.contactCount > 5) score += 20;
    else if (crmData.contactCount > 2) score += 15;
    else if (crmData.contactCount > 0) score += 10;
    
    // Deal value scoring (0-30 points)
    if (crmData.totalDealValue > 25000) score += 30;
    else if (crmData.totalDealValue > 10000) score += 20;
    else if (crmData.totalDealValue > 0) score += 10;
    
    // Recent activity scoring (0-25 points)
    const daysSinceActivity = (Date.now() - new Date(crmData.lastActivity).getTime()) / (1000 * 60 * 60 * 24);
    if (daysSinceActivity < 7) score += 25;
    else if (daysSinceActivity < 30) score += 15;
    else if (daysSinceActivity < 90) score += 10;
    
    return score;
  }

  // Find potential companies from platform data
  async findNewLeads(): Promise<Company[]> {
    const newLeads: Company[] = [];
    
    // Search Google Analytics for new high-engagement domains
    if (this.connectedPlatforms.has('google_analytics')) {
      const gaLeads = await this.findLeadsFromAnalytics();
      newLeads.push(...gaLeads);
    }
    
    // Search ad platforms for high-converting domains
    for (const platform of ['google_ads', 'meta_ads', 'tiktok_ads'] as PlatformType[]) {
      if (this.connectedPlatforms.has(platform)) {
        const adLeads = await this.findLeadsFromAds(platform);
        newLeads.push(...adLeads);
      }
    }
    
    // Deduplicate by domain
    const uniqueLeads = newLeads.reduce((acc, lead) => {
      if (!acc.find(existing => existing.domain === lead.domain)) {
        acc.push(lead);
      }
      return acc;
    }, [] as Company[]);
    
    return uniqueLeads;
  }

  private async findLeadsFromAnalytics(): Promise<Company[]> {
    // Mock implementation - would query GA for high-value sessions
    return [
      {
        id: `ga_lead_${Date.now()}`,
        name: 'Analytics Discovered Company',
        domain: 'newlead.com',
        industry: 'Technology',
        size: 'Unknown',
        location: { city: 'Stockholm', country: 'Sweden' },
        lastVisit: new Date(),
        totalVisits: Math.floor(Math.random() * 10) + 5,
        score: Math.floor(Math.random() * 40) + 60,
        status: 'warm' as const,
        tags: ['Analytics Discovery', 'High Engagement']
      }
    ];
  }

  private async findLeadsFromAds(platform: PlatformType): Promise<Company[]> {
    // Mock implementation - would query ad platforms for conversion data
    return [
      {
        id: `${platform}_lead_${Date.now()}`,
        name: `${platform} Discovered Company`,
        domain: `${platform}-lead.com`,
        industry: 'Technology',
        size: 'Unknown',
        location: { city: 'Gothenburg', country: 'Sweden' },
        lastVisit: new Date(),
        totalVisits: Math.floor(Math.random() * 5) + 1,
        score: Math.floor(Math.random() * 30) + 50,
        status: 'warm' as const,
        tags: [`${platform} Lead`, 'Ad Conversion']
      }
    ];
  }

  // Update connected platforms when integrations change
  updateConnectedPlatforms(platforms: PlatformType[]) {
    this.connectedPlatforms = new Set(platforms);
  }

  // Get enrichment summary
  getEnrichmentSummary(enrichedData: EnrichedLeadData[]): {
    totalCompanies: number;
    enrichedCompanies: number;
    platformCoverage: Record<PlatformType, number>;
    averageScore: number;
  } {
    const summary = {
      totalCompanies: enrichedData.length,
      enrichedCompanies: enrichedData.filter(e => e.enrichmentScore > 0).length,
      platformCoverage: {} as Record<PlatformType, number>,
      averageScore: 0
    };

    // Calculate platform coverage
    const platformTypes: PlatformType[] = [
      'google_analytics', 'google_ads', 'meta_ads', 'tiktok_ads', 
      'google_tag_manager', 'hubspot', 'pipedrive', 'salesforce'
    ];

    platformTypes.forEach(platform => {
      const companiesWithPlatform = enrichedData.filter(
        e => e.platformData[platform]
      ).length;
      summary.platformCoverage[platform] = companiesWithPlatform;
    });

    // Calculate average enrichment score
    if (enrichedData.length > 0) {
      summary.averageScore = enrichedData.reduce(
        (sum, e) => sum + e.enrichmentScore, 0
      ) / enrichedData.length;
    }

    return summary;
  }
}

// Export singleton instance
export const dataEnrichmentService = new DataEnrichmentService();
, ''
            return "from '$relativePath'"
        ;
import { PlatformServiceFactory } from './platformApiService';

export interface EnrichedLeadData {
  company: Company;
  platformData: {
    [key in PlatformType]?: {
      lastSync: Date;
      data: any;
      metrics?: any;
    };
  };
  enrichmentScore: number;
  lastEnriched: Date;
}

export interface CompanyEnrichmentResult {
  foundMatch: boolean;
  confidence: number;
  sources: PlatformType[];
  enrichedData: Partial<Company>;
  additionalData: Record<string, any>;
}

export class DataEnrichmentService {
  private connectedPlatforms: Set<PlatformType> = new Set();
  
  constructor() {
    // Initialize with connected platforms from localStorage
    this.loadConnectedPlatforms();
  }

  private loadConnectedPlatforms() {
    try {
      const stored = localStorage.getItem('customer_settings');
      if (stored) {
        const settings = JSON.parse(stored);
        if (settings.integrations) {
          Object.keys(settings.integrations).forEach(platform => {
            if (settings.integrations[platform].isConnected) {
              this.connectedPlatforms.add(platform as PlatformType);
            }
          });
        }
      }
    } catch (error) {
      console.error('Failed to load connected platforms:', error);
    }
  }

  // Enrich a single company with data from all connected platforms
  async enrichCompany(company: Company): Promise<EnrichedLeadData> {
    const platformData: EnrichedLeadData['platformData'] = {};
    let enrichmentScore = 0;
    let totalSources = 0;

    // Enrich from Google Analytics if connected
    if (this.connectedPlatforms.has('google_analytics')) {
      try {
        const gaService = PlatformServiceFactory.createService('google_analytics');
        const trafficData = await this.getCompanyTrafficData(company.domain);
        
        platformData.google_analytics = {
          lastSync: new Date(),
          data: trafficData,
          metrics: {
            sessions: trafficData.sessions,
            pageviews: trafficData.pageviews,
            avgSessionDuration: trafficData.avgSessionDuration
          }
        };
        
        enrichmentScore += this.calculateTrafficScore(trafficData);
        totalSources++;
      } catch (error) {
        console.error('Failed to enrich from Google Analytics:', error);
      }
    }

    // Enrich from advertising platforms
    for (const platform of ['google_ads', 'meta_ads', 'tiktok_ads'] as PlatformType[]) {
      if (this.connectedPlatforms.has(platform)) {
        try {
          const adData = await this.getCompanyAdInteractions(company.domain, platform);
          
          platformData[platform] = {
            lastSync: new Date(),
            data: adData,
            metrics: {
              clicks: adData.totalClicks,
              impressions: adData.totalImpressions,
              conversions: adData.totalConversions
            }
          };
          
          enrichmentScore += this.calculateAdScore(adData);
          totalSources++;
        } catch (error) {
          console.error(`Failed to enrich from ${platform}:`, error);
        }
      }
    }

    // Enrich from CRM platforms
    if (this.connectedPlatforms.has('hubspot')) {
      try {
        const crmData = await this.getCompanyCrmData(company.domain, 'hubspot');
        
        platformData.hubspot = {
          lastSync: new Date(),
          data: crmData,
          metrics: {
            contacts: crmData.contactCount,
            deals: crmData.dealCount,
            lastActivity: crmData.lastActivity
          }
        };
        
        enrichmentScore += this.calculateCrmScore(crmData);
        totalSources++;
      } catch (error) {
        console.error('Failed to enrich from HubSpot:', error);
      }
    }

    // Calculate final enrichment score
    const finalScore = totalSources > 0 ? enrichmentScore / totalSources : 0;

    return {
      company: {
        ...company,
        score: Math.max(company.score, Math.floor(finalScore)) // Use higher of existing or enriched score
      },
      platformData,
      enrichmentScore: finalScore,
      lastEnriched: new Date()
    };
  }

  // Enrich multiple companies in batch
  async enrichCompanies(companies: Company[]): Promise<EnrichedLeadData[]> {
    const enrichedCompanies: EnrichedLeadData[] = [];
    
    // Process in batches to avoid overwhelming APIs
    const batchSize = 5;
    for (let i = 0; i < companies.length; i += batchSize) {
      const batch = companies.slice(i, i + batchSize);
      const promises = batch.map(company => this.enrichCompany(company));
      
      try {
        const results = await Promise.allSettled(promises);
        results.forEach((result, index) => {
          if (result.status === 'fulfilled') {
            enrichedCompanies.push(result.value);
          } else {
            console.error(`Failed to enrich company ${batch[index].name}:`, result.reason);
            // Add company without enrichment
            enrichedCompanies.push({
              company: batch[index],
              platformData: {},
              enrichmentScore: 0,
              lastEnriched: new Date()
            });
          }
        });
      } catch (error) {
        console.error('Batch enrichment failed:', error);
      }

      // Add delay between batches to respect rate limits
      if (i + batchSize < companies.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    return enrichedCompanies;
  }

  // Get company traffic data from analytics
  private async getCompanyTrafficData(domain: string) {
    // Mock implementation - in real scenario, would query GA API filtered by domain
    return {
      sessions: Math.floor(Math.random() * 1000) + 100,
      pageviews: Math.floor(Math.random() * 5000) + 500,
      avgSessionDuration: Math.floor(Math.random() * 300) + 60,
      bounceRate: Math.random() * 40 + 30,
      topPages: [
        '/pricing',
        '/features',
        '/demo'
      ],
      trafficSources: {
        organic: Math.floor(Math.random() * 500) + 50,
        direct: Math.floor(Math.random() * 300) + 30,
        referral: Math.floor(Math.random() * 200) + 20
      }
    };
  }

  // Get company ad interaction data
  private async getCompanyAdInteractions(domain: string, platform: PlatformType) {
    // Mock implementation - would query ad platform APIs for domain-specific data
    const baseClicks = Math.floor(Math.random() * 100) + 10;
    return {
      totalClicks: baseClicks,
      totalImpressions: baseClicks * (Math.floor(Math.random() * 20) + 10),
      totalConversions: Math.floor(baseClicks * (Math.random() * 0.1 + 0.01)),
      spend: baseClicks * (Math.random() * 3 + 1),
      campaigns: [
        {
          name: `${platform} Campaign for ${domain}`,
          clicks: baseClicks,
          status: 'active'
        }
      ]
    };
  }

  // Get company CRM data
  private async getCompanyCrmData(domain: string, platform: PlatformType) {
    // Mock implementation - would query CRM APIs for company/domain data
    return {
      contactCount: Math.floor(Math.random() * 10) + 1,
      dealCount: Math.floor(Math.random() * 5),
      totalDealValue: Math.floor(Math.random() * 50000) + 5000,
      lastActivity: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
      leadStatus: ['new', 'qualified', 'opportunity'][Math.floor(Math.random() * 3)],
      contacts: [
        {
          email: `contact@${domain}`,
          name: 'Primary Contact',
          role: 'Decision Maker'
        }
      ]
    };
  }

  // Calculate scoring based on traffic data
  private calculateTrafficScore(trafficData: any): number {
    let score = 0;
    
    // Sessions scoring (0-30 points)
    if (trafficData.sessions > 1000) score += 30;
    else if (trafficData.sessions > 500) score += 20;
    else if (trafficData.sessions > 100) score += 10;
    
    // Engagement scoring (0-25 points)
    if (trafficData.avgSessionDuration > 180) score += 25;
    else if (trafficData.avgSessionDuration > 120) score += 15;
    else if (trafficData.avgSessionDuration > 60) score += 10;
    
    // Bounce rate scoring (0-20 points)
    if (trafficData.bounceRate < 30) score += 20;
    else if (trafficData.bounceRate < 50) score += 10;
    
    return score;
  }

  // Calculate scoring based on ad interaction data
  private calculateAdScore(adData: any): number {
    let score = 0;
    
    // Click volume scoring (0-25 points)
    if (adData.totalClicks > 100) score += 25;
    else if (adData.totalClicks > 50) score += 15;
    else if (adData.totalClicks > 10) score += 10;
    
    // Conversion scoring (0-35 points)
    if (adData.totalConversions > 10) score += 35;
    else if (adData.totalConversions > 5) score += 25;
    else if (adData.totalConversions > 1) score += 15;
    
    return score;
  }

  // Calculate scoring based on CRM data
  private calculateCrmScore(crmData: any): number {
    let score = 0;
    
    // Contact count scoring (0-20 points)
    if (crmData.contactCount > 5) score += 20;
    else if (crmData.contactCount > 2) score += 15;
    else if (crmData.contactCount > 0) score += 10;
    
    // Deal value scoring (0-30 points)
    if (crmData.totalDealValue > 25000) score += 30;
    else if (crmData.totalDealValue > 10000) score += 20;
    else if (crmData.totalDealValue > 0) score += 10;
    
    // Recent activity scoring (0-25 points)
    const daysSinceActivity = (Date.now() - new Date(crmData.lastActivity).getTime()) / (1000 * 60 * 60 * 24);
    if (daysSinceActivity < 7) score += 25;
    else if (daysSinceActivity < 30) score += 15;
    else if (daysSinceActivity < 90) score += 10;
    
    return score;
  }

  // Find potential companies from platform data
  async findNewLeads(): Promise<Company[]> {
    const newLeads: Company[] = [];
    
    // Search Google Analytics for new high-engagement domains
    if (this.connectedPlatforms.has('google_analytics')) {
      const gaLeads = await this.findLeadsFromAnalytics();
      newLeads.push(...gaLeads);
    }
    
    // Search ad platforms for high-converting domains
    for (const platform of ['google_ads', 'meta_ads', 'tiktok_ads'] as PlatformType[]) {
      if (this.connectedPlatforms.has(platform)) {
        const adLeads = await this.findLeadsFromAds(platform);
        newLeads.push(...adLeads);
      }
    }
    
    // Deduplicate by domain
    const uniqueLeads = newLeads.reduce((acc, lead) => {
      if (!acc.find(existing => existing.domain === lead.domain)) {
        acc.push(lead);
      }
      return acc;
    }, [] as Company[]);
    
    return uniqueLeads;
  }

  private async findLeadsFromAnalytics(): Promise<Company[]> {
    // Mock implementation - would query GA for high-value sessions
    return [
      {
        id: `ga_lead_${Date.now()}`,
        name: 'Analytics Discovered Company',
        domain: 'newlead.com',
        industry: 'Technology',
        size: 'Unknown',
        location: { city: 'Stockholm', country: 'Sweden' },
        lastVisit: new Date(),
        totalVisits: Math.floor(Math.random() * 10) + 5,
        score: Math.floor(Math.random() * 40) + 60,
        status: 'warm' as const,
        tags: ['Analytics Discovery', 'High Engagement']
      }
    ];
  }

  private async findLeadsFromAds(platform: PlatformType): Promise<Company[]> {
    // Mock implementation - would query ad platforms for conversion data
    return [
      {
        id: `${platform}_lead_${Date.now()}`,
        name: `${platform} Discovered Company`,
        domain: `${platform}-lead.com`,
        industry: 'Technology',
        size: 'Unknown',
        location: { city: 'Gothenburg', country: 'Sweden' },
        lastVisit: new Date(),
        totalVisits: Math.floor(Math.random() * 5) + 1,
        score: Math.floor(Math.random() * 30) + 50,
        status: 'warm' as const,
        tags: [`${platform} Lead`, 'Ad Conversion']
      }
    ];
  }

  // Update connected platforms when integrations change
  updateConnectedPlatforms(platforms: PlatformType[]) {
    this.connectedPlatforms = new Set(platforms);
  }

  // Get enrichment summary
  getEnrichmentSummary(enrichedData: EnrichedLeadData[]): {
    totalCompanies: number;
    enrichedCompanies: number;
    platformCoverage: Record<PlatformType, number>;
    averageScore: number;
  } {
    const summary = {
      totalCompanies: enrichedData.length,
      enrichedCompanies: enrichedData.filter(e => e.enrichmentScore > 0).length,
      platformCoverage: {} as Record<PlatformType, number>,
      averageScore: 0
    };

    // Calculate platform coverage
    const platformTypes: PlatformType[] = [
      'google_analytics', 'google_ads', 'meta_ads', 'tiktok_ads', 
      'google_tag_manager', 'hubspot', 'pipedrive', 'salesforce'
    ];

    platformTypes.forEach(platform => {
      const companiesWithPlatform = enrichedData.filter(
        e => e.platformData[platform]
      ).length;
      summary.platformCoverage[platform] = companiesWithPlatform;
    });

    // Calculate average enrichment score
    if (enrichedData.length > 0) {
      summary.averageScore = enrichedData.reduce(
        (sum, e) => sum + e.enrichmentScore, 0
      ) / enrichedData.length;
    }

    return summary;
  }
}

// Export singleton instance
export const dataEnrichmentService = new DataEnrichmentService();

