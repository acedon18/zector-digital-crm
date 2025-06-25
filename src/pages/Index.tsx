import { Suspense, lazy } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { DashboardStats } from '@/components/dashboard/DashboardStats';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useTranslation } from 'react-i18next';
import { LoadingSpinner } from '@/components/ui/loading';

// Lazy load heavy dashboard components
const SalesPipeline = lazy(() => import('@/components/dashboard/SalesPipeline').then(m => ({ default: m.SalesPipeline })));
const ActivityFeed = lazy(() => import('@/components/dashboard/ActivityFeed').then(m => ({ default: m.ActivityFeed })));
const TopAgents = lazy(() => import('@/components/dashboard/TopAgents').then(m => ({ default: m.TopAgents })));
const RevenueChart = lazy(() => import('@/components/dashboard/RevenueChart').then(m => ({ default: m.RevenueChart })));
const LiveVisitors = lazy(() => import('@/components/dashboard/LiveVisitorsFixed').then(m => ({ default: m.LiveVisitorsFixed })));
const LeadScoring = lazy(() => import('@/components/dashboard/LeadScoring').then(m => ({ default: m.LeadScoring })));
const AILeadQualification = lazy(() => import('@/components/dashboard/AILeadQualification').then(m => ({ default: m.AILeadQualification })));
const EmailAlertSystem = lazy(() => import('@/components/dashboard/EmailAlertSystem').then(m => ({ default: m.EmailAlertSystem })));
const AdvancedExportSystem = lazy(() => import('@/components/dashboard/AdvancedExportSystem').then(m => ({ default: m.AdvancedExportSystem })));

const Index = () => {
  const { t } = useTranslation();

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight mb-2">{t('dashboard.leadIntelligenceTitle')}</h1>
          <p className="text-muted-foreground">{t('dashboard.welcomeMessage')}</p>
        </div>

        <DashboardStats />

        {/* Live Activity Section */}
        <Suspense fallback={<LoadingSpinner />}>
          <LiveVisitors />
        </Suspense>

        {/* Enhanced Features Tabs */}
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">{t('tabs.overview')}</TabsTrigger>
            <TabsTrigger value="ai-qualification">{t('tabs.aiQualification')}</TabsTrigger>
            <TabsTrigger value="email-alerts">{t('tabs.emailAlerts')}</TabsTrigger>
            <TabsTrigger value="data-export">{t('tabs.dataExport')}</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="col-span-2">
                <Suspense fallback={<LoadingSpinner />}>
                  <RevenueChart />
                </Suspense>
              </div>
              <div className="col-span-1">
                <Suspense fallback={<LoadingSpinner />}>
                  <TopAgents />
                </Suspense>
              </div>
            </div>

            {/* Lead Scoring Section */}
            <Suspense fallback={<LoadingSpinner />}>
              <LeadScoring />
            </Suspense>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="col-span-1">
                <Suspense fallback={<LoadingSpinner />}>
                  <SalesPipeline />
                </Suspense>
              </div>
              <div className="col-span-1 lg:col-span-2">
                <Suspense fallback={<LoadingSpinner />}>
                  <ActivityFeed />
                </Suspense>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="ai-qualification">
            <Suspense fallback={<LoadingSpinner />}>
              <AILeadQualification />
            </Suspense>
          </TabsContent>

          <TabsContent value="email-alerts">
            <Suspense fallback={<LoadingSpinner />}>
              <EmailAlertSystem />
            </Suspense>
          </TabsContent>

          <TabsContent value="data-export">
            <Suspense fallback={<LoadingSpinner />}>
              <AdvancedExportSystem />
            </Suspense>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Index;
