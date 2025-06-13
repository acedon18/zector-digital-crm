import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { TrackingScriptGenerator } from '@/components/dashboard/TrackingScriptGenerator';
import { PlatformIntegrations } from '@/components/dashboard/PlatformIntegrations';
import { BrandingSettings } from '@/components/dashboard/BrandingSettings';
import { WhiteLabelManagement } from '@/components/dashboard/WhiteLabelManagement';
import { PlatformManagementSettings } from '@/components/dashboard/PlatformManagementSettings';
import { Settings as SettingsIcon, Shield, Code, Bell, User, Globe, Link, Palette, Database, Building2 } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { useTranslation } from 'react-i18next';

const Settings = () => {
  const { t } = useTranslation();
  const [profileSettings, setProfileSettings] = useState({
    companyName: 'TechCorp AB',
    email: 'admin@techcorp.se',
    domain: 'techcorp.se',
    timezone: 'Europe/Stockholm',
    language: 'sv'
  });

  const [trackingSettings, setTrackingSettings] = useState({
    enableTracking: true,
    gdprCompliant: true,
    anonymizeIp: true,
    sessionTimeout: 30,
    dataRetention: 365
  });

  const [notificationSettings, setNotificationSettings] = useState({
    emailAlerts: true,
    hotLeadAlerts: true,
    weeklyReports: true,
    realTimeNotifications: false
  });

  const [integrationSettings, setIntegrationSettings] = useState({
    hubspotApiKey: '',
    pipedriveApiKey: '',
    webhookUrl: '',
    exportFormat: 'csv'
  });

  const handleSaveProfile = () => {
    toast({
      title: t('toast.profileUpdated'),
      description: t('toast.profileDescription')
    });
  };

  const handleSaveTracking = () => {
    toast({
      title: t('toast.trackingUpdated'),
      description: t('toast.trackingDescription')
    });
  };

  const handleSaveNotifications = () => {
    toast({
      title: t('toast.notificationsUpdated'),
      description: t('toast.notificationsDescription')
    });
  };

  const handleSaveIntegrations = () => {
    toast({
      title: t('toast.integrationsUpdated'),
      description: t('toast.integrationsDescription')
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight mb-2">{t('settings.title')}</h1>
          <p className="text-muted-foreground">
            {t('settings.description')}
          </p>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-8">
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              {t('tabs.profile')}
            </TabsTrigger>
            <TabsTrigger value="branding" className="flex items-center gap-2">
              <Palette className="h-4 w-4" />
              {t('tabs.branding')}
            </TabsTrigger>
            <TabsTrigger value="white-label" className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              {t('tabs.whiteLabelManagement')}
            </TabsTrigger>
            <TabsTrigger value="platforms" className="flex items-center gap-2">
              <Link className="h-4 w-4" />
              {t('tabs.platforms')}
            </TabsTrigger>
            <TabsTrigger value="platform-management" className="flex items-center gap-2">
              <Database className="h-4 w-4" />
              {t('tabs.platformManagement')}
            </TabsTrigger>
            <TabsTrigger value="tracking" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              {t('tabs.tracking')}
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              {t('tabs.notifications')}
            </TabsTrigger>
            <TabsTrigger value="integrations" className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              {t('tabs.integrations')}
            </TabsTrigger>
            <TabsTrigger value="script" className="flex items-center gap-2">
              <Code className="h-4 w-4" />
              {t('tabs.script')}
            </TabsTrigger>
          </TabsList>

          {/* Profile Settings */}
          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  {t('settings.profileSettings')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="companyName">{t('labels.companyName')}</Label>
                    <Input
                      id="companyName"
                      value={profileSettings.companyName}
                      onChange={(e) => setProfileSettings(prev => ({ ...prev, companyName: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">{t('settings.emailAddress')}</Label>
                    <Input
                      id="email"
                      type="email"
                      value={profileSettings.email}
                      onChange={(e) => setProfileSettings(prev => ({ ...prev, email: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="domain">{t('settings.domain')}</Label>
                    <Input
                      id="domain"
                      value={profileSettings.domain}
                      onChange={(e) => setProfileSettings(prev => ({ ...prev, domain: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="timezone">{t('settings.timezone')}</Label>
                    <Select value={profileSettings.timezone} onValueChange={(value) => setProfileSettings(prev => ({ ...prev, timezone: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Europe/Stockholm">Europa/Stockholm</SelectItem>
                        <SelectItem value="Europe/London">Europa/London</SelectItem>
                        <SelectItem value="America/New_York">Amerika/New York</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button onClick={handleSaveProfile}>{t('buttons.saveProfile')}</Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Branding Settings */}
          <TabsContent value="branding">
            <BrandingSettings />
          </TabsContent>

          {/* White-Label Management */}
          <TabsContent value="white-label">
            <WhiteLabelManagement />
          </TabsContent>

          {/* Platform Integrations */}
          <TabsContent value="platforms">
            <PlatformIntegrations />
          </TabsContent>

          {/* Platform Management */}
          <TabsContent value="platform-management">
            <PlatformManagementSettings />
          </TabsContent>

          {/* Tracking Settings */}
          <TabsContent value="tracking">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  {t('settings.trackingSettings')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>{t('settings.enableTracking')}</Label>
                      <p className="text-sm text-muted-foreground">{t('settings.trackingDescription')}</p>
                    </div>
                    <Switch
                      checked={trackingSettings.enableTracking}
                      onCheckedChange={(checked) => setTrackingSettings(prev => ({ ...prev, enableTracking: checked }))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>{t('settings.gdprCompliant')}</Label>
                      <p className="text-sm text-muted-foreground">{t('settings.gdprDescription')}</p>
                    </div>
                    <Switch
                      checked={trackingSettings.gdprCompliant}
                      onCheckedChange={(checked) => setTrackingSettings(prev => ({ ...prev, gdprCompliant: checked }))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>{t('settings.anonymizeIp')}</Label>
                      <p className="text-sm text-muted-foreground">{t('settings.ipDescription')}</p>
                    </div>
                    <Switch
                      checked={trackingSettings.anonymizeIp}
                      onCheckedChange={(checked) => setTrackingSettings(prev => ({ ...prev, anonymizeIp: checked }))}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="sessionTimeout">{t('settings.sessionTimeout')}</Label>
                      <Input
                        id="sessionTimeout"
                        type="number"
                        value={trackingSettings.sessionTimeout}
                        onChange={(e) => setTrackingSettings(prev => ({ ...prev, sessionTimeout: parseInt(e.target.value) }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="dataRetention">{t('settings.dataRetention')}</Label>
                      <Input
                        id="dataRetention"
                        type="number"
                        value={trackingSettings.dataRetention}
                        onChange={(e) => setTrackingSettings(prev => ({ ...prev, dataRetention: parseInt(e.target.value) }))}
                      />
                    </div>
                  </div>
                </div>
                <Button onClick={handleSaveTracking}>{t('buttons.saveTrackingSettings')}</Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notification Settings */}
          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  {t('settings.notificationSettings')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>{t('settings.emailAlerts')}</Label>
                      <p className="text-sm text-muted-foreground">{t('settings.emailAlertsDescription')}</p>
                    </div>
                    <Switch
                      checked={notificationSettings.emailAlerts}
                      onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, emailAlerts: checked }))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>{t('settings.hotLeadAlerts')}</Label>
                      <p className="text-sm text-muted-foreground">{t('settings.hotLeadAlertsDescription')}</p>
                    </div>
                    <Switch
                      checked={notificationSettings.hotLeadAlerts}
                      onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, hotLeadAlerts: checked }))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>{t('settings.weeklyReports')}</Label>
                      <p className="text-sm text-muted-foreground">{t('settings.weeklyReportsDescription')}</p>
                    </div>
                    <Switch
                      checked={notificationSettings.weeklyReports}
                      onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, weeklyReports: checked }))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>{t('settings.realTimeNotifications')}</Label>
                      <p className="text-sm text-muted-foreground">{t('settings.realTimeNotificationsDescription')}</p>
                    </div>
                    <Switch
                      checked={notificationSettings.realTimeNotifications}
                      onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, realTimeNotifications: checked }))}
                    />
                  </div>
                </div>
                <Button onClick={handleSaveNotifications}>{t('buttons.saveNotifications')}</Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Integration Settings */}
          <TabsContent value="integrations">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  {t('tabs.integrations')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="hubspotApiKey">{t('settings.hubspotApiKey')}</Label>
                    <Input
                      id="hubspotApiKey"
                      type="password"
                      value={integrationSettings.hubspotApiKey}
                      onChange={(e) => setIntegrationSettings(prev => ({ ...prev, hubspotApiKey: e.target.value }))}
                      placeholder={t('placeholders.enterHubspotKey')}
                    />
                  </div>

                  <div>
                    <Label htmlFor="pipedriveApiKey">{t('settings.pipedriveApiKey')}</Label>
                    <Input
                      id="pipedriveApiKey"
                      type="password"
                      value={integrationSettings.pipedriveApiKey}
                      onChange={(e) => setIntegrationSettings(prev => ({ ...prev, pipedriveApiKey: e.target.value }))}
                      placeholder={t('placeholders.enterPipedriveKey')}
                    />
                  </div>

                  <div>
                    <Label htmlFor="webhookUrl">{t('settings.webhookUrl')}</Label>
                    <Input
                      id="webhookUrl"
                      value={integrationSettings.webhookUrl}
                      onChange={(e) => setIntegrationSettings(prev => ({ ...prev, webhookUrl: e.target.value }))}
                      placeholder={t('placeholders.enterWebhookUrl')}
                    />
                    <p className="text-sm text-muted-foreground mt-1">
                      {t('settings.webhookDescription')}
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="exportFormat">{t('settings.exportFormat')}</Label>
                    <Select value={integrationSettings.exportFormat} onValueChange={(value) => setIntegrationSettings(prev => ({ ...prev, exportFormat: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="csv">CSV</SelectItem>
                        <SelectItem value="xlsx">Excel (XLSX)</SelectItem>
                        <SelectItem value="json">JSON</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button onClick={handleSaveIntegrations}>{t('buttons.saveIntegrations')}</Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Script Generator */}
          <TabsContent value="script">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Code className="h-5 w-5" />
                  {t('trackingScript.title')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <TrackingScriptGenerator />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Settings;
