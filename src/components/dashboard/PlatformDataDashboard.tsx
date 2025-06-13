// Platform Data Dashboard - Show platform integration status and data sync information
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Activity, 
  RefreshCw, 
  TrendingUp, 
  Users, 
  Database,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  BarChart3,
  Target
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useCustomerSettings } from '@/contexts/CustomerContext';
import { leadsApi } from '@/lib/api';
import { PlatformType } from '@/types/integrations';
import { PLATFORM_CONFIGS } from '@/lib/platformConfigs';
import { toast } from '@/components/ui/use-toast';
import { format } from 'date-fns';

interface PlatformSyncStatus {
  totalPlatforms: number;
  activeSyncs: number;
  lastSyncTime?: Date;
  nextSyncTime?: Date;
  recentJobs: Array<{
    success: boolean;
    jobId: string;
    platformType: PlatformType;
    startTime: Date;
    endTime?: Date;
    recordsProcessed: number;
    status: string;
  }>;
}

interface EnrichmentSummary {
  totalCompanies: number;
  enrichedCompanies: number;
  platformCoverage: Record<PlatformType, number>;
  averageScore: number;
}

export const PlatformDataDashboard: React.FC = () => {
  const { t } = useTranslation();
  const { integrations } = useCustomerSettings();
  const [syncStatus, setSyncStatus] = useState<PlatformSyncStatus | null>(null);
  const [enrichmentSummary, setEnrichmentSummary] = useState<EnrichmentSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState<Set<PlatformType>>(new Set());

  useEffect(() => {
    loadDashboardData();
    const interval = setInterval(loadDashboardData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [syncData, enrichmentData] = await Promise.all([
        leadsApi.getPlatformSyncStatus(),
        leadsApi.getEnrichmentSummary()
      ]);
      
      setSyncStatus(syncData);
      setEnrichmentSummary(enrichmentData);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      toast({
        title: t('common.error'),
        description: 'Failed to load platform data',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleManualSync = async (platformType: PlatformType) => {
    setSyncing(prev => new Set([...prev, platformType]));
    
    try {
      const result = await leadsApi.syncPlatform(platformType);
      
      if (result.success) {
        toast({
          title: t('integrations.syncSuccess'),
          description: `${PLATFORM_CONFIGS[platformType].name} synced successfully`
        });
        await loadDashboardData(); // Refresh data
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      toast({
        title: t('integrations.syncFailed'),
        description: error instanceof Error ? error.message : 'Sync failed',
        variant: 'destructive'
      });
    } finally {
      setSyncing(prev => {
        const newSet = new Set(prev);
        newSet.delete(platformType);
        return newSet;
      });
    }
  };

  const getConnectedPlatforms = () => {
    return Object.entries(integrations).filter(([_, integration]) => integration.isConnected);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'running': return 'bg-blue-100 text-blue-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'running': return <RefreshCw className="h-4 w-4 animate-spin" />;
      case 'failed': return <XCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  if (loading || !syncStatus || !enrichmentSummary) {
    return (
      <div className="space-y-6">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  const connectedPlatforms = getConnectedPlatforms();
  const enrichmentPercentage = enrichmentSummary.totalCompanies > 0 
    ? (enrichmentSummary.enrichedCompanies / enrichmentSummary.totalCompanies) * 100 
    : 0;

  return (
    <div className="space-y-6">
      {/* Header */}      <div>
        <h2 className="text-2xl font-bold tracking-tight">{t('analytics.platformDataDashboard', 'Platform Data Dashboard')}</h2>
        <p className="text-muted-foreground">
          {t('analytics.monitorPlatformIntegrations', 'Monitor your platform integrations and data synchronization')}
        </p>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('analytics.connectedPlatformsTitle')}</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{connectedPlatforms.length}</div>
            <p className="text-xs text-muted-foreground">
              of {Object.keys(PLATFORM_CONFIGS).length} available
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('analytics.activeSyncs')}</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{syncStatus.activeSyncs}</div>
            <p className="text-xs text-muted-foreground">
              platforms syncing data
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('analytics.enrichedCompanies')}</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{enrichmentSummary.enrichedCompanies}</div>
            <p className="text-xs text-muted-foreground">
              of {enrichmentSummary.totalCompanies} total companies
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('analytics.averageScore')}</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{enrichmentSummary.averageScore.toFixed(1)}</div>
            <p className="text-xs text-muted-foreground">
              enrichment score
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Data Enrichment Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Data Enrichment Progress
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>{t('analytics.enrichedCompanies', 'Enriched Companies')}</span>
              <span>{enrichmentPercentage.toFixed(1)}%</span>
            </div>
            <Progress value={enrichmentPercentage} className="h-2" />
          </div>
          
          {enrichmentPercentage < 100 && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {(100 - enrichmentPercentage).toFixed(1)}% of your companies could benefit from additional platform data. 
                Connect more platforms or trigger manual syncs to improve data enrichment.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      <Tabs defaultValue="platforms" className="space-y-4">
        <TabsList>          <TabsTrigger value="platforms">{t('analytics.platformStatus', 'Platform Status')}</TabsTrigger>
          <TabsTrigger value="sync-jobs">{t('analytics.recentSyncJobs', 'Recent Sync Jobs')}</TabsTrigger>
          <TabsTrigger value="coverage">{t('analytics.platformCoverage', 'Platform Coverage')}</TabsTrigger>
        </TabsList>

        <TabsContent value="platforms" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t('analytics.connectedPlatformsTitle')}</CardTitle>
            </CardHeader>
            <CardContent>
              {connectedPlatforms.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No platforms connected. Go to Settings → Integrations to connect platforms.
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {connectedPlatforms.map(([platformId, integration]) => {
                    const config = PLATFORM_CONFIGS[platformId as PlatformType];
                    const isSyncing = syncing.has(platformId as PlatformType);
                    
                    return (
                      <div
                        key={platformId}
                        className="flex items-center justify-between p-4 border rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{config.icon}</span>
                          <div>
                            <h3 className="font-medium">{config.name}</h3>
                            <p className="text-sm text-muted-foreground">
                              Last sync: {integration.lastSync 
                                ? format(new Date(integration.lastSync), 'PPp')
                                : 'Never'
                              }
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={integration.isActive ? 'default' : 'secondary'}>
                            {integration.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleManualSync(platformId as PlatformType)}
                            disabled={isSyncing}
                          >
                            {isSyncing ? (
                              <RefreshCw className="h-4 w-4 animate-spin" />
                            ) : (
                              <RefreshCw className="h-4 w-4" />
                            )}
                            Sync
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sync-jobs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t('analytics.recentSyncJobs', 'Recent Sync Jobs')}</CardTitle>
            </CardHeader>
            <CardContent>
              {syncStatus.recentJobs.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No sync jobs found. Trigger a manual sync to see activity.
                </div>
              ) : (
                <div className="space-y-3">
                  {syncStatus.recentJobs.map((job) => (
                    <div
                      key={job.jobId}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        {getStatusIcon(job.status)}
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">
                              {PLATFORM_CONFIGS[job.platformType].name}
                            </span>
                            <Badge variant="outline" className={getStatusColor(job.status)}>
                              {job.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {format(job.startTime, 'PPp')} • {job.recordsProcessed} records processed
                          </p>
                        </div>
                      </div>
                      <div className="text-right text-sm text-muted-foreground">
                        {job.endTime && (
                          <div>
                            Duration: {Math.round((job.endTime.getTime() - job.startTime.getTime()) / 1000)}s
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="coverage" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t('analytics.platformCoverage', 'Platform Coverage')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(enrichmentSummary.platformCoverage).map(([platform, count]) => {
                  const config = PLATFORM_CONFIGS[platform as PlatformType];
                  const percentage = enrichmentSummary.totalCompanies > 0 
                    ? (count / enrichmentSummary.totalCompanies) * 100 
                    : 0;
                  
                  return (
                    <div key={platform} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{config.icon}</span>
                          <span className="font-medium">{config.name}</span>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {count} / {enrichmentSummary.totalCompanies} ({percentage.toFixed(1)}%)
                        </div>
                      </div>
                      <Progress value={percentage} className="h-2" />
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
