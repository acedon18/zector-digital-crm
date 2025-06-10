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
import { Settings as SettingsIcon, Shield, Code, Bell, User, Globe } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

const Settings = () => {
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
      title: 'Profil uppdaterad',
      description: 'Dina profilinställningar har sparats'
    });
  };

  const handleSaveTracking = () => {
    toast({
      title: 'Tracking-inställningar uppdaterade',
      description: 'Dina spårningsinställningar har sparats'
    });
  };

  const handleSaveNotifications = () => {
    toast({
      title: 'Notifieringar uppdaterade',
      description: 'Dina notifieringsinställningar har sparats'
    });
  };

  const handleSaveIntegrations = () => {
    toast({
      title: 'Integrationer uppdaterade',
      description: 'Dina integrationsinställningar har sparats'
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight mb-2">Inställningar</h1>
          <p className="text-muted-foreground">
            Hantera dina konto-, tracking- och integrationsinställningar
          </p>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Profil
            </TabsTrigger>
            <TabsTrigger value="tracking" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Tracking
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              Notifieringar
            </TabsTrigger>
            <TabsTrigger value="integrations" className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              Integrationer
            </TabsTrigger>
            <TabsTrigger value="script" className="flex items-center gap-2">
              <Code className="h-4 w-4" />
              Script
            </TabsTrigger>
          </TabsList>

          {/* Profile Settings */}
          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Profilinställningar
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="companyName">Företagsnamn</Label>
                    <Input
                      id="companyName"
                      value={profileSettings.companyName}
                      onChange={(e) => setProfileSettings(prev => ({ ...prev, companyName: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">E-postadress</Label>
                    <Input
                      id="email"
                      type="email"
                      value={profileSettings.email}
                      onChange={(e) => setProfileSettings(prev => ({ ...prev, email: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="domain">Domän</Label>
                    <Input
                      id="domain"
                      value={profileSettings.domain}
                      onChange={(e) => setProfileSettings(prev => ({ ...prev, domain: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="timezone">Tidszon</Label>
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
                <Button onClick={handleSaveProfile}>Spara profil</Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tracking Settings */}
          <TabsContent value="tracking">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Tracking & GDPR-inställningar
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Aktivera spårning</Label>
                      <p className="text-sm text-muted-foreground">Tillåt spårning av besökare på din webbplats</p>
                    </div>
                    <Switch
                      checked={trackingSettings.enableTracking}
                      onCheckedChange={(checked) => setTrackingSettings(prev => ({ ...prev, enableTracking: checked }))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>GDPR-kompatibelt läge</Label>
                      <p className="text-sm text-muted-foreground">Följ EU:s dataskyddsförordning</p>
                    </div>
                    <Switch
                      checked={trackingSettings.gdprCompliant}
                      onCheckedChange={(checked) => setTrackingSettings(prev => ({ ...prev, gdprCompliant: checked }))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Anonymisera IP-adresser</Label>
                      <p className="text-sm text-muted-foreground">Anonymisera besökarnas IP-adresser</p>
                    </div>
                    <Switch
                      checked={trackingSettings.anonymizeIp}
                      onCheckedChange={(checked) => setTrackingSettings(prev => ({ ...prev, anonymizeIp: checked }))}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="sessionTimeout">Session timeout (minuter)</Label>
                      <Input
                        id="sessionTimeout"
                        type="number"
                        value={trackingSettings.sessionTimeout}
                        onChange={(e) => setTrackingSettings(prev => ({ ...prev, sessionTimeout: parseInt(e.target.value) }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="dataRetention">Databevarande (dagar)</Label>
                      <Input
                        id="dataRetention"
                        type="number"
                        value={trackingSettings.dataRetention}
                        onChange={(e) => setTrackingSettings(prev => ({ ...prev, dataRetention: parseInt(e.target.value) }))}
                      />
                    </div>
                  </div>
                </div>
                <Button onClick={handleSaveTracking}>Spara tracking-inställningar</Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notification Settings */}
          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Notifieringsinställningar
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>E-postaviseringar</Label>
                      <p className="text-sm text-muted-foreground">Få e-post vid viktiga händelser</p>
                    </div>
                    <Switch
                      checked={notificationSettings.emailAlerts}
                      onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, emailAlerts: checked }))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Heta lead-aviseringar</Label>
                      <p className="text-sm text-muted-foreground">Notifiering när ett hot lead identifieras</p>
                    </div>
                    <Switch
                      checked={notificationSettings.hotLeadAlerts}
                      onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, hotLeadAlerts: checked }))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Veckorapporter</Label>
                      <p className="text-sm text-muted-foreground">Få veckovisa sammanfattningar via e-post</p>
                    </div>
                    <Switch
                      checked={notificationSettings.weeklyReports}
                      onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, weeklyReports: checked }))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Realtidsnotifieringar</Label>
                      <p className="text-sm text-muted-foreground">Push-notifieringar i realtid</p>
                    </div>
                    <Switch
                      checked={notificationSettings.realTimeNotifications}
                      onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, realTimeNotifications: checked }))}
                    />
                  </div>
                </div>
                <Button onClick={handleSaveNotifications}>Spara notifieringar</Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Integration Settings */}
          <TabsContent value="integrations">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  CRM & Export-integrationer
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="hubspotApiKey">HubSpot API-nyckel</Label>
                    <Input
                      id="hubspotApiKey"
                      type="password"
                      value={integrationSettings.hubspotApiKey}
                      onChange={(e) => setIntegrationSettings(prev => ({ ...prev, hubspotApiKey: e.target.value }))}
                      placeholder="Ange din HubSpot API-nyckel"
                    />
                  </div>

                  <div>
                    <Label htmlFor="pipedriveApiKey">Pipedrive API-nyckel</Label>
                    <Input
                      id="pipedriveApiKey"
                      type="password"
                      value={integrationSettings.pipedriveApiKey}
                      onChange={(e) => setIntegrationSettings(prev => ({ ...prev, pipedriveApiKey: e.target.value }))}
                      placeholder="Ange din Pipedrive API-nyckel"
                    />
                  </div>

                  <div>
                    <Label htmlFor="webhookUrl">Webhook URL</Label>
                    <Input
                      id="webhookUrl"
                      value={integrationSettings.webhookUrl}
                      onChange={(e) => setIntegrationSettings(prev => ({ ...prev, webhookUrl: e.target.value }))}
                      placeholder="https://exempel.se/webhook"
                    />
                    <p className="text-sm text-muted-foreground mt-1">
                      URL för att skicka lead-data till dina egna system
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="exportFormat">Standard exportformat</Label>
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
                <Button onClick={handleSaveIntegrations}>Spara integrationer</Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Script Generator */}
          <TabsContent value="script">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Code className="h-5 w-5" />
                  Tracking Script
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
