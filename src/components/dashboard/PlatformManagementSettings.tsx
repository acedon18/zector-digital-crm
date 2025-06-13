// Platform Integration Management Component for Settings
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Settings as SettingsIcon,
  Activity,
  Clock,
  Target,
  Zap,
  Bell,
  Database,
  RefreshCw,
  AlertTriangle
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { toast } from '@/components/ui/use-toast';
import { 
  realTimeLeadDiscoveryService, 
  LeadDiscoveryConfig,
  LeadDiscoveryEvent 
} from '@/services/realTimeLeadDiscoveryService';
import { platformSyncService } from '@/services/platformSyncService';
import { PlatformType } from '@/types/integrations';
import { PLATFORM_CONFIGS } from '@/lib/platformConfigs';

export const PlatformManagementSettings: React.FC = () => {
  const { t } = useTranslation();
  const [discoveryConfig, setDiscoveryConfig] = useState<LeadDiscoveryConfig | null>(null);
  const [discoveryStatus, setDiscoveryStatus] = useState<any>(null);
  const [syncStatus, setSyncStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [recentEvents, setRecentEvents] = useState<LeadDiscoveryEvent[]>([]);

  useEffect(() => {
    loadSettings();
    
    // Subscribe to discovery events
    const eventListener = (event: LeadDiscoveryEvent) => {
      setRecentEvents(prev => [event, ...prev.slice(0, 9)]);
      
      if (event.type === 'new_lead') {
        toast({
          title: 'New Lead Discovered!',
          description: `Found ${event.lead.company.name} from ${event.lead.discoverySource}`,
        });
      }
    };
    
    realTimeLeadDiscoveryService.addEventListener(eventListener);
    
    // Start discovery service if enabled
    const config = realTimeLeadDiscoveryService.getConfig();
    if (config.enableRealTimeDiscovery) {
      realTimeLeadDiscoveryService.start();
    }

    return () => {
      realTimeLeadDiscoveryService.removeEventListener(eventListener);
    };
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      
      const [config, status, syncSummary] = await Promise.all([
        realTimeLeadDiscoveryService.getConfig(),
        realTimeLeadDiscoveryService.getStatus(),
        platformSyncService.getSyncSummary()
      ]);
      
      setDiscoveryConfig(config);
      setDiscoveryStatus(status);
      setSyncStatus(syncSummary);
    } catch (error) {
      console.error('Failed to load platform settings:', error);
      toast({
        title: 'Failed to load settings',
        description: 'Please refresh the page and try again',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleToggleDiscovery = async (enabled: boolean) => {
    try {
      if (enabled) {
        realTimeLeadDiscoveryService.start();
        toast({
          title: 'Lead Discovery Started',
          description: 'Real-time lead discovery is now active'
        });
      } else {
        realTimeLeadDiscoveryService.stop();
        toast({
          title: 'Lead Discovery Stopped',
          description: 'Real-time lead discovery has been paused'
        });
      }
      
      await loadSettings();
    } catch (error) {
      toast({
        title: 'Failed to toggle discovery',
        description: 'Please try again',
        variant: 'destructive'
      });
    }
  };

  const handleUpdateConfig = async (updates: Partial<LeadDiscoveryConfig>) => {
    try {
      realTimeLeadDiscoveryService.updateConfig(updates);
      await loadSettings();
      
      toast({
        title: 'Settings Updated',
        description: 'Discovery configuration has been saved'
      });
    } catch (error) {
      toast({
        title: 'Failed to update settings',
        description: 'Please try again',
        variant: 'destructive'
      });
    }
  };

  const handleManualDiscovery = async () => {
    try {
      const result = await realTimeLeadDiscoveryService.discoverNow();
      toast({
        title: 'Manual Discovery Complete',
        description: `Discovered ${result.discovered} leads, processed ${result.processed}`
      });
    } catch (error) {
      toast({
        title: 'Discovery Failed',
        description: 'Manual discovery encountered an error',
        variant: 'destructive'
      });
    }
  };

  const handleTogglePlatformSync = (platform: PlatformType, enabled: boolean) => {
    platformSyncService.setSyncEnabled(platform, enabled);
    toast({
      title: `${PLATFORM_CONFIGS[platform].name} Sync ${enabled ? 'Enabled' : 'Disabled'}`,
      description: `Background sync has been ${enabled ? 'activated' : 'paused'} for this platform`
    });
  };

  if (loading || !discoveryConfig || !discoveryStatus || !syncStatus) {
    return (
      <div className="space-y-6">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-lg font-medium mb-2">Platform Integration Management</h3>
        <p className="text-sm text-muted-foreground">
          Configure real-time lead discovery, data synchronization, and platform settings
        </p>
      </div>

      {/* Discovery Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Real-Time Lead Discovery
            <Badge variant={discoveryStatus.isRunning ? 'default' : 'secondary'}>
              {discoveryStatus.isRunning ? 'Active' : 'Inactive'}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="font-medium">Enable Real-Time Discovery</span>
              <p className="text-sm text-muted-foreground">
                Automatically discover new leads from connected platforms
              </p>
            </div>
            <Switch
              checked={discoveryStatus.isRunning}
              onCheckedChange={handleToggleDiscovery}
            />
          </div>

          {discoveryStatus.isRunning && (
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <Label className="text-sm font-medium">Last Discovery</Label>
                <p className="text-sm text-muted-foreground">
                  {discoveryStatus.lastDiscoveryRun 
                    ? new Date(discoveryStatus.lastDiscoveryRun).toLocaleTimeString()
                    : 'Never'
                  }
                </p>
              </div>
              <div>
                <Label className="text-sm font-medium">Next Discovery</Label>
                <p className="text-sm text-muted-foreground">
                  {discoveryStatus.nextDiscoveryRun 
                    ? new Date(discoveryStatus.nextDiscoveryRun).toLocaleTimeString()
                    : 'Not scheduled'
                  }
                </p>
              </div>
              <div>
                <Label className="text-sm font-medium">Active Platforms</Label>
                <p className="text-sm text-muted-foreground">
                  {discoveryStatus.enabledPlatforms.length} platforms
                </p>
              </div>
            </div>
          )}

          <div className="flex gap-2">
            <Button onClick={handleManualDiscovery} variant="outline">
              <Zap className="h-4 w-4 mr-2" />
              Discover Now
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Discovery Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <SettingsIcon className="h-5 w-5" />
            Discovery Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Discovery Interval */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Discovery Interval (minutes)</Label>
            <div className="space-y-2">
              <Slider
                value={[discoveryConfig.discoveryInterval]}
                onValueChange={([value]) => handleUpdateConfig({ discoveryInterval: value })}
                min={1}
                max={60}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>1 min</span>
                <span>Current: {discoveryConfig.discoveryInterval} min</span>
                <span>60 min</span>
              </div>
            </div>
          </div>

          {/* Minimum Engagement Score */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Minimum Engagement Score</Label>
            <div className="space-y-2">
              <Slider
                value={[discoveryConfig.minEngagementScore]}
                onValueChange={([value]) => handleUpdateConfig({ minEngagementScore: value })}
                min={0}
                max={100}
                step={5}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>0</span>
                <span>Current: {discoveryConfig.minEngagementScore}</span>
                <span>100</span>
              </div>
            </div>
          </div>

          {/* Options */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-medium">Auto-Enrich New Leads</span>
                <p className="text-sm text-muted-foreground">
                  Automatically enrich discovered leads with platform data
                </p>
              </div>
              <Switch
                checked={discoveryConfig.autoEnrichNewLeads}
                onCheckedChange={(checked) => handleUpdateConfig({ autoEnrichNewLeads: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <span className="font-medium">Notify on New Leads</span>
                <p className="text-sm text-muted-foreground">
                  Show notifications when new leads are discovered
                </p>
              </div>
              <Switch
                checked={discoveryConfig.notifyOnNewLeads}
                onCheckedChange={(checked) => handleUpdateConfig({ notifyOnNewLeads: checked })}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Platform Sync Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Platform Synchronization
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="text-center">
              <div className="text-2xl font-bold">{syncStatus.activeSyncs}</div>
              <p className="text-sm text-muted-foreground">Active Syncs</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{syncStatus.totalPlatforms}</div>
              <p className="text-sm text-muted-foreground">Total Platforms</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">
                {syncStatus.lastSyncTime 
                  ? new Date(syncStatus.lastSyncTime).toLocaleDateString()
                  : 'Never'
                }
              </div>
              <p className="text-sm text-muted-foreground">Last Sync</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">
                {syncStatus.nextSyncTime 
                  ? new Date(syncStatus.nextSyncTime).toLocaleTimeString()
                  : 'N/A'
                }
              </div>
              <p className="text-sm text-muted-foreground">Next Sync</p>
            </div>
          </div>

          {syncStatus.recentJobs.length > 0 && (
            <div className="space-y-2">
              <Label className="text-sm font-medium">Recent Sync Jobs</Label>
              <div className="space-y-2">
                {syncStatus.recentJobs.slice(0, 3).map((job: any) => (
                  <div key={job.jobId} className="flex items-center justify-between p-2 border rounded">
                    <div className="flex items-center gap-2">
                      {job.status === 'completed' ? (
                        <RefreshCw className="h-4 w-4 text-green-600" />
                      ) : job.status === 'failed' ? (
                        <AlertTriangle className="h-4 w-4 text-red-600" />
                      ) : (
                        <Clock className="h-4 w-4 text-yellow-600" />
                      )}
                      <span className="text-sm font-medium">
                        {PLATFORM_CONFIGS[job.platformType as PlatformType]?.name || job.platformType}
                      </span>
                    </div>
                    <div className="text-right">
                      <Badge variant={
                        job.status === 'completed' ? 'default' : 
                        job.status === 'failed' ? 'destructive' : 'secondary'
                      }>
                        {job.status}
                      </Badge>
                      <p className="text-xs text-muted-foreground">
                        {job.recordsProcessed} records
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Discovery Events */}
      {recentEvents.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Recent Discovery Events
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {recentEvents.slice(0, 5).map((event, index) => (
                <div key={index} className="flex items-center justify-between p-2 border rounded">
                  <div className="flex items-center gap-2">
                    <Target className="h-4 w-4 text-blue-600" />
                    <div>
                      <span className="text-sm font-medium">{event.lead.company.name}</span>
                      <p className="text-xs text-muted-foreground">
                        from {event.lead.discoverySource.replace('_', ' ')} • 
                        Score: {event.lead.company.score} • 
                        Confidence: {(event.lead.confidence * 100).toFixed(0)}%
                      </p>
                    </div>
                  </div>
                  <Badge variant="outline">
                    {event.type.replace('_', ' ')}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Help and Tips */}
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          <strong>Tips for optimal performance:</strong>
          <ul className="mt-2 text-sm list-disc list-inside space-y-1">
            <li>Set discovery interval based on your data volume (5-15 minutes for high traffic)</li>
            <li>Adjust minimum engagement score to filter quality leads (60+ recommended)</li>
            <li>Enable auto-enrichment for comprehensive lead profiles</li>
            <li>Monitor sync status to ensure data freshness</li>
          </ul>
        </AlertDescription>
      </Alert>
    </div>
  );
};
