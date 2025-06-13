import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Settings, 
  Plus, 
  Link, 
  Unlink, 
  CheckCircle, 
  XCircle, 
  RefreshCw,
  AlertTriangle,
  Trash2,
  Edit,
  BarChart3
} from 'lucide-react';
import { useCustomerSettings } from '@/contexts/CustomerContext';
import { PLATFORM_CONFIGS, PLATFORM_CATEGORIES } from '@/lib/platformConfigs';
import { PlatformCredentials, PlatformType, PlatformField } from '@/types/integrations';
import { toast } from '@/components/ui/use-toast';
import { PlatformDataDashboard } from './PlatformDataDashboard';
import { platformApiService } from '@/services/platformApiService';
import { leadsApi } from '@/lib/api';

export const PlatformIntegrations: React.FC = () => {
  const { t } = useTranslation();
  const { integrations, updateIntegration, removeIntegration } = useCustomerSettings();
  const [selectedPlatform, setSelectedPlatform] = useState<PlatformType | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [showConnectionDialog, setShowConnectionDialog] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const handleConnect = async (platform: PlatformType) => {
    setIsConnecting(true);
    try {
      // Test connection first
      const testResult = await platformApiService.testConnection(platform, formData);
      
      if (!testResult.success) {
        throw new Error(testResult.message);
      }

      // Simulate API connection - in real implementation, save to backend
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const newIntegration: PlatformCredentials = {
        id: `${platform}_${Date.now()}`,
        platform: platform,
        credentials: formData,
        isActive: true,
        lastSync: new Date(),
        syncStatus: 'connected'
      };

      updateIntegration(newIntegration);
      
      // Trigger initial sync
      try {
        await leadsApi.syncPlatform(platform);
        toast({
          title: t('integrations.connectionSuccess'),
          description: t('integrations.platformConnected', { platform: PLATFORM_CONFIGS[platform].name })
        });
      } catch (syncError) {
        console.warn('Initial sync failed, but connection successful:', syncError);
        toast({
          title: t('integrations.connectionSuccess'),
          description: `${PLATFORM_CONFIGS[platform].name} connected. Initial sync will be attempted later.`,
        });
      }
      
      setShowConnectionDialog(false);
      setFormData({});
    } catch (error) {
      toast({
        title: t('common.error'),
        description: error instanceof Error ? error.message : t('integrations.connectionFailed'),
        variant: 'destructive'
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = (integrationId: string, platformName: string) => {
    removeIntegration(integrationId);
    toast({
      title: t('integrations.disconnected'),
      description: t('integrations.platformDisconnected', { platform: platformName })
    });
  };

  const handleSync = async (integration: PlatformCredentials) => {
    const updatedIntegration = {
      ...integration,
      syncStatus: 'syncing' as const,
      lastSync: new Date()
    };
    
    updateIntegration(updatedIntegration);
    
    try {
      // Trigger real platform sync
      const result = await leadsApi.syncPlatform(integration.platform);
      
      if (result.success) {
        updateIntegration({
          ...updatedIntegration,
          syncStatus: 'connected' as const,
          lastSync: new Date()
        });
        toast({
          title: t('integrations.syncComplete'),
          description: t('integrations.dataSynced', { platform: PLATFORM_CONFIGS[integration.platform].name })
        });
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      updateIntegration({
        ...updatedIntegration,
        syncStatus: 'error' as const,
        errorMessage: error instanceof Error ? error.message : 'Sync failed'
      });
      toast({
        title: t('integrations.syncFailed'),
        description: error instanceof Error ? error.message : t('integrations.syncError'),
        variant: 'destructive'
      });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'syncing': return <RefreshCw className="h-4 w-4 text-blue-600 animate-spin" />;
      case 'error': return <XCircle className="h-4 w-4 text-red-600" />;
      default: return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return 'bg-green-100 text-green-800 border-green-200';
      case 'syncing': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'error': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    }
  };

  const filteredPlatforms = Object.values(PLATFORM_CONFIGS).filter(platform => 
    selectedCategory === 'all' || platform.category === selectedCategory
  );

  const connectedPlatforms = integrations.filter(i => i.isActive);
  const availablePlatforms = filteredPlatforms.filter(platform => 
    !integrations.some(i => i.platform === platform.id && i.isActive)
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold">{t('integrations.title')}</h2>
          <p className="text-sm text-muted-foreground">
            {t('integrations.description')}
          </p>
        </div>
      </div>

      <Tabs defaultValue="platforms" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="platforms" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Platform Setup
          </TabsTrigger>
          <TabsTrigger value="dashboard" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Data Dashboard
          </TabsTrigger>
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
            Overview
          </TabsTrigger>
        </TabsList>

        <TabsContent value="platforms" className="space-y-6">
          {/* Platform Setup Content */}
          <div className="flex justify-end">
            <Dialog open={showConnectionDialog} onOpenChange={setShowConnectionDialog}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  {t('integrations.addPlatform')}
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>{t('integrations.connectPlatform')}</DialogTitle>
                </DialogHeader>
                <Tabs defaultValue="all" className="w-full">
                  <TabsList className="grid grid-cols-5 w-full">
                    <TabsTrigger value="all">{t('common.all')}</TabsTrigger>
                    <TabsTrigger value="analytics">{t('integrations.analytics')}</TabsTrigger>
                    <TabsTrigger value="advertising">{t('integrations.advertising')}</TabsTrigger>
                    <TabsTrigger value="crm">{t('integrations.crm')}</TabsTrigger>
                    <TabsTrigger value="tracking">{t('integrations.tracking')}</TabsTrigger>
                  </TabsList>
                  
                  {Object.entries(PLATFORM_CATEGORIES).map(([category, config]) => (
                    <TabsContent key={category} value={category} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {filteredPlatforms
                          .filter(p => p.category === category)
                          .map(platform => (
                            <Card 
                              key={platform.id} 
                              className={`cursor-pointer hover:shadow-md transition-shadow ${
                                selectedPlatform === platform.id ? 'ring-2 ring-primary' : ''
                              }`}
                              onClick={() => setSelectedPlatform(platform.id)}
                            >
                              <CardContent className="p-4">
                                <div className="flex items-start gap-3">
                                  <div className="text-2xl">{platform.icon}</div>
                                  <div className="flex-1">
                                    <h3 className="font-medium">{platform.name}</h3>
                                    <p className="text-sm text-muted-foreground">{platform.description}</p>
                                    <div className="flex flex-wrap gap-1 mt-2">
                                      {platform.features.slice(0, 3).map(feature => (
                                        <Badge key={feature} variant="outline" className="text-xs">
                                          {feature}
                                        </Badge>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                      </div>
                    </TabsContent>
                  ))}

                  <TabsContent value="all" className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {availablePlatforms.map(platform => (
                        <Card 
                          key={platform.id} 
                          className={`cursor-pointer hover:shadow-md transition-shadow ${
                            selectedPlatform === platform.id ? 'ring-2 ring-primary' : ''
                          }`}
                          onClick={() => setSelectedPlatform(platform.id)}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-start gap-3">
                              <div className="text-2xl">{platform.icon}</div>
                              <div className="flex-1">
                                <h3 className="font-medium">{platform.name}</h3>
                                <p className="text-sm text-muted-foreground">{platform.description}</p>
                                <div className="flex flex-wrap gap-1 mt-2">
                                  {platform.features.slice(0, 3).map(feature => (
                                    <Badge key={feature} variant="outline" className="text-xs">
                                      {feature}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </TabsContent>
                </Tabs>

                {selectedPlatform && (
                  <div className="mt-6 p-4 border rounded-lg">
                    <h3 className="font-medium mb-4">
                      {t('integrations.setupInstructions', { platform: PLATFORM_CONFIGS[selectedPlatform].name })}
                    </h3>
                    <div className="space-y-4">
                      {PLATFORM_CONFIGS[selectedPlatform].requiredFields.map((field: PlatformField) => (
                        <div key={field.key}>
                          <Label htmlFor={field.key}>{field.label}</Label>
                          <Input
                            id={field.key}
                            type={field.type === 'password' ? 'password' : 'text'}
                            placeholder={field.placeholder}
                            value={formData[field.key] || ''}
                            onChange={(e) => setFormData(prev => ({ ...prev, [field.key]: e.target.value }))}
                          />
                          {field.helpText && (
                            <p className="text-xs text-muted-foreground mt-1">{field.helpText}</p>
                          )}
                        </div>
                      ))}
                      <Button 
                        onClick={() => handleConnect(selectedPlatform)}
                        disabled={isConnecting}
                        className="w-full"
                      >
                        {isConnecting ? (
                          <>
                            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                            {t('integrations.connecting')}
                          </>
                        ) : (
                          <>
                            <Link className="h-4 w-4 mr-2" />
                            {t('integrations.connect')}
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                )}
              </DialogContent>
            </Dialog>
          </div>

          {/* Connected Platforms */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                {t('integrations.connectedPlatforms')} ({connectedPlatforms.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {connectedPlatforms.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-muted-foreground mb-4">
                    {t('integrations.noPlatformsConnected')}
                  </div>
                  <Button 
                    variant="outline" 
                    onClick={() => setShowConnectionDialog(true)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    {t('integrations.connectFirst')}
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {connectedPlatforms.map(integration => {
                    const platform = PLATFORM_CONFIGS[integration.platform];
                    return (
                      <div key={integration.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-4">
                          <div className="text-2xl">{platform.icon}</div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-medium">{platform.name}</h3>
                              <Badge className={getStatusColor(integration.syncStatus)}>
                                {getStatusIcon(integration.syncStatus)}
                                <span className="ml-1">{t(`integrations.status.${integration.syncStatus}`)}</span>
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {t('integrations.lastSync')}: {integration.lastSync?.toLocaleString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Switch 
                            checked={integration.isActive}
                            onCheckedChange={(checked) => updateIntegration({ ...integration, isActive: checked })}
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleSync(integration)}
                            disabled={integration.syncStatus === 'syncing'}
                          >
                            <RefreshCw className={`h-4 w-4 mr-1 ${integration.syncStatus === 'syncing' ? 'animate-spin' : ''}`} />
                            {t('integrations.sync')}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDisconnect(integration.id, platform.name)}
                          >
                            <Unlink className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{t('integrations.totalConnections')}</p>
                    <p className="text-2xl font-bold">{connectedPlatforms.length}</p>
                  </div>
                  <Link className="h-8 w-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{t('integrations.activeSync')}</p>
                    <p className="text-2xl font-bold">{connectedPlatforms.filter(i => i.syncStatus === 'connected').length}</p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{t('integrations.dataPoints')}</p>
                    <p className="text-2xl font-bold">2.4K</p>
                  </div>
                  <RefreshCw className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{t('integrations.lastUpdate')}</p>
                    <p className="text-2xl font-bold">2m</p>
                  </div>
                  <RefreshCw className="h-8 w-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="dashboard" className="space-y-6">
          <PlatformDataDashboard />
        </TabsContent>

        <TabsContent value="overview" className="space-y-6">
          {/* Overview Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{t('integrations.totalConnections')}</p>
                    <p className="text-2xl font-bold">{connectedPlatforms.length}</p>
                  </div>
                  <Link className="h-8 w-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{t('integrations.activeSync')}</p>
                    <p className="text-2xl font-bold">{connectedPlatforms.filter(i => i.syncStatus === 'connected').length}</p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{t('integrations.dataPoints')}</p>
                    <p className="text-2xl font-bold">2.4K</p>
                  </div>
                  <RefreshCw className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{t('integrations.lastUpdate')}</p>
                    <p className="text-2xl font-bold">2m</p>
                  </div>
                  <RefreshCw className="h-8 w-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
