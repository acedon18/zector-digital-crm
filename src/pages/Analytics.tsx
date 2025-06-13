import { useState, useEffect, useCallback } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Eye, 
  Target, 
  Database,
  BarChart3,
  PieChart,
  Activity,
  RefreshCw,
  Zap,
  Globe
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useCustomerSettings } from '@/contexts/CustomerContext';
import { leadsApi } from '@/lib/api';
import { PlatformDataDashboard } from '@/components/dashboard/PlatformDataDashboard';
import { toast } from '@/components/ui/use-toast';

interface AnalyticsData {
  overview: {
    totalLeads: number;
    enrichedLeads: number;
    platformSources: number;
    averageScore: number;
    weeklyGrowth: number;
    conversionRate: number;
  };
  platformPerformance: Array<{
    platform: string;
    leads: number;
    score: number;
    growth: number;
  }>;
  leadSources: Array<{
    source: string;
    count: number;
    percentage: number;
    trend: 'up' | 'down' | 'stable';
  }>;
  enrichmentStats: {
    totalCompanies: number;
    enrichedCompanies: number;
    enrichmentCoverage: number;
    avgEnrichmentScore: number;
  };
}

const Analytics = () => {
  const { t } = useTranslation();
  const { integrations } = useCustomerSettings();
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30d');
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    loadAnalyticsData();
  }, [timeRange]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadAnalyticsData = async () => {
    try {
      setLoading(true);
      
      // Get enrichment summary and platform data
      const [enrichmentSummary, platformSyncStatus] = await Promise.all([
        leadsApi.getEnrichmentSummary(),
        leadsApi.getPlatformSyncStatus()
      ]);

      // Generate analytics data based on platform integration
      const connectedPlatforms = Object.values(integrations).filter(i => i.isConnected);
      
      const mockAnalyticsData: AnalyticsData = {
        overview: {
          totalLeads: enrichmentSummary.totalCompanies,
          enrichedLeads: enrichmentSummary.enrichedCompanies,
          platformSources: connectedPlatforms.length,
          averageScore: enrichmentSummary.averageScore,
          weeklyGrowth: Math.floor(Math.random() * 20) + 5,
          conversionRate: Math.random() * 5 + 2
        },
        platformPerformance: Object.entries(enrichmentSummary.platformCoverage).map(([platform, count]) => ({
          platform: platform.replace('_', ' ').toUpperCase(),
          leads: count,
          score: Math.floor(Math.random() * 40) + 60,
          growth: Math.floor(Math.random() * 30) - 10
        })),
        leadSources: [
          { source: 'Google Analytics', count: Math.floor(Math.random() * 50) + 20, percentage: 0, trend: 'up' },
          { source: 'Google Ads', count: Math.floor(Math.random() * 40) + 15, percentage: 0, trend: 'up' },
          { source: 'Meta Ads', count: Math.floor(Math.random() * 35) + 12, percentage: 0, trend: 'stable' },
          { source: 'Direct Traffic', count: Math.floor(Math.random() * 25) + 8, percentage: 0, trend: 'down' },
          { source: 'HubSpot', count: Math.floor(Math.random() * 20) + 5, percentage: 0, trend: 'up' }
        ],
        enrichmentStats: {
          totalCompanies: enrichmentSummary.totalCompanies,
          enrichedCompanies: enrichmentSummary.enrichedCompanies,
          enrichmentCoverage: enrichmentSummary.totalCompanies > 0 
            ? (enrichmentSummary.enrichedCompanies / enrichmentSummary.totalCompanies) * 100 
            : 0,
          avgEnrichmentScore: enrichmentSummary.averageScore
        }
      };

      // Calculate percentages for lead sources
      const totalLeads = mockAnalyticsData.leadSources.reduce((sum, source) => sum + source.count, 0);
      mockAnalyticsData.leadSources = mockAnalyticsData.leadSources.map(source => ({
        ...source,
        percentage: totalLeads > 0 ? (source.count / totalLeads) * 100 : 0
      }));

      setAnalyticsData(mockAnalyticsData);

    } catch (error) {
      console.error('Failed to load analytics data:', error);
      toast({
        title: t('analytics.loadingFailed'),
        description: t('analytics.loadingFailedDescription'),
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRefreshData = async () => {
    await loadAnalyticsData();
    toast({
      title: t('analytics.refreshAnalytics'),
      description: t('analytics.refreshDescription')
    });
  };

  if (loading || !analyticsData) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold tracking-tight mb-2">{t('analytics.title')}</h1>
            <p className="text-muted-foreground">
              {t('analytics.description')}
            </p>
          </div>
          <div className="flex gap-2">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-[120px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={handleRefreshData}>
              <RefreshCw className="h-4 w-4 mr-2" />
              {t('common.refresh', 'Refresh')}
            </Button>
          </div>
        </div>

        {/* Overview Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('analytics.totalLeads')}</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analyticsData.overview.totalLeads}</div>
              <div className="flex items-center text-xs text-muted-foreground">
                <TrendingUp className="h-3 w-3 mr-1 text-green-600" />
                +{analyticsData.overview.weeklyGrowth}% this week
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('analytics.platformEnhanced')}</CardTitle>
              <Zap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analyticsData.overview.enrichedLeads}</div>
              <div className="flex items-center text-xs text-muted-foreground">
                <Badge variant="secondary" className="text-xs">
                  {analyticsData.enrichmentStats.enrichmentCoverage.toFixed(1)}% coverage
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('analytics.dataSources')}</CardTitle>
              <Database className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analyticsData.overview.platformSources}</div>
              <p className="text-xs text-muted-foreground">{t('analytics.connectedPlatforms', 'connected platforms')}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('analytics.conversionRate')}</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analyticsData.overview.conversionRate.toFixed(1)}%</div>
              <p className="text-xs text-muted-foreground">{t('analytics.visitorToLead', 'visitor to lead')}</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Analytics Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">{t('analytics.overview')}</TabsTrigger>
            <TabsTrigger value="platforms">{t('analytics.platforms')}</TabsTrigger>
            <TabsTrigger value="enrichment">{t('analytics.enrichment')}</TabsTrigger>
            <TabsTrigger value="platform-dashboard">{t('tabs.platformDashboard', 'Platform Dashboard')}</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              {/* Lead Sources */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChart className="h-5 w-5" />
                    {t('analytics.leadSources')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {analyticsData.leadSources.map((source, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">{source.source}</span>
                          {source.trend === 'up' && <TrendingUp className="h-3 w-3 text-green-600" />}
                          {source.trend === 'down' && <TrendingDown className="h-3 w-3 text-red-600" />}
                          {source.trend === 'stable' && <Activity className="h-3 w-3 text-gray-600" />}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {source.count} ({source.percentage.toFixed(1)}%)
                        </div>
                      </div>
                      <Progress value={source.percentage} className="h-2" />
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Platform Performance Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    {t('analytics.platformPerformance')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {analyticsData.platformPerformance.slice(0, 5).map((platform, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <div>
                        <span className="text-sm font-medium">{platform.platform}</span>
                        <div className="text-xs text-muted-foreground">
                          {t('analytics.score', 'Score')}: {platform.score}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium">{platform.leads} {t('analytics.leads', 'leads')}</div>
                        <div className={`text-xs flex items-center ${
                          platform.growth > 0 ? 'text-green-600' : platform.growth < 0 ? 'text-red-600' : 'text-gray-600'
                        }`}>
                          {platform.growth > 0 ? (
                            <TrendingUp className="h-3 w-3 mr-1" />
                          ) : platform.growth < 0 ? (
                            <TrendingDown className="h-3 w-3 mr-1" />
                          ) : (
                            <Activity className="h-3 w-3 mr-1" />
                          )}
                          {platform.growth > 0 ? '+' : ''}{platform.growth}%
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="platforms" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>{t('analytics.platformPerformanceDetails')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analyticsData.platformPerformance.map((platform, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex justify-between items-center mb-2">
                        <h3 className="font-medium">{platform.platform}</h3>
                        <Badge variant={platform.growth > 0 ? 'default' : platform.growth < 0 ? 'destructive' : 'secondary'}>
                          {platform.growth > 0 ? '+' : ''}{platform.growth}%
                        </Badge>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">{t('analytics.leads', 'Leads')}:</span>
                          <div className="font-medium">{platform.leads}</div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">{t('analytics.qualityScore', 'Quality Score')}:</span>
                          <div className="font-medium">{platform.score}/100</div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">{t('analytics.growth', 'Growth')}:</span>
                          <div className={`font-medium ${
                            platform.growth > 0 ? 'text-green-600' : platform.growth < 0 ? 'text-red-600' : 'text-gray-600'
                          }`}>
                            {platform.growth > 0 ? '+' : ''}{platform.growth}%
                          </div>
                        </div>
                      </div>
                      <div className="mt-2">
                        <Progress value={platform.score} className="h-2" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="enrichment" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    {t('analytics.enrichmentCoverage', 'Enrichment Coverage')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>{t('analytics.companiesEnriched', 'Companies Enriched')}</span>
                      <span>{analyticsData.enrichmentStats.enrichmentCoverage.toFixed(1)}%</span>
                    </div>
                    <Progress value={analyticsData.enrichmentStats.enrichmentCoverage} className="h-3" />
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">{t('analytics.totalCompanies', 'Total Companies')}:</span>
                      <div className="text-lg font-medium">{analyticsData.enrichmentStats.totalCompanies}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">{t('analytics.enriched', 'Enriched')}:</span>
                      <div className="text-lg font-medium">{analyticsData.enrichmentStats.enrichedCompanies}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    {t('analytics.enrichmentQuality')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold">{analyticsData.enrichmentStats.avgEnrichmentScore.toFixed(1)}</div>
                    <p className="text-sm text-muted-foreground">{t('analytics.averageEnrichmentScore', 'Average Enrichment Score')}</p>
                  </div>
                  <div className="space-y-2">
                    <Progress value={analyticsData.enrichmentStats.avgEnrichmentScore} className="h-3" />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{t('analytics.qualityPoor', 'Poor')}</span>
                      <span>{t('analytics.qualityGood', 'Good')}</span>
                      <span>{t('analytics.qualityExcellent', 'Excellent')}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="platform-dashboard" className="space-y-4">
            <PlatformDataDashboard />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Analytics;
