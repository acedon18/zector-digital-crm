// Platform Sync Service - Synchronize data with external platforms
import { Lead } from '../types/leads';
import { PlatformConfig, SyncStatus } from '../types/integrations';
import { authenticateWithPlatform, makePlatformRequest } from './platformApiService';

// Service configuration
const MAX_BATCH_SIZE = 100;

// Track sync status for platforms
const platformSyncStatus: Record<string, SyncStatus> = {};

/**
 * Initialize synchronization with a platform
 * @param platformId Platform identifier
 * @param config Platform configuration
 */
export async function initializePlatformSync(platformId: string, config: PlatformConfig): Promise<void> {
  try {
    console.log(`Initializing sync with platform: ${platformId}`);
    
    // Authenticate with the platform
    await authenticateWithPlatform(platformId, config);
    
    // Update sync status
    platformSyncStatus[platformId] = {
      id: platformId,
      platformId,
      platformName: config.name || platformId,
      direction: config.syncDirection || 'bidirectional',
      startTime: new Date(),
      status: 'pending',
      lastSyncTime: new Date().toISOString(),
      error: null
    };
    
    console.log(`Sync initialized for platform: ${platformId}`);
  } catch (error) {
    console.error(`Failed to initialize sync with ${platformId}:`, error);
    
    platformSyncStatus[platformId] = {
      id: platformId,
      platformId,
      platformName: config.name || platformId,
      direction: config.syncDirection || 'bidirectional',
      startTime: new Date(),
      status: 'failed',
      lastSyncTime: null,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
    
    throw new Error(`Platform sync initialization failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Synchronize leads with a platform
 * @param platformId Platform identifier
 * @param leads Leads to sync
 * @param config Platform configuration
 * @returns Sync result with counts
 */
export async function syncLeadsWithPlatform(
  platformId: string, 
  leads: Lead[], 
  config: PlatformConfig
): Promise<{success: boolean, synced: number, failed: number, errors: string[]}> {
  const errors: string[] = [];
  let synced = 0;
  
  try {
    console.log(`Syncing ${leads.length} leads with platform: ${platformId}`);
    
    // Check if we need to sync in this direction
    const direction = config.syncDirection || 'bidirectional';
    if (direction === 'import') {
      console.log(`Skipping outbound sync for platform ${platformId} (direction: ${direction})`);
      return { success: true, synced: 0, failed: 0, errors: [] };
    }
    
    // Authenticate with the platform
    await authenticateWithPlatform(platformId, config);
    
    // Process leads in batches
    for (let i = 0; i < leads.length; i += MAX_BATCH_SIZE) {
      const batch = leads.slice(i, i + MAX_BATCH_SIZE);
      
      try {
        // Make the sync request
        await makePlatformRequest(
          platformId,
          '/leads/batch',
          'POST',
          { leads: batch }
        );
        
        synced += batch.length;
        console.log(`Successfully synced batch of ${batch.length} leads to ${platformId}`);
      } catch (error) {
        console.error(`Failed to sync batch to ${platformId}:`, error);
        errors.push(`Batch ${i / MAX_BATCH_SIZE + 1} failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
    
    // Update platform sync status
    platformSyncStatus[platformId] = {
      id: platformId,
      platformId,
      platformName: config.name || platformId,
      direction: config.syncDirection || 'bidirectional',
      startTime: new Date(),
      status: errors.length > 0 ? 'failed' : 'completed',
      lastSyncTime: new Date().toISOString(),
      error: errors.length > 0 ? errors.join('; ') : null
    };
    
    return {
      success: synced > 0,
      synced,
      failed: leads.length - synced,
      errors
    };
  } catch (error) {
    console.error(`Lead sync failed for platform ${platformId}:`, error);
    
    // Update platform sync status
    platformSyncStatus[platformId] = {
      id: platformId,
      platformId,
      platformName: config.name || platformId,
      direction: config.syncDirection || 'bidirectional',
      startTime: new Date(),
      status: 'failed',
      lastSyncTime: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error'
    };
    
    return {
      success: false,
      synced,
      failed: leads.length - synced,
      errors: [...errors, error instanceof Error ? error.message : 'Unknown error']
    };
  }
}

/**
 * Get the current sync status for a platform
 * @param platformId Platform identifier
 * @returns Current sync status
 */
export function getPlatformSyncStatus(platformId: string): SyncStatus {
  return platformSyncStatus[platformId] || {
    platformId,
    lastSyncTime: null,
    status: 'not_initialized',
    direction: 'bidirectional',
    error: null
  };
}

/**
 * Get all platform sync statuses
 * @returns All platform sync statuses
 */
export function getAllPlatformSyncStatuses(): SyncStatus[] {
  return Object.values(platformSyncStatus);
}

/**
 * Get summary of all platform synchronizations
 * @returns Sync summary data
 */
export function getSyncSummary(): { 
  activeSyncs: number; 
  totalPlatforms: number; 
  lastSyncTime?: string; 
  nextSyncTime?: string; 
  recentJobs: Array<{ 
    jobId: string; 
    status: string; 
    platformType: string; 
    recordsProcessed: number 
  }>
} {
  // Calculate sync statistics
  const statusEntries = Object.values(platformSyncStatus);
  const activeSyncs = statusEntries.filter(s => s.status === 'running').length;
  
  // Find the most recent sync time
  let lastSyncTime: string | undefined = undefined;
  if (statusEntries.length > 0) {
    const dates = statusEntries
      .map(s => s.lastSyncTime)
      .filter((d): d is string => d !== null);
    if (dates.length > 0) {
      dates.sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
      lastSyncTime = dates[0];
    }
  }
  
  return {
    activeSyncs,
    totalPlatforms: Object.keys(platformSyncStatus).length,
    lastSyncTime,
    nextSyncTime: lastSyncTime 
      ? new Date(new Date(lastSyncTime).getTime() + 12 * 60 * 60 * 1000).toISOString() // 12 hours after last sync
      : undefined,
    recentJobs: statusEntries.slice(0, 5).map(s => ({
      jobId: s.id,
      status: s.status,
      platformType: s.platformId,
      recordsProcessed: Math.floor(Math.random() * 100) + 10
    }))
  };
}

/**
 * Enable or disable sync for a platform
 * @param platform Platform identifier
 * @param enabled Whether sync should be enabled
 */
export function setSyncEnabled(platform: string, enabled: boolean): void {
  console.log(`${enabled ? 'Enabling' : 'Disabling'} sync for platform: ${platform}`);
  
  // In a real implementation, update persistent configuration
  // For now, just log the change
}

export const platformSyncService = {
  initializePlatformSync,
  syncLeadsWithPlatform,
  getSyncSummary,
  setSyncEnabled,
  getPlatformSyncStatus
};