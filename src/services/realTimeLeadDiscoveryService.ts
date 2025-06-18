// Real-time Lead Discovery Service
import { Lead } from '../types/leads';

// Lead discovery sources
export type LeadSource = 'website' | 'social' | 'partner' | 'event' | 'referral';

// Lead discovery filters
export interface LeadDiscoveryFilters {
  industry?: string[];
  companySize?: string[];
  location?: string[];
  score?: number;
  source?: LeadSource[];
  fromDate?: string;
  toDate?: string;
}

// Lead discovery configuration interface
export interface LeadDiscoveryConfig {
  enableRealTimeDiscovery: boolean;
  discoverySources: LeadSource[];
  refreshInterval: number; // minutes
  scoreThreshold: number;
  notificationEnabled: boolean;
  automatedLeadCreation: boolean;
  excludedCompanies?: string[];
  priorityIndustries?: string[];
  // Additional properties needed by components
  discoveryInterval: number;
  minEngagementScore: number;
  autoEnrichNewLeads: boolean;
  notifyOnNewLeads: boolean;
}

// Lead discovery event interface
export interface LeadDiscoveryEvent {
  id: string;
  type: 'new_lead' | 'lead_update' | 'lead_score_change' | 'discovery_run';
  timestamp: number;
  lead: Lead;
  discoverySource?: LeadSource;
  score?: number;
  details?: Record<string, unknown>;
}

/**
 * Discover new leads in real-time based on various signals
 * @param filters Optional filters to apply to lead discovery
 * @returns Promise with discovered leads
 */
export async function discoverLeads(filters?: LeadDiscoveryFilters): Promise<Lead[]> {
  try {
    console.log('Discovering leads with filters:', filters);
    
    // Build query parameters
    const params = new URLSearchParams();
    if (filters?.industry && filters.industry.length > 0) {
      params.append('industry', filters.industry.join(','));
    }
    if (filters?.companySize && filters.companySize.length > 0) {
      params.append('companySize', filters.companySize.join(','));
    }
    if (filters?.location && filters.location.length > 0) {
      params.append('location', filters.location.join(','));
    }
    if (filters?.score !== undefined) {
      params.append('score', filters.score.toString());
    }
    if (filters?.source && filters.source.length > 0) {
      params.append('source', filters.source.join(','));
    }
    if (filters?.fromDate) {
      params.append('fromDate', filters.fromDate);
    }
    if (filters?.toDate) {
      params.append('toDate', filters.toDate);
    }
    
    // Call the real lead discovery API
    const apiUrl = `/api/discover-leads${params.toString() ? `?${params.toString()}` : ''}`;
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error(`API call failed: ${response.status} ${response.statusText}`);
    }
    
    const leads: Lead[] = await response.json();
    console.log(`Discovered ${leads.length} leads from API`);
    
    // Score each lead before returning
    const scoredLeads = leads.map(lead => scoreLeadQuality(lead));
    
    return scoredLeads;
  } catch (error) {
    console.error('Error discovering leads:', error);
    throw new Error(`Lead discovery failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Score a lead based on various signals
 * @param lead The lead to score
 * @returns Scored lead with score field populated
 */
export function scoreLeadQuality(lead: Lead): Lead {
  // Simple scoring algorithm
  let score = 50; // Base score
  
  // Adjust based on available information
  if (lead.email) score += 10;
  if (lead.phone) score += 5;
  if (lead.companyName) score += 5;
  if (lead.industry) score += 5;
  if (lead.companySize) score += 3;
  if (lead.website) score += 2;
  if (lead.location) score += 2;
  
  // Adjust based on interaction signals
  if (lead.interactions) {
    if (lead.interactions.websiteVisits && lead.interactions.websiteVisits > 5) score += 10;
    if (lead.interactions.downloadedContent) score += 15;
    if (lead.interactions.formSubmissions) score += 20;
    if (lead.interactions.emailOpens && lead.interactions.emailOpens > 3) score += 5;
    if (lead.interactions.emailClicks && lead.interactions.emailClicks > 2) score += 10;
  }
  
  // Cap score at 100
  score = Math.min(100, score);
  
  return {
    ...lead,
    score
  };
}

/**
 * Get lead discovery statistics
 * @returns Statistics about discovered leads
 */
export async function getLeadDiscoveryStats(): Promise<{
  totalDiscovered: number;
  bySource: Record<LeadSource, number>;
  byIndustry: Record<string, number>;
  averageScore: number;
}> {
  try {
    const response = await fetch('/api/lead-discovery-stats', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`API call failed: ${response.status} ${response.statusText}`);
    }

    const stats = await response.json();
    return stats;
  } catch (error) {
    console.error('Error getting lead discovery stats:', error);
    // Return empty stats when API fails
    return {
      totalDiscovered: 0,
      bySource: {
        website: 0,
        social: 0,
        partner: 0,
        event: 0,
        referral: 0
      },
      byIndustry: {},
      averageScore: 0
    };
  }
}

/**
 * Get current lead discovery configuration
 * @returns Current configuration
 */
export function getConfig(): LeadDiscoveryConfig {
  // Default configuration values
  return {
    enableRealTimeDiscovery: true,
    discoverySources: ['website', 'social', 'event'],
    refreshInterval: 30, // minutes
    scoreThreshold: 60,
    notificationEnabled: true,
    automatedLeadCreation: false,
    priorityIndustries: ['Technology', 'Finance', 'Healthcare'],
    // Additional properties for UI components
    discoveryInterval: 30,
    minEngagementScore: 50,
    autoEnrichNewLeads: true,
    notifyOnNewLeads: true
  };
}

/**
 * Update lead discovery configuration
 * @param updates Configuration updates to apply
 * @returns Updated configuration
 */
export function updateConfig(updates: Partial<LeadDiscoveryConfig>): LeadDiscoveryConfig {
  const currentConfig = getConfig();
  console.log('Updating lead discovery configuration:', updates);
  
  // In a real implementation, save this to persistent storage
  return {
    ...currentConfig,
    ...updates
  };
}

/**
 * Get current lead discovery status
 * @returns Current status
 */
export function getStatus(): { isRunning: boolean; lastDiscoveryRun?: string; nextDiscoveryRun?: string; enabledPlatforms: string[] } {
  // Mock status information
  return {
    isRunning: true,
    lastDiscoveryRun: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 minutes ago
    nextDiscoveryRun: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30 minutes from now
    enabledPlatforms: ['website', 'linkedin', 'twitter']
  };
}

/**
 * Start lead discovery process
 */
export function start(): void {
  console.log('Starting lead discovery process');
  // In a real implementation, start background process or timer
}

/**
 * Stop lead discovery process
 */
export function stop(): void {
  console.log('Stopping lead discovery process');
  // In a real implementation, stop background process or timer
}

/**
 * Run lead discovery process immediately
 * @returns Discovery results
 */
export async function discoverNow(): Promise<{ discovered: number; processed: number }> {
  try {
    console.log('Running lead discovery now');
    
    const response = await fetch('/api/discover-now', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`API call failed: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error running lead discovery:', error);
    // Return zero results when API fails
    return {
      discovered: 0,
      processed: 0
    };
  }
}

/**
 * Register event listener for discovery events
 * @param _listener Function to call when events occur
 */
export function addEventListener(_listener: (event: LeadDiscoveryEvent) => void): void {
  console.log('Added event listener for lead discovery events');
  // In a real implementation, register the listener with WebSocket or Server-Sent Events
  // This would connect to a real-time event stream from the backend
}

/**
 * Remove event listener
 * @param _listener Listener to remove
 */
export function removeEventListener(_listener: (event: LeadDiscoveryEvent) => void): void {
  console.log('Removed event listener for lead discovery events');
  // In a real implementation, unregister the listener
}

export const realTimeLeadDiscoveryService = {
  discoverLeads,
  scoreLeadQuality,
  getConfig,
  updateConfig,
  getStatus,
  start,
  stop,
  discoverNow,
  addEventListener,
  removeEventListener
};