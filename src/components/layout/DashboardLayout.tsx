import { useState } from 'react';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { DashboardFooter } from './DashboardFooter';
import { ThemeProvider } from '@/hooks/useTheme';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useTranslation } from 'react-i18next';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const { t } = useTranslation();

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const openSettings = () => setSettingsOpen(true);
  const closeSettings = () => setSettingsOpen(false);

  return (
    <ThemeProvider>
      <div className="h-screen flex flex-col">
        <Header toggleSidebar={toggleSidebar} openSettings={openSettings} />

        <div className="flex flex-1 overflow-hidden">
          <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />

          <main className="flex-1 overflow-auto p-4 md:p-6">{children}</main>
        </div>

        <DashboardFooter />

        {/* Settings Modal */}
        <Dialog open={settingsOpen} onOpenChange={closeSettings}>
          <DialogContent className="sm:max-w-md">
            <h2 className="text-lg font-semibold mb-4">{t('dashboardLayout.dashboardSettings', 'Dashboard Settings')}</h2>

            <Tabs defaultValue="general">
              <TabsList className="w-full mb-4">
                <TabsTrigger value="general" className="flex-1">
                  {t('dashboardLayout.general', 'General')}
                </TabsTrigger>
                <TabsTrigger value="notifications" className="flex-1">
                  {t('dashboardLayout.notifications', 'Notifications')}
                </TabsTrigger>
                <TabsTrigger value="advanced" className="flex-1">
                  {t('dashboardLayout.advanced', 'Advanced')}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="general" className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="compact-mode">{t('dashboardLayout.compactMode', 'Compact Mode')}</Label>
                    <p className="text-sm text-muted-foreground">{t('dashboardLayout.compactModeDesc', 'Reduce the size of UI elements')}</p>
                  </div>
                  <Switch id="compact-mode" />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="show-avatars">{t('dashboardLayout.showAvatars', 'Show Avatars')}</Label>
                    <p className="text-sm text-muted-foreground">{t('dashboardLayout.showAvatarsDesc', 'Display user avatars in lists')}</p>
                  </div>
                  <Switch id="show-avatars" defaultChecked />
                </div>
              </TabsContent>

              <TabsContent value="notifications" className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="email-notifs">{t('dashboardLayout.emailNotifications', 'Email Notifications')}</Label>
                    <p className="text-sm text-muted-foreground">{t('dashboardLayout.emailNotificationsDesc', 'Receive email notifications')}</p>
                  </div>
                  <Switch id="email-notifs" defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="push-notifs">{t('dashboardLayout.pushNotifications', 'Push Notifications')}</Label>
                    <p className="text-sm text-muted-foreground">{t('dashboardLayout.pushNotificationsDesc', 'Receive push notifications')}</p>
                  </div>
                  <Switch id="push-notifs" defaultChecked />
                </div>
              </TabsContent>

              <TabsContent value="advanced" className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="analytics">{t('dashboardLayout.analyticsTracking', 'Analytics Tracking')}</Label>
                    <p className="text-sm text-muted-foreground">{t('dashboardLayout.analyticsDescription', 'Allow anonymous usage data collection')}</p>
                  </div>
                  <Switch id="analytics" />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="auto-refresh">{t('dashboardLayout.autoRefresh', 'Auto Refresh')}</Label>
                    <p className="text-sm text-muted-foreground">{t('dashboardLayout.autoRefreshDescription', 'Automatically refresh dashboard data')}</p>
                  </div>
                  <Switch id="auto-refresh" defaultChecked />
                </div>
              </TabsContent>
            </Tabs>
          </DialogContent>
        </Dialog>
      </div>
    </ThemeProvider>
  );
}
