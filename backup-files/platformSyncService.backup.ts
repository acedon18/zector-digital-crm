// Platform Data Sync Service - Background synchronization of platform data
import { PlatformType, SyncJob, PlatformCredentials } 
            param($match)
            $typePath = $matches[1]
            $fullTypePath = Join-Path $typesDir "$typePath.ts"
            $relativePath = Get-RelativePath -from $filePath -to $fullTypePath
            # Remove .ts extension from import path
            $relativePath = $relativePath -replace '\.ts;
import { Company } from '@/types/leads';
import { PlatformServiceFactory } from './platformApiService';
import { dataEnrichmentService } from './dataEnrichmentService';

export interface SyncSchedule {
  platformType: PlatformType;
  interval: number; // minutes
  lastSync?: Date;
  nextSync?: Date;
  isActive: boolean;
}

export interface SyncResult {
  success: boolean;
  jobId: string;
  platformType: PlatformType;
  startTime: Date;
  endTime?: Date;
  recordsProcessed: number;
  recordsAdded: number;
  recordsUpdated: number;
  errors: string[];
  status: 'pending' | 'running' | 'completed' | 'failed';
}

export class PlatformSyncService {
  private syncJobs: Map<string, SyncResult> = new Map();
  private syncSchedules: Map<PlatformType, SyncSchedule> = new Map();
  private syncIntervals: Map<PlatformType, NodeJS.Timeout> = new Map();
  private isInitialized = false;

  constructor() {
    this.initializeSync();
  }

  private initializeSync() {
    if (this.isInitialized) return;
    
    // Load sync schedules from localStorage
    this.loadSyncSchedules();
    
    // Setup default sync schedules
    this.setupDefaultSchedules();
    
    // Start scheduled syncs
    this.startScheduledSyncs();
    
    this.isInitialized = true;
  }

  private loadSyncSchedules() {
    try {
      const stored = localStorage.getItem('sync_schedules');
      if (stored) {
        const schedules = JSON.parse(stored);
        Object.entries(schedules).forEach(([platform, schedule]) => {
          this.syncSchedules.set(platform as PlatformType, {
            ...(schedule as SyncSchedule),
            lastSync: schedule.lastSync ? new Date(schedule.lastSync) : undefined,
            nextSync: schedule.nextSync ? new Date(schedule.nextSync) : undefined,
          });
        });
      }
    } catch (error) {
      console.error('Failed to load sync schedules:', error);
    }
  }

  private saveSyncSchedules() {
    try {
      const schedules: Record<string, SyncSchedule> = {};
      this.syncSchedules.forEach((schedule, platform) => {
        schedules[platform] = schedule;
      });
      localStorage.setItem('sync_schedules', JSON.stringify(schedules));
    } catch (error) {
      console.error('Failed to save sync schedules:', error);
    }
  }

  private setupDefaultSchedules() {
    const defaultSchedules: Array<{ platform: PlatformType; interval: number }> = [
      { platform: 'google_analytics', interval: 60 }, // Every hour
      { platform: 'google_ads', interval: 30 }, // Every 30 minutes
      { platform: 'meta_ads', interval: 45 }, // Every 45 minutes
      { platform: 'tiktok_ads', interval: 60 }, // Every hour
      { platform: 'hubspot', interval: 15 }, // Every 15 minutes
      { platform: 'pipedrive', interval: 15 }, // Every 15 minutes
      { platform: 'salesforce', interval: 30 }, // Every 30 minutes
    ];

    defaultSchedules.forEach(({ platform, interval }) => {
      if (!this.syncSchedules.has(platform)) {
        this.syncSchedules.set(platform, {
          platformType: platform,
          interval,
          isActive: false, // Start inactive until platform is connected
        });
      }
    });
  }

  private startScheduledSyncs() {
    this.syncSchedules.forEach((schedule, platform) => {
      if (schedule.isActive) {
        this.scheduleNextSync(platform);
      }
    });
  }

  private scheduleNextSync(platform: PlatformType) {
    const schedule = this.syncSchedules.get(platform);
    if (!schedule || !schedule.isActive) return;

    // Clear existing interval
    const existingInterval = this.syncIntervals.get(platform);
    if (existingInterval) {
      clearTimeout(existingInterval);
    }

    // Calculate next sync time
    const now = new Date();
    const nextSync = new Date(now.getTime() + schedule.interval * 60 * 1000);
    schedule.nextSync = nextSync;

    // Schedule the sync
    const timeout = setTimeout(() => {
      this.syncPlatform(platform);
    }, schedule.interval * 60 * 1000);

    this.syncIntervals.set(platform, timeout);
    this.saveSyncSchedules();
  }

  // Manual sync trigger
  async syncPlatform(platformType: PlatformType): Promise<SyncResult> {
    const jobId = `sync_${platformType}_${Date.now()}`;
    const startTime = new Date();

    const syncResult: SyncResult = {
      success: false,
      jobId,
      platformType,
      startTime,
      recordsProcessed: 0,
      recordsAdded: 0,
      recordsUpdated: 0,
      errors: [],
      status: 'pending'
    };

    this.syncJobs.set(jobId, syncResult);

    try {
      // Update status to running
      syncResult.status = 'running';
      this.syncJobs.set(jobId, { ...syncResult });

      // Check if platform is connected
      const isConnected = this.isPlatformConnected(platformType);
      if (!isConnected) {
        throw new Error(`Platform ${platformType} is not connected`);
      }

      // Get platform service
      const service = PlatformServiceFactory.createService(platformType);

      // Perform platform-specific sync
      const syncData = await this.performPlatformSync(platformType, service);

      // Update existing companies with new data
      const existingCompanies = await this.getExistingCompanies();
      const { updated, added } = await this.updateCompaniesWithSyncData(
        existingCompanies,
        syncData,
        platformType
      );

      // Update sync result
      syncResult.recordsProcessed = syncData.length;
      syncResult.recordsUpdated = updated.length;
      syncResult.recordsAdded = added.length;
      syncResult.status = 'completed';
      syncResult.success = true;
      syncResult.endTime = new Date();

      // Update last sync time
      const schedule = this.syncSchedules.get(platformType);
      if (schedule) {
        schedule.lastSync = new Date();
        this.syncSchedules.set(platformType, schedule);
        this.saveSyncSchedules();
      }

      // Schedule next sync
      this.scheduleNextSync(platformType);

      console.log(`Sync completed for ${platformType}:`, {
        processed: syncResult.recordsProcessed,
        updated: syncResult.recordsUpdated,
        added: syncResult.recordsAdded
      });

    } catch (error) {
      syncResult.status = 'failed';
      syncResult.success = false;
      syncResult.endTime = new Date();
      syncResult.errors.push(error instanceof Error ? error.message : 'Unknown error');
      
      console.error(`Sync failed for ${platformType}:`, error);
    }

    this.syncJobs.set(jobId, syncResult);
    return syncResult;
  }

  private async performPlatformSync(platformType: PlatformType, service: any): Promise<any[]> {
    const dateRange = {
      from: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
      to: new Date()
    };

    switch (platformType) {
      case 'google_analytics':
        const gaData = await service.getWebsiteTraffic('GA_PROPERTY_ID', dateRange);
        return this.extractCompaniesFromAnalytics(gaData);

      case 'google_ads':
        const adData = await service.getCampaignData('CUSTOMER_ID', dateRange);
        return this.extractCompaniesFromAds(adData, 'google_ads');

      case 'meta_ads':
        const metaData = await service.getCampaignInsights('AD_ACCOUNT_ID', dateRange);
        return this.extractCompaniesFromAds(metaData, 'meta_ads');

      case 'tiktok_ads':
        const tiktokData = await service.getCampaignStats('ADVERTISER_ID', dateRange);
        return this.extractCompaniesFromAds(tiktokData, 'tiktok_ads');

      case 'hubspot':
        const hubspotData = await service.getContacts(1000);
        return this.extractCompaniesFromCrm(hubspotData, 'hubspot');

      default:
        return [];
    }
  }

  private extractCompaniesFromAnalytics(analyticsData: any): Partial<Company>[] {
    // Mock implementation - extract company data from analytics
    return [
      {
        domain: 'newanalytics.com',
        name: 'Analytics Company',
        industry: 'Technology',
        totalVisits: analyticsData.sessions || 0,
        lastVisit: new Date(),
        tags: ['Analytics Source'],
      }
    ];
  }

  private extractCompaniesFromAds(adData: any, source: string): Partial<Company>[] {
    // Mock implementation - extract company data from ad platforms
    if (!adData.campaigns) return [];

    return adData.campaigns.map((campaign: any, index: number) => ({
      domain: `${source}-lead-${index}.com`,
      name: `${source} Lead ${index + 1}`,
      industry: 'Technology',
      totalVisits: campaign.clicks || 0,
      lastVisit: new Date(),
      tags: [`${source} Source`, 'Ad Campaign'],
      score: Math.min(100, (campaign.conversions || 0) * 10 + 50)
    }));
  }

  private extractCompaniesFromCrm(crmData: any, source: string): Partial<Company>[] {
    // Mock implementation - extract company data from CRM
    if (!crmData.contacts) return [];

    return crmData.contacts.map((contact: any) => ({
      domain: contact.email ? contact.email.split('@')[1] : `${source}-lead.com`,
      name: contact.company || `${source} Lead`,
      industry: 'Unknown',
      totalVisits: 1,
      lastVisit: new Date(contact.lastActivity || Date.now()),
      tags: [`${source} Source`, 'CRM Contact'],
      score: 60
    }));
  }

  private async getExistingCompanies(): Promise<Company[]> {
    // In a real implementation, this would fetch from your database
    // For now, return empty array as we're working with mock data
    return [];
  }

  private async updateCompaniesWithSyncData(
    existingCompanies: Company[],
    syncData: Partial<Company>[],
    platformType: PlatformType
  ): Promise<{ updated: Company[]; added: Company[] }> {
    const updated: Company[] = [];
    const added: Company[] = [];

    for (const syncItem of syncData) {
      if (!syncItem.domain) continue;

      const existing = existingCompanies.find(c => c.domain === syncItem.domain);
      
      if (existing) {
        // Update existing company
        const updatedCompany: Company = {
          ...existing,
          ...syncItem,
          totalVisits: existing.totalVisits + (syncItem.totalVisits || 0),
          lastVisit: syncItem.lastVisit || existing.lastVisit,
          tags: [...new Set([...existing.tags, ...(syncItem.tags || [])])]
        };
        updated.push(updatedCompany);
      } else {
        // Add new company
        const newCompany: Company = {
          id: `${platformType}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          name: syncItem.name || 'Unknown Company',
          domain: syncItem.domain,
          industry: syncItem.industry || 'Unknown',
          size: syncItem.size || 'Unknown',
          location: syncItem.location || { city: 'Unknown', country: 'Unknown' },
          lastVisit: syncItem.lastVisit || new Date(),
          totalVisits: syncItem.totalVisits || 1,
          score: syncItem.score || 50,
          status: this.determineLeadStatus(syncItem.score || 50),
          tags: syncItem.tags || [`${platformType} Source`]
        };
        added.push(newCompany);
      }
    }

    return { updated, added };
  }

  private determineLeadStatus(score: number): 'hot' | 'warm' | 'cold' {
    if (score >= 80) return 'hot';
    if (score >= 60) return 'warm';
    return 'cold';
  }

  private isPlatformConnected(platformType: PlatformType): boolean {
    try {
      const stored = localStorage.getItem('customer_settings');
      if (stored) {
        const settings = JSON.parse(stored);
        return settings.integrations?.[platformType]?.isConnected || false;
      }
    } catch (error) {
      console.error('Failed to check platform connection:', error);
    }
    return false;
  }

  // Public methods for managing sync

  // Enable/disable sync for a platform
  setSyncEnabled(platformType: PlatformType, enabled: boolean) {
    const schedule = this.syncSchedules.get(platformType);
    if (schedule) {
      schedule.isActive = enabled;
      this.syncSchedules.set(platformType, schedule);
      this.saveSyncSchedules();

      if (enabled) {
        this.scheduleNextSync(platformType);
      } else {
        const interval = this.syncIntervals.get(platformType);
        if (interval) {
          clearTimeout(interval);
          this.syncIntervals.delete(platformType);
        }
      }
    }
  }

  // Update sync interval for a platform
  setSyncInterval(platformType: PlatformType, intervalMinutes: number) {
    const schedule = this.syncSchedules.get(platformType);
    if (schedule) {
      schedule.interval = intervalMinutes;
      this.syncSchedules.set(platformType, schedule);
      this.saveSyncSchedules();

      // Reschedule if active
      if (schedule.isActive) {
        this.scheduleNextSync(platformType);
      }
    }
  }

  // Get sync status for a platform
  getSyncStatus(platformType: PlatformType): SyncSchedule | null {
    return this.syncSchedules.get(platformType) || null;
  }

  // Get sync job result
  getSyncJob(jobId: string): SyncResult | null {
    return this.syncJobs.get(jobId) || null;
  }

  // Get all recent sync jobs
  getRecentSyncJobs(limit = 20): SyncResult[] {
    const jobs = Array.from(this.syncJobs.values());
    return jobs
      .sort((a, b) => b.startTime.getTime() - a.startTime.getTime())
      .slice(0, limit);
  }

  // Get sync summary
  getSyncSummary(): {
    totalPlatforms: number;
    activeSyncs: number;
    lastSyncTime?: Date;
    nextSyncTime?: Date;
    recentJobs: SyncResult[];
  } {
    const schedules = Array.from(this.syncSchedules.values());
    const activeSyncs = schedules.filter(s => s.isActive).length;
    
    const lastSyncTimes = schedules
      .filter(s => s.lastSync)
      .map(s => s.lastSync!)
      .sort((a, b) => b.getTime() - a.getTime());
    
    const nextSyncTimes = schedules
      .filter(s => s.nextSync && s.isActive)
      .map(s => s.nextSync!)
      .sort((a, b) => a.getTime() - b.getTime());

    return {
      totalPlatforms: schedules.length,
      activeSyncs,
      lastSyncTime: lastSyncTimes[0],
      nextSyncTime: nextSyncTimes[0],
      recentJobs: this.getRecentSyncJobs(5)
    };
  }

  // Cleanup old sync jobs
  cleanupOldJobs() {
    const cutoff = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000); // 7 days ago
    
    for (const [jobId, job] of this.syncJobs.entries()) {
      if (job.startTime < cutoff) {
        this.syncJobs.delete(jobId);
      }
    }
  }

  // Stop all syncs (useful for cleanup)
  stopAllSyncs() {
    this.syncIntervals.forEach(interval => clearTimeout(interval));
    this.syncIntervals.clear();
    
    this.syncSchedules.forEach(schedule => {
      schedule.isActive = false;
    });
    
    this.saveSyncSchedules();
  }
}

// Export singleton instance
export const platformSyncService = new PlatformSyncService();
, ''
            return "from '$relativePath'"
        ;
import { Company } 
            param($match)
            $typePath = $matches[1]
            $fullTypePath = Join-Path $typesDir "$typePath.ts"
            $relativePath = Get-RelativePath -from $filePath -to $fullTypePath
            # Remove .ts extension from import path
            $relativePath = $relativePath -replace '\.ts;
import { PlatformServiceFactory } from './platformApiService';
import { dataEnrichmentService } from './dataEnrichmentService';

export interface SyncSchedule {
  platformType: PlatformType;
  interval: number; // minutes
  lastSync?: Date;
  nextSync?: Date;
  isActive: boolean;
}

export interface SyncResult {
  success: boolean;
  jobId: string;
  platformType: PlatformType;
  startTime: Date;
  endTime?: Date;
  recordsProcessed: number;
  recordsAdded: number;
  recordsUpdated: number;
  errors: string[];
  status: 'pending' | 'running' | 'completed' | 'failed';
}

export class PlatformSyncService {
  private syncJobs: Map<string, SyncResult> = new Map();
  private syncSchedules: Map<PlatformType, SyncSchedule> = new Map();
  private syncIntervals: Map<PlatformType, NodeJS.Timeout> = new Map();
  private isInitialized = false;

  constructor() {
    this.initializeSync();
  }

  private initializeSync() {
    if (this.isInitialized) return;
    
    // Load sync schedules from localStorage
    this.loadSyncSchedules();
    
    // Setup default sync schedules
    this.setupDefaultSchedules();
    
    // Start scheduled syncs
    this.startScheduledSyncs();
    
    this.isInitialized = true;
  }

  private loadSyncSchedules() {
    try {
      const stored = localStorage.getItem('sync_schedules');
      if (stored) {
        const schedules = JSON.parse(stored);
        Object.entries(schedules).forEach(([platform, schedule]) => {
          this.syncSchedules.set(platform as PlatformType, {
            ...(schedule as SyncSchedule),
            lastSync: schedule.lastSync ? new Date(schedule.lastSync) : undefined,
            nextSync: schedule.nextSync ? new Date(schedule.nextSync) : undefined,
          });
        });
      }
    } catch (error) {
      console.error('Failed to load sync schedules:', error);
    }
  }

  private saveSyncSchedules() {
    try {
      const schedules: Record<string, SyncSchedule> = {};
      this.syncSchedules.forEach((schedule, platform) => {
        schedules[platform] = schedule;
      });
      localStorage.setItem('sync_schedules', JSON.stringify(schedules));
    } catch (error) {
      console.error('Failed to save sync schedules:', error);
    }
  }

  private setupDefaultSchedules() {
    const defaultSchedules: Array<{ platform: PlatformType; interval: number }> = [
      { platform: 'google_analytics', interval: 60 }, // Every hour
      { platform: 'google_ads', interval: 30 }, // Every 30 minutes
      { platform: 'meta_ads', interval: 45 }, // Every 45 minutes
      { platform: 'tiktok_ads', interval: 60 }, // Every hour
      { platform: 'hubspot', interval: 15 }, // Every 15 minutes
      { platform: 'pipedrive', interval: 15 }, // Every 15 minutes
      { platform: 'salesforce', interval: 30 }, // Every 30 minutes
    ];

    defaultSchedules.forEach(({ platform, interval }) => {
      if (!this.syncSchedules.has(platform)) {
        this.syncSchedules.set(platform, {
          platformType: platform,
          interval,
          isActive: false, // Start inactive until platform is connected
        });
      }
    });
  }

  private startScheduledSyncs() {
    this.syncSchedules.forEach((schedule, platform) => {
      if (schedule.isActive) {
        this.scheduleNextSync(platform);
      }
    });
  }

  private scheduleNextSync(platform: PlatformType) {
    const schedule = this.syncSchedules.get(platform);
    if (!schedule || !schedule.isActive) return;

    // Clear existing interval
    const existingInterval = this.syncIntervals.get(platform);
    if (existingInterval) {
      clearTimeout(existingInterval);
    }

    // Calculate next sync time
    const now = new Date();
    const nextSync = new Date(now.getTime() + schedule.interval * 60 * 1000);
    schedule.nextSync = nextSync;

    // Schedule the sync
    const timeout = setTimeout(() => {
      this.syncPlatform(platform);
    }, schedule.interval * 60 * 1000);

    this.syncIntervals.set(platform, timeout);
    this.saveSyncSchedules();
  }

  // Manual sync trigger
  async syncPlatform(platformType: PlatformType): Promise<SyncResult> {
    const jobId = `sync_${platformType}_${Date.now()}`;
    const startTime = new Date();

    const syncResult: SyncResult = {
      success: false,
      jobId,
      platformType,
      startTime,
      recordsProcessed: 0,
      recordsAdded: 0,
      recordsUpdated: 0,
      errors: [],
      status: 'pending'
    };

    this.syncJobs.set(jobId, syncResult);

    try {
      // Update status to running
      syncResult.status = 'running';
      this.syncJobs.set(jobId, { ...syncResult });

      // Check if platform is connected
      const isConnected = this.isPlatformConnected(platformType);
      if (!isConnected) {
        throw new Error(`Platform ${platformType} is not connected`);
      }

      // Get platform service
      const service = PlatformServiceFactory.createService(platformType);

      // Perform platform-specific sync
      const syncData = await this.performPlatformSync(platformType, service);

      // Update existing companies with new data
      const existingCompanies = await this.getExistingCompanies();
      const { updated, added } = await this.updateCompaniesWithSyncData(
        existingCompanies,
        syncData,
        platformType
      );

      // Update sync result
      syncResult.recordsProcessed = syncData.length;
      syncResult.recordsUpdated = updated.length;
      syncResult.recordsAdded = added.length;
      syncResult.status = 'completed';
      syncResult.success = true;
      syncResult.endTime = new Date();

      // Update last sync time
      const schedule = this.syncSchedules.get(platformType);
      if (schedule) {
        schedule.lastSync = new Date();
        this.syncSchedules.set(platformType, schedule);
        this.saveSyncSchedules();
      }

      // Schedule next sync
      this.scheduleNextSync(platformType);

      console.log(`Sync completed for ${platformType}:`, {
        processed: syncResult.recordsProcessed,
        updated: syncResult.recordsUpdated,
        added: syncResult.recordsAdded
      });

    } catch (error) {
      syncResult.status = 'failed';
      syncResult.success = false;
      syncResult.endTime = new Date();
      syncResult.errors.push(error instanceof Error ? error.message : 'Unknown error');
      
      console.error(`Sync failed for ${platformType}:`, error);
    }

    this.syncJobs.set(jobId, syncResult);
    return syncResult;
  }

  private async performPlatformSync(platformType: PlatformType, service: any): Promise<any[]> {
    const dateRange = {
      from: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
      to: new Date()
    };

    switch (platformType) {
      case 'google_analytics':
        const gaData = await service.getWebsiteTraffic('GA_PROPERTY_ID', dateRange);
        return this.extractCompaniesFromAnalytics(gaData);

      case 'google_ads':
        const adData = await service.getCampaignData('CUSTOMER_ID', dateRange);
        return this.extractCompaniesFromAds(adData, 'google_ads');

      case 'meta_ads':
        const metaData = await service.getCampaignInsights('AD_ACCOUNT_ID', dateRange);
        return this.extractCompaniesFromAds(metaData, 'meta_ads');

      case 'tiktok_ads':
        const tiktokData = await service.getCampaignStats('ADVERTISER_ID', dateRange);
        return this.extractCompaniesFromAds(tiktokData, 'tiktok_ads');

      case 'hubspot':
        const hubspotData = await service.getContacts(1000);
        return this.extractCompaniesFromCrm(hubspotData, 'hubspot');

      default:
        return [];
    }
  }

  private extractCompaniesFromAnalytics(analyticsData: any): Partial<Company>[] {
    // Mock implementation - extract company data from analytics
    return [
      {
        domain: 'newanalytics.com',
        name: 'Analytics Company',
        industry: 'Technology',
        totalVisits: analyticsData.sessions || 0,
        lastVisit: new Date(),
        tags: ['Analytics Source'],
      }
    ];
  }

  private extractCompaniesFromAds(adData: any, source: string): Partial<Company>[] {
    // Mock implementation - extract company data from ad platforms
    if (!adData.campaigns) return [];

    return adData.campaigns.map((campaign: any, index: number) => ({
      domain: `${source}-lead-${index}.com`,
      name: `${source} Lead ${index + 1}`,
      industry: 'Technology',
      totalVisits: campaign.clicks || 0,
      lastVisit: new Date(),
      tags: [`${source} Source`, 'Ad Campaign'],
      score: Math.min(100, (campaign.conversions || 0) * 10 + 50)
    }));
  }

  private extractCompaniesFromCrm(crmData: any, source: string): Partial<Company>[] {
    // Mock implementation - extract company data from CRM
    if (!crmData.contacts) return [];

    return crmData.contacts.map((contact: any) => ({
      domain: contact.email ? contact.email.split('@')[1] : `${source}-lead.com`,
      name: contact.company || `${source} Lead`,
      industry: 'Unknown',
      totalVisits: 1,
      lastVisit: new Date(contact.lastActivity || Date.now()),
      tags: [`${source} Source`, 'CRM Contact'],
      score: 60
    }));
  }

  private async getExistingCompanies(): Promise<Company[]> {
    // In a real implementation, this would fetch from your database
    // For now, return empty array as we're working with mock data
    return [];
  }

  private async updateCompaniesWithSyncData(
    existingCompanies: Company[],
    syncData: Partial<Company>[],
    platformType: PlatformType
  ): Promise<{ updated: Company[]; added: Company[] }> {
    const updated: Company[] = [];
    const added: Company[] = [];

    for (const syncItem of syncData) {
      if (!syncItem.domain) continue;

      const existing = existingCompanies.find(c => c.domain === syncItem.domain);
      
      if (existing) {
        // Update existing company
        const updatedCompany: Company = {
          ...existing,
          ...syncItem,
          totalVisits: existing.totalVisits + (syncItem.totalVisits || 0),
          lastVisit: syncItem.lastVisit || existing.lastVisit,
          tags: [...new Set([...existing.tags, ...(syncItem.tags || [])])]
        };
        updated.push(updatedCompany);
      } else {
        // Add new company
        const newCompany: Company = {
          id: `${platformType}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          name: syncItem.name || 'Unknown Company',
          domain: syncItem.domain,
          industry: syncItem.industry || 'Unknown',
          size: syncItem.size || 'Unknown',
          location: syncItem.location || { city: 'Unknown', country: 'Unknown' },
          lastVisit: syncItem.lastVisit || new Date(),
          totalVisits: syncItem.totalVisits || 1,
          score: syncItem.score || 50,
          status: this.determineLeadStatus(syncItem.score || 50),
          tags: syncItem.tags || [`${platformType} Source`]
        };
        added.push(newCompany);
      }
    }

    return { updated, added };
  }

  private determineLeadStatus(score: number): 'hot' | 'warm' | 'cold' {
    if (score >= 80) return 'hot';
    if (score >= 60) return 'warm';
    return 'cold';
  }

  private isPlatformConnected(platformType: PlatformType): boolean {
    try {
      const stored = localStorage.getItem('customer_settings');
      if (stored) {
        const settings = JSON.parse(stored);
        return settings.integrations?.[platformType]?.isConnected || false;
      }
    } catch (error) {
      console.error('Failed to check platform connection:', error);
    }
    return false;
  }

  // Public methods for managing sync

  // Enable/disable sync for a platform
  setSyncEnabled(platformType: PlatformType, enabled: boolean) {
    const schedule = this.syncSchedules.get(platformType);
    if (schedule) {
      schedule.isActive = enabled;
      this.syncSchedules.set(platformType, schedule);
      this.saveSyncSchedules();

      if (enabled) {
        this.scheduleNextSync(platformType);
      } else {
        const interval = this.syncIntervals.get(platformType);
        if (interval) {
          clearTimeout(interval);
          this.syncIntervals.delete(platformType);
        }
      }
    }
  }

  // Update sync interval for a platform
  setSyncInterval(platformType: PlatformType, intervalMinutes: number) {
    const schedule = this.syncSchedules.get(platformType);
    if (schedule) {
      schedule.interval = intervalMinutes;
      this.syncSchedules.set(platformType, schedule);
      this.saveSyncSchedules();

      // Reschedule if active
      if (schedule.isActive) {
        this.scheduleNextSync(platformType);
      }
    }
  }

  // Get sync status for a platform
  getSyncStatus(platformType: PlatformType): SyncSchedule | null {
    return this.syncSchedules.get(platformType) || null;
  }

  // Get sync job result
  getSyncJob(jobId: string): SyncResult | null {
    return this.syncJobs.get(jobId) || null;
  }

  // Get all recent sync jobs
  getRecentSyncJobs(limit = 20): SyncResult[] {
    const jobs = Array.from(this.syncJobs.values());
    return jobs
      .sort((a, b) => b.startTime.getTime() - a.startTime.getTime())
      .slice(0, limit);
  }

  // Get sync summary
  getSyncSummary(): {
    totalPlatforms: number;
    activeSyncs: number;
    lastSyncTime?: Date;
    nextSyncTime?: Date;
    recentJobs: SyncResult[];
  } {
    const schedules = Array.from(this.syncSchedules.values());
    const activeSyncs = schedules.filter(s => s.isActive).length;
    
    const lastSyncTimes = schedules
      .filter(s => s.lastSync)
      .map(s => s.lastSync!)
      .sort((a, b) => b.getTime() - a.getTime());
    
    const nextSyncTimes = schedules
      .filter(s => s.nextSync && s.isActive)
      .map(s => s.nextSync!)
      .sort((a, b) => a.getTime() - b.getTime());

    return {
      totalPlatforms: schedules.length,
      activeSyncs,
      lastSyncTime: lastSyncTimes[0],
      nextSyncTime: nextSyncTimes[0],
      recentJobs: this.getRecentSyncJobs(5)
    };
  }

  // Cleanup old sync jobs
  cleanupOldJobs() {
    const cutoff = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000); // 7 days ago
    
    for (const [jobId, job] of this.syncJobs.entries()) {
      if (job.startTime < cutoff) {
        this.syncJobs.delete(jobId);
      }
    }
  }

  // Stop all syncs (useful for cleanup)
  stopAllSyncs() {
    this.syncIntervals.forEach(interval => clearTimeout(interval));
    this.syncIntervals.clear();
    
    this.syncSchedules.forEach(schedule => {
      schedule.isActive = false;
    });
    
    this.saveSyncSchedules();
  }
}

// Export singleton instance
export const platformSyncService = new PlatformSyncService();
, ''
            return "from '$relativePath'"
        ;
import { PlatformServiceFactory } from './platformApiService';
import { dataEnrichmentService } from './dataEnrichmentService';

export interface SyncSchedule {
  platformType: PlatformType;
  interval: number; // minutes
  lastSync?: Date;
  nextSync?: Date;
  isActive: boolean;
}

export interface SyncResult {
  success: boolean;
  jobId: string;
  platformType: PlatformType;
  startTime: Date;
  endTime?: Date;
  recordsProcessed: number;
  recordsAdded: number;
  recordsUpdated: number;
  errors: string[];
  status: 'pending' | 'running' | 'completed' | 'failed';
}

export class PlatformSyncService {
  private syncJobs: Map<string, SyncResult> = new Map();
  private syncSchedules: Map<PlatformType, SyncSchedule> = new Map();
  private syncIntervals: Map<PlatformType, NodeJS.Timeout> = new Map();
  private isInitialized = false;

  constructor() {
    this.initializeSync();
  }

  private initializeSync() {
    if (this.isInitialized) return;
    
    // Load sync schedules from localStorage
    this.loadSyncSchedules();
    
    // Setup default sync schedules
    this.setupDefaultSchedules();
    
    // Start scheduled syncs
    this.startScheduledSyncs();
    
    this.isInitialized = true;
  }

  private loadSyncSchedules() {
    try {
      const stored = localStorage.getItem('sync_schedules');
      if (stored) {
        const schedules = JSON.parse(stored);
        Object.entries(schedules).forEach(([platform, schedule]) => {
          this.syncSchedules.set(platform as PlatformType, {
            ...(schedule as SyncSchedule),
            lastSync: schedule.lastSync ? new Date(schedule.lastSync) : undefined,
            nextSync: schedule.nextSync ? new Date(schedule.nextSync) : undefined,
          });
        });
      }
    } catch (error) {
      console.error('Failed to load sync schedules:', error);
    }
  }

  private saveSyncSchedules() {
    try {
      const schedules: Record<string, SyncSchedule> = {};
      this.syncSchedules.forEach((schedule, platform) => {
        schedules[platform] = schedule;
      });
      localStorage.setItem('sync_schedules', JSON.stringify(schedules));
    } catch (error) {
      console.error('Failed to save sync schedules:', error);
    }
  }

  private setupDefaultSchedules() {
    const defaultSchedules: Array<{ platform: PlatformType; interval: number }> = [
      { platform: 'google_analytics', interval: 60 }, // Every hour
      { platform: 'google_ads', interval: 30 }, // Every 30 minutes
      { platform: 'meta_ads', interval: 45 }, // Every 45 minutes
      { platform: 'tiktok_ads', interval: 60 }, // Every hour
      { platform: 'hubspot', interval: 15 }, // Every 15 minutes
      { platform: 'pipedrive', interval: 15 }, // Every 15 minutes
      { platform: 'salesforce', interval: 30 }, // Every 30 minutes
    ];

    defaultSchedules.forEach(({ platform, interval }) => {
      if (!this.syncSchedules.has(platform)) {
        this.syncSchedules.set(platform, {
          platformType: platform,
          interval,
          isActive: false, // Start inactive until platform is connected
        });
      }
    });
  }

  private startScheduledSyncs() {
    this.syncSchedules.forEach((schedule, platform) => {
      if (schedule.isActive) {
        this.scheduleNextSync(platform);
      }
    });
  }

  private scheduleNextSync(platform: PlatformType) {
    const schedule = this.syncSchedules.get(platform);
    if (!schedule || !schedule.isActive) return;

    // Clear existing interval
    const existingInterval = this.syncIntervals.get(platform);
    if (existingInterval) {
      clearTimeout(existingInterval);
    }

    // Calculate next sync time
    const now = new Date();
    const nextSync = new Date(now.getTime() + schedule.interval * 60 * 1000);
    schedule.nextSync = nextSync;

    // Schedule the sync
    const timeout = setTimeout(() => {
      this.syncPlatform(platform);
    }, schedule.interval * 60 * 1000);

    this.syncIntervals.set(platform, timeout);
    this.saveSyncSchedules();
  }

  // Manual sync trigger
  async syncPlatform(platformType: PlatformType): Promise<SyncResult> {
    const jobId = `sync_${platformType}_${Date.now()}`;
    const startTime = new Date();

    const syncResult: SyncResult = {
      success: false,
      jobId,
      platformType,
      startTime,
      recordsProcessed: 0,
      recordsAdded: 0,
      recordsUpdated: 0,
      errors: [],
      status: 'pending'
    };

    this.syncJobs.set(jobId, syncResult);

    try {
      // Update status to running
      syncResult.status = 'running';
      this.syncJobs.set(jobId, { ...syncResult });

      // Check if platform is connected
      const isConnected = this.isPlatformConnected(platformType);
      if (!isConnected) {
        throw new Error(`Platform ${platformType} is not connected`);
      }

      // Get platform service
      const service = PlatformServiceFactory.createService(platformType);

      // Perform platform-specific sync
      const syncData = await this.performPlatformSync(platformType, service);

      // Update existing companies with new data
      const existingCompanies = await this.getExistingCompanies();
      const { updated, added } = await this.updateCompaniesWithSyncData(
        existingCompanies,
        syncData,
        platformType
      );

      // Update sync result
      syncResult.recordsProcessed = syncData.length;
      syncResult.recordsUpdated = updated.length;
      syncResult.recordsAdded = added.length;
      syncResult.status = 'completed';
      syncResult.success = true;
      syncResult.endTime = new Date();

      // Update last sync time
      const schedule = this.syncSchedules.get(platformType);
      if (schedule) {
        schedule.lastSync = new Date();
        this.syncSchedules.set(platformType, schedule);
        this.saveSyncSchedules();
      }

      // Schedule next sync
      this.scheduleNextSync(platformType);

      console.log(`Sync completed for ${platformType}:`, {
        processed: syncResult.recordsProcessed,
        updated: syncResult.recordsUpdated,
        added: syncResult.recordsAdded
      });

    } catch (error) {
      syncResult.status = 'failed';
      syncResult.success = false;
      syncResult.endTime = new Date();
      syncResult.errors.push(error instanceof Error ? error.message : 'Unknown error');
      
      console.error(`Sync failed for ${platformType}:`, error);
    }

    this.syncJobs.set(jobId, syncResult);
    return syncResult;
  }

  private async performPlatformSync(platformType: PlatformType, service: any): Promise<any[]> {
    const dateRange = {
      from: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
      to: new Date()
    };

    switch (platformType) {
      case 'google_analytics':
        const gaData = await service.getWebsiteTraffic('GA_PROPERTY_ID', dateRange);
        return this.extractCompaniesFromAnalytics(gaData);

      case 'google_ads':
        const adData = await service.getCampaignData('CUSTOMER_ID', dateRange);
        return this.extractCompaniesFromAds(adData, 'google_ads');

      case 'meta_ads':
        const metaData = await service.getCampaignInsights('AD_ACCOUNT_ID', dateRange);
        return this.extractCompaniesFromAds(metaData, 'meta_ads');

      case 'tiktok_ads':
        const tiktokData = await service.getCampaignStats('ADVERTISER_ID', dateRange);
        return this.extractCompaniesFromAds(tiktokData, 'tiktok_ads');

      case 'hubspot':
        const hubspotData = await service.getContacts(1000);
        return this.extractCompaniesFromCrm(hubspotData, 'hubspot');

      default:
        return [];
    }
  }

  private extractCompaniesFromAnalytics(analyticsData: any): Partial<Company>[] {
    // Mock implementation - extract company data from analytics
    return [
      {
        domain: 'newanalytics.com',
        name: 'Analytics Company',
        industry: 'Technology',
        totalVisits: analyticsData.sessions || 0,
        lastVisit: new Date(),
        tags: ['Analytics Source'],
      }
    ];
  }

  private extractCompaniesFromAds(adData: any, source: string): Partial<Company>[] {
    // Mock implementation - extract company data from ad platforms
    if (!adData.campaigns) return [];

    return adData.campaigns.map((campaign: any, index: number) => ({
      domain: `${source}-lead-${index}.com`,
      name: `${source} Lead ${index + 1}`,
      industry: 'Technology',
      totalVisits: campaign.clicks || 0,
      lastVisit: new Date(),
      tags: [`${source} Source`, 'Ad Campaign'],
      score: Math.min(100, (campaign.conversions || 0) * 10 + 50)
    }));
  }

  private extractCompaniesFromCrm(crmData: any, source: string): Partial<Company>[] {
    // Mock implementation - extract company data from CRM
    if (!crmData.contacts) return [];

    return crmData.contacts.map((contact: any) => ({
      domain: contact.email ? contact.email.split('@')[1] : `${source}-lead.com`,
      name: contact.company || `${source} Lead`,
      industry: 'Unknown',
      totalVisits: 1,
      lastVisit: new Date(contact.lastActivity || Date.now()),
      tags: [`${source} Source`, 'CRM Contact'],
      score: 60
    }));
  }

  private async getExistingCompanies(): Promise<Company[]> {
    // In a real implementation, this would fetch from your database
    // For now, return empty array as we're working with mock data
    return [];
  }

  private async updateCompaniesWithSyncData(
    existingCompanies: Company[],
    syncData: Partial<Company>[],
    platformType: PlatformType
  ): Promise<{ updated: Company[]; added: Company[] }> {
    const updated: Company[] = [];
    const added: Company[] = [];

    for (const syncItem of syncData) {
      if (!syncItem.domain) continue;

      const existing = existingCompanies.find(c => c.domain === syncItem.domain);
      
      if (existing) {
        // Update existing company
        const updatedCompany: Company = {
          ...existing,
          ...syncItem,
          totalVisits: existing.totalVisits + (syncItem.totalVisits || 0),
          lastVisit: syncItem.lastVisit || existing.lastVisit,
          tags: [...new Set([...existing.tags, ...(syncItem.tags || [])])]
        };
        updated.push(updatedCompany);
      } else {
        // Add new company
        const newCompany: Company = {
          id: `${platformType}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          name: syncItem.name || 'Unknown Company',
          domain: syncItem.domain,
          industry: syncItem.industry || 'Unknown',
          size: syncItem.size || 'Unknown',
          location: syncItem.location || { city: 'Unknown', country: 'Unknown' },
          lastVisit: syncItem.lastVisit || new Date(),
          totalVisits: syncItem.totalVisits || 1,
          score: syncItem.score || 50,
          status: this.determineLeadStatus(syncItem.score || 50),
          tags: syncItem.tags || [`${platformType} Source`]
        };
        added.push(newCompany);
      }
    }

    return { updated, added };
  }

  private determineLeadStatus(score: number): 'hot' | 'warm' | 'cold' {
    if (score >= 80) return 'hot';
    if (score >= 60) return 'warm';
    return 'cold';
  }

  private isPlatformConnected(platformType: PlatformType): boolean {
    try {
      const stored = localStorage.getItem('customer_settings');
      if (stored) {
        const settings = JSON.parse(stored);
        return settings.integrations?.[platformType]?.isConnected || false;
      }
    } catch (error) {
      console.error('Failed to check platform connection:', error);
    }
    return false;
  }

  // Public methods for managing sync

  // Enable/disable sync for a platform
  setSyncEnabled(platformType: PlatformType, enabled: boolean) {
    const schedule = this.syncSchedules.get(platformType);
    if (schedule) {
      schedule.isActive = enabled;
      this.syncSchedules.set(platformType, schedule);
      this.saveSyncSchedules();

      if (enabled) {
        this.scheduleNextSync(platformType);
      } else {
        const interval = this.syncIntervals.get(platformType);
        if (interval) {
          clearTimeout(interval);
          this.syncIntervals.delete(platformType);
        }
      }
    }
  }

  // Update sync interval for a platform
  setSyncInterval(platformType: PlatformType, intervalMinutes: number) {
    const schedule = this.syncSchedules.get(platformType);
    if (schedule) {
      schedule.interval = intervalMinutes;
      this.syncSchedules.set(platformType, schedule);
      this.saveSyncSchedules();

      // Reschedule if active
      if (schedule.isActive) {
        this.scheduleNextSync(platformType);
      }
    }
  }

  // Get sync status for a platform
  getSyncStatus(platformType: PlatformType): SyncSchedule | null {
    return this.syncSchedules.get(platformType) || null;
  }

  // Get sync job result
  getSyncJob(jobId: string): SyncResult | null {
    return this.syncJobs.get(jobId) || null;
  }

  // Get all recent sync jobs
  getRecentSyncJobs(limit = 20): SyncResult[] {
    const jobs = Array.from(this.syncJobs.values());
    return jobs
      .sort((a, b) => b.startTime.getTime() - a.startTime.getTime())
      .slice(0, limit);
  }

  // Get sync summary
  getSyncSummary(): {
    totalPlatforms: number;
    activeSyncs: number;
    lastSyncTime?: Date;
    nextSyncTime?: Date;
    recentJobs: SyncResult[];
  } {
    const schedules = Array.from(this.syncSchedules.values());
    const activeSyncs = schedules.filter(s => s.isActive).length;
    
    const lastSyncTimes = schedules
      .filter(s => s.lastSync)
      .map(s => s.lastSync!)
      .sort((a, b) => b.getTime() - a.getTime());
    
    const nextSyncTimes = schedules
      .filter(s => s.nextSync && s.isActive)
      .map(s => s.nextSync!)
      .sort((a, b) => a.getTime() - b.getTime());

    return {
      totalPlatforms: schedules.length,
      activeSyncs,
      lastSyncTime: lastSyncTimes[0],
      nextSyncTime: nextSyncTimes[0],
      recentJobs: this.getRecentSyncJobs(5)
    };
  }

  // Cleanup old sync jobs
  cleanupOldJobs() {
    const cutoff = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000); // 7 days ago
    
    for (const [jobId, job] of this.syncJobs.entries()) {
      if (job.startTime < cutoff) {
        this.syncJobs.delete(jobId);
      }
    }
  }

  // Stop all syncs (useful for cleanup)
  stopAllSyncs() {
    this.syncIntervals.forEach(interval => clearTimeout(interval));
    this.syncIntervals.clear();
    
    this.syncSchedules.forEach(schedule => {
      schedule.isActive = false;
    });
    
    this.saveSyncSchedules();
  }
}

// Export singleton instance
export const platformSyncService = new PlatformSyncService();

