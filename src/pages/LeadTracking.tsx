import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { EnhancedLeadTracking } from '@/components/dashboard/EnhancedLeadTracking';
import { PlatformDataDashboard } from '@/components/dashboard/PlatformDataDashboard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Zap, Database, BarChart3, TrendingUp, Activity, Target } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useCustomerSettings } from '@/contexts/CustomerContext';
import { leadsApi } from '@/lib/api';
import { realVisitorTrackingService } from '@/services/realVisitorTrackingService';

const LeadTracking = () => {
  const { t } = useTranslation();
  const { integrations } = useCustomerSettings();
  const [activeTab, setActiveTab] = useState('enhanced');
  const [enrichmentSummary, setEnrichmentSummary] = useState<{
    totalCompanies: number;
    enrichedCompanies: number;
    averageScore: number;
  } | null>(null);

  useEffect(() => {
    loadEnrichmentSummary();
  }, []);

  const loadEnrichmentSummary = async () => {
    try {
      const summary = await leadsApi.getEnrichmentSummary();
      setEnrichmentSummary(summary);
    } catch (error) {
      console.error('Failed to load enrichment summary:', error);
    }
  };

  const getConnectedPlatformsCount = () => {
    return Object.values(integrations).filter(integration => integration.isConnected).length;
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold tracking-tight mb-2">
              {t('leadTracking.title', 'Lead Tracking')}
            </h1>
            <p className="text-muted-foreground">
              {t('leadTracking.description', 'Track and manage your leads with advanced platform integration')}
            </p>
          </div>
          <div className="flex gap-2">            <Badge variant="outline" className="flex items-center gap-1">
              <Database className="h-3 w-3" />
              {getConnectedPlatformsCount()} {t('leadTracking.platforms', 'Platforms')}
            </Badge>
            {enrichmentSummary && (
              <Badge variant="outline" className="flex items-center gap-1">
                <TrendingUp className="h-3 w-3" />
                {enrichmentSummary.enrichedCompanies}/{enrichmentSummary.totalCompanies} {t('leadTracking.enriched', 'Enriched')}
              </Badge>
            )}
          </div>
        </div>

        {/* Quick Stats */}
        {enrichmentSummary && (
          <div className="grid gap-4 md:grid-cols-4">            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t('leadTracking.totalCompanies')}</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>              <CardContent>
                <div className="text-2xl font-bold">{enrichmentSummary.totalCompanies}</div>
                <p className="text-xs text-muted-foreground">{t('leadTracking.inYourDatabase', 'in your database')}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t('leadTracking.platformEnhanced')}</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{enrichmentSummary.enrichedCompanies}</div>                <p className="text-xs text-muted-foreground">
                  {enrichmentSummary.totalCompanies > 0 
                    ? Math.round((enrichmentSummary.enrichedCompanies / enrichmentSummary.totalCompanies) * 100)
                    : 0
                  }% {t('leadTracking.coverage', 'coverage')}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t('leadTracking.averageScore')}</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{enrichmentSummary.averageScore.toFixed(1)}</div>
                <p className="text-xs text-muted-foreground">{t('leadTracking.enrichmentQuality')}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t('leadTracking.connectedSources')}</CardTitle>
                <Database className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{getConnectedPlatformsCount()}</div>
                <p className="text-xs text-muted-foreground">{t('leadTracking.activeIntegrations')}</p>
              </CardContent>
            </Card>
          </div>
        )}        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="enhanced" className="flex items-center gap-2">
              <Zap className="h-4 w-4" />
              {t('leadTracking.enhancedTracking')}
            </TabsTrigger>
            <TabsTrigger value="platform-data" className="flex items-center gap-2">
              <Database className="h-4 w-4" />
              {t('leadTracking.platformData')}
            </TabsTrigger>
            <TabsTrigger value="standard" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              {t('leadTracking.standardView')}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="enhanced" className="space-y-4">
            <EnhancedLeadTracking useEnrichedData={true} />
          </TabsContent>

          <TabsContent value="platform-data" className="space-y-4">
            <PlatformDataDashboard />
          </TabsContent>

          <TabsContent value="standard" className="space-y-4">
            <LegacyLeadTracking />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

// Legacy Lead Tracking Component (simplified version for comparison)
const LegacyLeadTracking = () => {
  const { t } = useTranslation();
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            {t('leadTracking.standardLeadTracking')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <Database className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">{t('leadTracking.standardLeadTracking')}</h3>            <p className="text-muted-foreground mb-4 max-w-md mx-auto">
              {t('leadTracking.standardTrackingDescription')}
            </p>            <Button variant="outline" onClick={() => window.location.reload()}>
              {t('common.refresh', 'Refresh Data')}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LeadTracking;
