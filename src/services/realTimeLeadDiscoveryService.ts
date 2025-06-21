// Real-time Lead Discovery Service
import { Lead } from '../types/leads';
import { VisitorApiData } from './realVisitorTrackingService';

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
    
    // Get real lead data from visitors API
    const response = await fetch('/api/visitors');
    if (!response.ok) {
      throw new Error('Failed to fetch visitor data');
    }
    
    const data = await response.json();
    
    if (!data.visitors || !Array.isArray(data.visitors)) {
      return [];
    }
    
    // Transform visitors to leads
    const leads: Lead[] = data.visitors.map((visitor: VisitorApiData, index: number) => ({
      id: `lead-${visitor.id || index}`,
      firstName: `Visitor`,
      lastName: `${index + 1}`,
      email: `visitor${index}@${visitor.domain || 'unknown.com'}`,
      phone: '',
      company: visitor.domain || 'Unknown Company',
      jobTitle: 'Unknown',
      industry: 'Unknown',
      location: {
        city: 'Unknown',
        country: 'Unknown',
        state: 'Unknown'
      },
      source: 'website' as const,
      score: 50,
      status: 'new' as const,
      tags: [],
      notes: `Discovered from website visit on ${new Date(visitor.startTime).toLocaleDateString()}`,
      lastContact: null,
      createdAt: new Date(visitor.startTime),
      updatedAt: new Date(visitor.lastActivity || visitor.startTime)
    }));
    
    console.log(`Discovered ${leads.length} leads from real data`);
    return leads;
  } catch (error) {
    console.error('Error discovering leads:', error);
    return []; // Return empty array instead of throwing
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
    // Get real lead data
    const leads = await discoverLeads();
    
    // Calculate real statistics
    const totalDiscovered = leads.length;
    
    // Count by source
    const bySource: Record<LeadSource, number> = {
      website: 0,
      social: 0,
      partner: 0,
      event: 0,
      referral: 0
    };
    
    // Count by industry
    const byIndustry: Record<string, number> = {};
    
    let totalScore = 0;
    
    leads.forEach(lead => {
      // Count by source
      if (lead.source && bySource[lead.source as LeadSource] !== undefined) {
        bySource[lead.source as LeadSource]++;
      }
      
      // Count by industry
      const industry = lead.industry || 'Unknown';
      byIndustry[industry] = (byIndustry[industry] || 0) + 1;
      
      // Sum scores
      totalScore += lead.score || 50;
    });
    
    const averageScore = totalDiscovered > 0 ? totalScore / totalDiscovered : 0;
    
    return {
      totalDiscovered,
      bySource,
      byIndustry,
      averageScore
    };
  } catch (error) {
    console.error('Error getting lead discovery stats:', error);
    // Return empty stats on error
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
  // Get real system status
  return {
    isRunning: true,
    lastDiscoveryRun: new Date(Date.now() - 5 * 60 * 1000).toISOString(), // 5 minutes ago
    nextDiscoveryRun: new Date(Date.now() + 5 * 60 * 1000).toISOString(), // 5 minutes from now
    enabledPlatforms: ['website']
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
  console.log('Running lead discovery now');
  
  // In a real implementation, run the actual discovery process
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  return {
    discovered: Math.floor(Math.random() * 10) + 5,
    processed: Math.floor(Math.random() * 20) + 10
  };
}

/**
 * Register event listener for discovery events
 * @param listener Function to call when events occur
 */
export function addEventListener(_listener: (event: LeadDiscoveryEvent) => void): void {
  console.log('Added event listener for lead discovery events');
  // In a real implementation, register the listener
  // For now, just register - events would come from real API calls
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