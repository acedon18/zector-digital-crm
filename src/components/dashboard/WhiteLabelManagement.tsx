import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { 
  Building2, 
  User, 
  Eye, 
  EyeOff, 
  Palette, 
  Globe, 
  Shield,
  CheckCircle,
  XCircle,
  Info
} from 'lucide-react';
import { useCustomerSettings } from '@/contexts/CustomerContext';

export const WhiteLabelManagement: React.FC = () => {
  const { t } = useTranslation();
  const { branding, isAgencyMode, setAgencyMode } = useCustomerSettings();
  const [previewMode, setPreviewMode] = useState<'agency' | 'customer'>(isAgencyMode ? 'agency' : 'customer');

  const features = {
    agency: [
      { key: 'cleanInterface', enabled: true, label: t('whiteLabelManagement.features.cleanInterface') },
      { key: 'noCompanyBranding', enabled: true, label: t('whiteLabelManagement.features.noCompanyBranding') },
      { key: 'genericLabels', enabled: true, label: t('whiteLabelManagement.features.genericLabels') },
      { key: 'clientPresentable', enabled: true, label: t('whiteLabelManagement.features.clientPresentable') },
      { key: 'customDomain', enabled: true, label: t('whiteLabelManagement.features.customDomain') },
      { key: 'poweredByOptional', enabled: false, label: t('whiteLabelManagement.features.poweredByOptional') }
    ],
    customer: [
      { key: 'companyBranding', enabled: true, label: t('whiteLabelManagement.features.companyBranding') },
      { key: 'customColors', enabled: true, label: t('whiteLabelManagement.features.customColors') },
      { key: 'logoDisplay', enabled: true, label: t('whiteLabelManagement.features.logoDisplay') },
      { key: 'personalizedDashboard', enabled: true, label: t('whiteLabelManagement.features.personalizedDashboard') },
      { key: 'fullCustomization', enabled: true, label: t('whiteLabelManagement.features.fullCustomization') },
      { key: 'poweredByRequired', enabled: false, label: t('whiteLabelManagement.features.poweredByRequired') }
    ]
  };

  const handleModeSwitch = (newMode: boolean) => {
    setAgencyMode(newMode);
    setPreviewMode(newMode ? 'agency' : 'customer');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold">{t('whiteLabelManagement.title')}</h2>
          <p className="text-sm text-muted-foreground">
            {t('whiteLabelManagement.description')}
          </p>
        </div>
        <Badge variant={isAgencyMode ? 'default' : 'secondary'} className="px-3 py-1">
          {isAgencyMode ? t('whiteLabelManagement.agencyMode') : t('whiteLabelManagement.customerMode')}
        </Badge>
      </div>

      {/* Mode Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            {t('whiteLabelManagement.modeSelection')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Agency Mode */}
            <div className={`p-4 border rounded-lg ${isAgencyMode ? 'border-primary bg-primary/5' : 'border-border'}`}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  <h3 className="font-medium">{t('whiteLabelManagement.agencyMode')}</h3>
                  {isAgencyMode && <CheckCircle className="h-4 w-4 text-primary" />}
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                {t('whiteLabelManagement.agencyModeDescription')}
              </p>
              <Button 
                variant={isAgencyMode ? 'default' : 'outline'} 
                size="sm"
                onClick={() => handleModeSwitch(true)}
                disabled={isAgencyMode}
                className="w-full"
              >
                {isAgencyMode ? t('whiteLabelManagement.currentMode') : t('whiteLabelManagement.switchToAgency')}
              </Button>
            </div>

            {/* Customer Mode */}
            <div className={`p-4 border rounded-lg ${!isAgencyMode ? 'border-primary bg-primary/5' : 'border-border'}`}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  <h3 className="font-medium">{t('whiteLabelManagement.customerMode')}</h3>
                  {!isAgencyMode && <CheckCircle className="h-4 w-4 text-primary" />}
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                {t('whiteLabelManagement.customerModeDescription')}
              </p>
              <Button 
                variant={!isAgencyMode ? 'default' : 'outline'} 
                size="sm"
                onClick={() => handleModeSwitch(false)}
                disabled={!isAgencyMode}
                className="w-full"
              >
                {!isAgencyMode ? t('whiteLabelManagement.currentMode') : t('whiteLabelManagement.switchToCustomer')}
              </Button>
            </div>
          </div>

          {isAgencyMode && (
            <Alert>
              <Shield className="h-4 w-4" />
              <AlertDescription>
                {t('whiteLabelManagement.agencyModeWarning')}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Feature Comparison */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            {t('whiteLabelManagement.featureComparison')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Agency Mode Features */}
            <div>
              <h4 className="font-medium mb-3 flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                {t('whiteLabelManagement.agencyModeFeatures')}
              </h4>
              <div className="space-y-2">
                {features.agency.map((feature) => (
                  <div key={feature.key} className="flex items-center gap-2 text-sm">
                    {feature.enabled ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-500" />
                    )}
                    <span className={feature.enabled ? 'text-foreground' : 'text-muted-foreground'}>
                      {feature.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Customer Mode Features */}
            <div>
              <h4 className="font-medium mb-3 flex items-center gap-2">
                <User className="h-4 w-4" />
                {t('whiteLabelManagement.customerModeFeatures')}
              </h4>
              <div className="space-y-2">
                {features.customer.map((feature) => (
                  <div key={feature.key} className="flex items-center gap-2 text-sm">
                    {feature.enabled ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-500" />
                    )}
                    <span className={feature.enabled ? 'text-foreground' : 'text-muted-foreground'}>
                      {feature.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Preview Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            {t('whiteLabelManagement.preview')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4 mb-4">
            <Label>{t('whiteLabelManagement.previewMode')}</Label>
            <div className="flex items-center gap-2">
              <Switch 
                checked={previewMode === 'agency'}
                onCheckedChange={(checked) => setPreviewMode(checked ? 'agency' : 'customer')}
              />
              <span className="text-sm">
                {previewMode === 'agency' ? t('whiteLabelManagement.agencyMode') : t('whiteLabelManagement.customerMode')}
              </span>
            </div>
          </div>

          {/* Preview Window */}
          <div className="border rounded-lg p-4 bg-muted/30">
            <div className="mb-3 pb-2 border-b">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {previewMode === 'customer' && branding.logoUrl && (
                    <img 
                      src={branding.logoUrl} 
                      alt={branding.companyName}
                      className="h-6 w-auto object-contain"
                    />
                  )}                  <h3 
                    className={`font-medium ${previewMode === 'customer' ? 'text-primary' : ''}`}
                  >
                    {previewMode === 'agency' ? 'CRM Platform' : branding.companyName}
                  </h3>
                </div>                <Badge 
                  variant="secondary" 
                  className={previewMode === 'customer' ? 'bg-accent text-accent-foreground' : ''}
                >
                  {t('whiteLabelManagement.sampleBadge')}
                </Badge>
              </div>
            </div>
            
            <div className="space-y-2">              <Button 
                size="sm" 
                className={previewMode === 'customer' ? 'bg-primary text-primary-foreground' : ''}
              >
                {t('whiteLabelManagement.sampleButton')}
              </Button>
              
              <p className="text-sm text-muted-foreground">
                {previewMode === 'agency' 
                  ? t('whiteLabelManagement.agencyPreviewText')
                  : t('whiteLabelManagement.customerPreviewText')
                }
              </p>
            </div>

            {/* Footer Preview */}
            <div className="mt-4 pt-3 border-t text-xs text-muted-foreground flex justify-between">
              <span>
                {previewMode === 'customer' && branding.footerText 
                  ? branding.footerText 
                  : `© 2025 ${previewMode === 'agency' ? 'Your Company' : branding.companyName}`
                }
              </span>
              {(previewMode === 'agency' || branding.showPoweredBy) && (
                <span>Powered by Zector Digital</span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            {t('whiteLabelManagement.quickActions')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" className="h-auto p-4 flex flex-col gap-2">
              <Palette className="h-5 w-5" />
              <span className="text-sm">{t('whiteLabelManagement.customizeColors')}</span>
            </Button>
            
            <Button variant="outline" className="h-auto p-4 flex flex-col gap-2">
              <Building2 className="h-5 w-5" />
              <span className="text-sm">{t('whiteLabelManagement.uploadLogo')}</span>
            </Button>
            
            <Button variant="outline" className="h-auto p-4 flex flex-col gap-2">
              <Globe className="h-5 w-5" />
              <span className="text-sm">{t('whiteLabelManagement.setupDomain')}</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
