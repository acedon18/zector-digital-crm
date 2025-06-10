import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { DashboardStats } from '@/components/dashboard/DashboardStats';
import { SalesPipeline } from '@/components/dashboard/SalesPipeline';
import { ActivityFeed } from '@/components/dashboard/ActivityFeed';
import { TopAgents } from '@/components/dashboard/TopAgents';
import { RevenueChart } from '@/components/dashboard/RevenueChart';
import { LiveVisitors } from '@/components/dashboard/LiveVisitors';
import { LeadScoring } from '@/components/dashboard/LeadScoring';
import { AILeadQualification } from '@/components/dashboard/AILeadQualification';
import { EmailAlertSystem } from '@/components/dashboard/EmailAlertSystem';
import { AdvancedExportSystem } from '@/components/dashboard/AdvancedExportSystem';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const Index = () => {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight mb-2">Lead Intelligence Dashboard</h1>
          <p className="text-muted-foreground">Välkommen tillbaka! Här är en översikt över din website traffic och leads idag.</p>
        </div>

        <DashboardStats />

        {/* Live Activity Section */}
        <LiveVisitors />

        {/* Enhanced Features Tabs */}
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="ai-qualification">AI Qualification</TabsTrigger>
            <TabsTrigger value="email-alerts">Email Alerts</TabsTrigger>
            <TabsTrigger value="data-export">Data Export</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="col-span-2">
                <RevenueChart />
              </div>
              <div className="col-span-1">
                <TopAgents />
              </div>
            </div>

            {/* Lead Scoring Section */}
            <LeadScoring />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="col-span-1">
                <SalesPipeline />
              </div>
              <div className="col-span-1 lg:col-span-2">
                <ActivityFeed />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="ai-qualification">
            <AILeadQualification />
          </TabsContent>

          <TabsContent value="email-alerts">
            <EmailAlertSystem />
          </TabsContent>

          <TabsContent value="data-export">
            <AdvancedExportSystem />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Index;
