import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Download, Upload, Settings, CheckCircle, AlertCircle, Zap, Database } from 'lucide-react';
import { Company } from '@/types/leads';
import { leadsApi } from '@/lib/api';
import { toast } from '@/components/ui/use-toast';

interface CRMIntegration {
  id: string;
  name: string;
  logo: string;
  isConnected: boolean;
  lastSync?: Date;
  totalExported: number;
  status: 'connected' | 'disconnected' | 'error' | 'syncing';
}

interface ExportConfig {
  format: 'csv' | 'excel' | 'json' | 'hubspot' | 'salesforce' | 'pipedrive';
  fields: string[];
  filters: {
    minScore?: number;
    status?: string[];
    industry?: string[];
    dateRange?: {
      from: Date;
      to: Date;
    };
  };
  automation: {
    enabled: boolean;
    frequency: 'daily' | 'weekly' | 'monthly';
    time: string;
  };
}

const availableFields = [
  { id: 'name', label: 'Företagsnamn', required: true },
  { id: 'domain', label: 'Domän', required: true },
  { id: 'industry', label: 'Bransch', required: false },
  { id: 'location', label: 'Plats', required: false },
  { id: 'score', label: 'Lead Score', required: false },
  { id: 'status', label: 'Status', required: false },
  { id: 'totalVisits', label: 'Totala besök', required: false },
  { id: 'lastVisit', label: 'Senaste besök', required: false },
  { id: 'size', label: 'Företagsstorlek', required: false },
  { id: 'tags', label: 'Taggar', required: false },
  { id: 'firstVisit', label: 'Första besök', required: false },
  { id: 'averageSessionDuration', label: 'Genomsnittlig sessionstid', required: false },
  { id: 'pagesViewed', label: 'Sidor besökta', required: false },
  { id: 'referralSource', label: 'Hänvisningskälla', required: false }
];

const mockIntegrations: CRMIntegration[] = [
  {
    id: 'hubspot',
    name: 'HubSpot',
    logo: '🧡',
    isConnected: true,
    lastSync: new Date('2025-06-09T08:30:00'),
    totalExported: 247,
    status: 'connected'
  },
  {
    id: 'salesforce',
    name: 'Salesforce',
    logo: '⭐',
    isConnected: false,
    totalExported: 0,
    status: 'disconnected'
  },
  {
    id: 'pipedrive',
    name: 'Pipedrive',
    logo: '🚀',
    isConnected: true,
    lastSync: new Date('2025-06-09T07:15:00'),
    totalExported: 156,
    status: 'connected'
  },
  {
    id: 'mailchimp',
    name: 'MailChimp',
    logo: '🐵',
    isConnected: false,
    totalExported: 0,
    status: 'disconnected'
  }
];

export const AdvancedExportSystem = () => {
  const { t } = useTranslation();
  const [integrations, setIntegrations] = useState<CRMIntegration[]>(mockIntegrations);
  const [exportConfig, setExportConfig] = useState<ExportConfig>({
    format: 'csv',
    fields: ['name', 'domain', 'industry', 'score', 'status'],
    filters: {
      minScore: 60
    },
    automation: {
      enabled: false,
      frequency: 'weekly',
      time: '09:00'
    }
  });
  const [isExporting, setIsExporting] = useState(false);
  const [lastExport, setLastExport] = useState<Date | null>(null);
  const [activeTab, setActiveTab] = useState('quick-export');

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const companies = await leadsApi.getCompanies({
        minScore: exportConfig.filters.minScore
      });

      // Filter based on config
      let filteredCompanies = companies;
      if (exportConfig.filters.status?.length) {
        filteredCompanies = filteredCompanies.filter(c => 
          exportConfig.filters.status!.includes(c.status)
        );
      }      // Create export data
      const exportData = filteredCompanies.map(company => {
        const row: Record<string, string | number> = {};
        exportConfig.fields.forEach(field => {
          switch (field) {
            case 'name':
              row['Företagsnamn'] = company.name;
              break;
            case 'domain':
              row['Domän'] = company.domain;
              break;
            case 'industry':
              row['Bransch'] = company.industry;
              break;
            case 'location':
              row['Plats'] = `${company.location.city}, ${company.location.country}`;
              break;
            case 'score':
              row['Lead Score'] = company.score;
              break;
            case 'status':
              row['Status'] = company.status;
              break;
            case 'totalVisits':
              row['Totala besök'] = company.totalVisits;
              break;
            case 'lastVisit':
              row['Senaste besök'] = company.lastVisit.toLocaleDateString('sv-SE');
              break;
            case 'size':
              row['Företagsstorlek'] = company.size;
              break;
            case 'tags':
              row['Taggar'] = company.tags?.join(', ') || '';
              break;
          }
        });
        return row;
      });

      // Generate file based on format
      let blob: Blob;
      let filename: string;      switch (exportConfig.format) {
        case 'csv': {
          const headers = Object.keys(exportData[0] || {});
          const csvContent = [
            headers.join(','),
            ...exportData.map(row => 
              headers.map(header => `"${row[header] || ''}"`).join(',')
            )
          ].join('\n');
          blob = new Blob([csvContent], { type: 'text/csv' });
          filename = `leads_export_${new Date().toISOString().split('T')[0]}.csv`;
          break;
        }
        
        case 'json': {
          blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
          filename = `leads_export_${new Date().toISOString().split('T')[0]}.json`;
          break;
        }
        
        default:
          throw new Error('Unsupported format');
      }

      // Download file
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);

      setLastExport(new Date());
      toast({
        title: 'Export slutförd!',
        description: `${filteredCompanies.length} leads exporterade som ${exportConfig.format.toUpperCase()}`
      });

    } catch (error) {
      toast({
        title: 'Export misslyckades',
        description: 'Ett fel uppstod vid exporten',
        variant: 'destructive'
      });
    } finally {
      setIsExporting(false);
    }
  };

  const connectCRM = async (crmId: string) => {
    // Simulate connection process
    setIntegrations(prev => prev.map(integration =>
      integration.id === crmId
        ? { ...integration, status: 'syncing' as const }
        : integration
    ));

    // Simulate API call
    setTimeout(() => {
      setIntegrations(prev => prev.map(integration =>
        integration.id === crmId
          ? { 
              ...integration, 
              isConnected: true, 
              status: 'connected' as const,
              lastSync: new Date()
            }
          : integration
      ));
      
      toast({
        title: 'CRM Ansluten!',
        description: `${crmId} har anslutits framgångsrikt`
      });
    }, 2000);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'disconnected': return <AlertCircle className="h-4 w-4 text-gray-400" />;
      case 'error': return <AlertCircle className="h-4 w-4 text-red-600" />;
      case 'syncing': return <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>;
      default: return null;
    }
  };

  return (
    <div className="space-y-6">
      <div>        <h2 className="text-xl font-semibold mb-2">{t('exportSystem.title')}</h2>
        <p className="text-sm text-muted-foreground">
          {t('exportSystem.description')}
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="quick-export">{t('tabs.quickExport')}</TabsTrigger>
          <TabsTrigger value="crm-integration">{t('tabs.crmIntegration')}</TabsTrigger>
          <TabsTrigger value="automation">{t('tabs.automation')}</TabsTrigger>
        </TabsList>

        <TabsContent value="quick-export" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>              <CardHeader>
                <CardTitle>{t('labels.exportConfiguration')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>{t('labels.format')}</Label>
                  <Select 
                    value={exportConfig.format} 
                    onValueChange={(value: 'csv' | 'json' | 'excel') => 
                      setExportConfig(prev => ({ ...prev, format: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="csv">{t('formats.csv')}</SelectItem>
                      <SelectItem value="excel">{t('formats.excel')}</SelectItem>
                      <SelectItem value="json">{t('formats.json')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>{t('labels.minimumLeadScore')}</Label>
                  <Input
                    type="number"
                    value={exportConfig.filters.minScore || ''}
                    onChange={(e) => 
                      setExportConfig(prev => ({
                        ...prev,
                        filters: { ...prev.filters, minScore: parseInt(e.target.value) || undefined }
                      }))
                    }
                    placeholder={t('placeholders.daysCount')}
                  />
                </div>

                <div>
                  <Label className="mb-3 block">{t('labels.includedFields')}</Label>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {availableFields.map(field => (
                      <div key={field.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={field.id}
                          checked={exportConfig.fields.includes(field.id)}
                          disabled={field.required}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setExportConfig(prev => ({
                                ...prev,
                                fields: [...prev.fields, field.id]
                              }));
                            } else {
                              setExportConfig(prev => ({
                                ...prev,
                                fields: prev.fields.filter(f => f !== field.id)
                              }));
                            }
                          }}
                        />
                        <Label htmlFor={field.id} className="text-sm">
                          {field.label}
                          {field.required && <span className="text-red-500 ml-1">*</span>}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t('exportPreview')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <h4 className="font-medium mb-2">{t('exportSummary')}</h4>
                    <div className="text-sm space-y-1">
                      <div>{t('labels.format')}: <Badge variant="outline">{exportConfig.format.toUpperCase()}</Badge></div>
                      <div>{t('common.fields')}: {exportConfig.fields.length} {t('columns')}</div>
                      <div>{t('common.filter')}: {t('score')} ≥ {exportConfig.filters.minScore || 0}</div>
                    </div>
                  </div>

                  {lastExport && (
                    <div className="bg-green-50 p-4 rounded-lg">
                      <div className="flex items-center gap-2 text-green-800">
                        <CheckCircle className="h-4 w-4" />
                        <span className="font-medium">{t('lastExport')}</span>
                      </div>
                      <div className="text-sm text-green-700 mt-1">
                        {lastExport.toLocaleString('sv-SE')}
                      </div>
                    </div>
                  )}

                  <Button 
                    onClick={handleExport} 
                    disabled={isExporting}
                    className="w-full"
                    size="lg"
                  >
                    {isExporting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        {t('buttons.exporting')}
                      </>
                    ) : (
                      <>
                        <Download className="h-4 w-4 mr-2" />
                        {t('buttons.startExport')}
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="crm-integration" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
            {integrations.map(integration => (
              <Card key={integration.id}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">{integration.logo}</div>
                      <div>
                        <h3 className="font-semibold">{integration.name}</h3>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(integration.status)}
                          <span className="text-sm text-muted-foreground">
                            {integration.isConnected ? t('status.connected') : t('status.notConnected')}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {integration.isConnected && (
                    <div className="space-y-2 mb-4">
                      <div className="text-sm">
                        <span className="text-muted-foreground">{t('lastSync')}:</span>{' '}
                        {integration.lastSync?.toLocaleString('sv-SE')}
                      </div>
                      <div className="text-sm">
                        <span className="text-muted-foreground">{t('totalExported')}:</span>{' '}
                        {integration.totalExported} {t('leads')}
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2">
                    {integration.isConnected ? (
                      <>
                        <Button size="sm" className="flex-1">
                          <Upload className="h-4 w-4 mr-2" />
                          {t('buttons.synchronize')}
                        </Button>
                        <Button variant="outline" size="sm">
                          <Settings className="h-4 w-4" />
                        </Button>
                      </>
                    ) : (
                      <Button 
                        size="sm" 
                        className="flex-1"
                        onClick={() => connectCRM(integration.id)}
                        disabled={integration.status === 'syncing'}
                      >
                        {integration.status === 'syncing' ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            {t('buttons.connecting')}
                          </>
                        ) : (
                          <>
                            <Zap className="h-4 w-4 mr-2" />
                            {t('buttons.connect')}
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>{t('labels.apiKeysSettings')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="hubspot-key">{t('labels.hubspotApiKey')}</Label>
                  <Input 
                    id="hubspot-key" 
                    type="password" 
                    placeholder={t('placeholders.hubspotToken')}
                  />
                </div>
                <div>
                  <Label htmlFor="salesforce-token">{t('labels.salesforceToken')}</Label>
                  <Input 
                    id="salesforce-token" 
                    type="password" 
                    placeholder={t('placeholders.salesforceToken')}
                  />
                </div>
                <div>
                  <Label htmlFor="pipedrive-key">{t('labels.pipedriveApiKey')}</Label>
                  <Input 
                    id="pipedrive-key" 
                    type="password" 
                    placeholder={t('placeholders.mailchimpKey')}
                  />
                </div>
                <div>
                  <Label htmlFor="mailchimp-key">{t('labels.mailchimpApiKey')}</Label>
                  <Input 
                    id="mailchimp-key" 
                    type="password" 
                    placeholder={t('placeholders.zoomKey')}
                  />
                </div>
              </div>
              <Button className="mt-4">
                <Database className="h-4 w-4 mr-2" />
                {t('buttons.saveApiSettings')}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="automation" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t('labels.enableAutomaticExports')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>{t('labels.enableAutomaticExports')}</Label>
                  <p className="text-sm text-muted-foreground">{t('labels.automaticExportsDesc')}</p>
                </div>
                <Checkbox 
                  checked={exportConfig.automation.enabled}
                  onCheckedChange={(checked) => 
                    setExportConfig(prev => ({
                      ...prev,
                      automation: { ...prev.automation, enabled: !!checked }
                    }))
                  }
                />
              </div>

              {exportConfig.automation.enabled && (
                <div className="space-y-4 border-t pt-4">
                  <div>
                    <Label>{t('labels.frequency')}</Label>
                    <Select 
                      value={exportConfig.automation.frequency}
                      onValueChange={(value: 'daily' | 'weekly' | 'monthly') =>
                        setExportConfig(prev => ({
                          ...prev,
                          automation: { ...prev.automation, frequency: value }
                        }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">{t('frequency.daily')}</SelectItem>
                        <SelectItem value="weekly">{t('frequency.weekly')}</SelectItem>
                        <SelectItem value="monthly">{t('frequency.monthly')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>{t('labels.time')}</Label>
                    <Input
                      type="time"
                      value={exportConfig.automation.time}
                      onChange={(e) =>
                        setExportConfig(prev => ({
                          ...prev,
                          automation: { ...prev.automation, time: e.target.value }
                        }))
                      }
                    />
                  </div>

                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-medium text-blue-800 mb-2">{t('nextAutomaticExport')}</h4>
                    <p className="text-sm text-blue-700">
                      {exportConfig.automation.frequency === 'daily' && t('tomorrow') + ' '}
                      {exportConfig.automation.frequency === 'weekly' && t('nextMonday') + ' '}
                      {exportConfig.automation.frequency === 'monthly' && t('firstDayNextMonth') + ' '}
                      {t('at')} {exportConfig.automation.time}
                    </p>
                  </div>
                </div>
              )}

              <Button className="w-full">
                <Settings className="h-4 w-4 mr-2" />
                {t('buttons.saveAutomationSettings')}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
