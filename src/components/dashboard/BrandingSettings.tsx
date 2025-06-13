import React, { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Upload, 
  Image, 
  Eye, 
  Palette, 
  Building2, 
  Globe, 
  Mail,
  Save,
  RefreshCw,
  Check,
  X
} from 'lucide-react';
import { useCustomerSettings } from '@/contexts/CustomerContext';
import { toast } from '@/components/ui/use-toast';

export const BrandingSettings: React.FC = () => {
  const { t } = useTranslation();
  const { branding, updateBranding, uploadLogo, isAgencyMode, setAgencyMode } = useCustomerSettings();
  const [isUploading, setIsUploading] = useState(false);
  const [previewColor, setPreviewColor] = useState(branding.primaryColor);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: t('common.error'),
        description: t('branding.invalidFileType'),
        variant: 'destructive'
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: t('common.error'),
        description: t('branding.fileTooLarge'),
        variant: 'destructive'
      });
      return;
    }

    setIsUploading(true);
    try {
      const logoUrl = await uploadLogo(file);
      toast({
        title: t('branding.logoUploaded'),
        description: t('branding.logoUploadSuccess')
      });
    } catch (error) {
      toast({
        title: t('common.error'),
        description: t('branding.logoUploadError'),
        variant: 'destructive'
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleColorChange = (colorType: 'primary' | 'secondary' | 'accent', color: string) => {
    const colorUpdate = { [`${colorType}Color`]: color };
    updateBranding(colorUpdate);
    if (colorType === 'primary') {
      setPreviewColor(color);
    }
  };

  const handleSaveChanges = () => {
    toast({
      title: t('branding.changesSaved'),
      description: t('branding.brandingUpdated')
    });
  };

  const resetToDefaults = () => {
    updateBranding({
      primaryColor: '#3b82f6',
      secondaryColor: '#64748b',
      accentColor: '#f59e0b'
    });
    setPreviewColor('#3b82f6');
    toast({
      title: t('branding.resetComplete'),
      description: t('branding.colorsReset')
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold">{t('branding.title')}</h2>
          <p className="text-sm text-muted-foreground">
            {t('branding.description')}
          </p>
        </div>
        <Badge variant={isAgencyMode ? 'default' : 'secondary'}>
          {isAgencyMode ? t('branding.agencyMode') : t('branding.customerMode')}
        </Badge>
      </div>

      {/* Account Type Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            {t('branding.accountType')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>{t('branding.agencyModeToggle')}</Label>
              <p className="text-sm text-muted-foreground">
                {isAgencyMode ? t('branding.agencyModeDesc') : t('branding.customerModeDesc')}
              </p>
            </div>
            <Switch 
              checked={isAgencyMode}
              onCheckedChange={setAgencyMode}
            />
          </div>
          
          {isAgencyMode && (
            <Alert>
              <Building2 className="h-4 w-4" />
              <AlertDescription>
                {t('branding.agencyModeWarning')}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Logo Upload */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Image className="h-5 w-5" />
            {t('branding.logoSettings')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-6">
            <div className="flex-1">
              <Label>{t('branding.currentLogo')}</Label>
              <div className="mt-2 flex items-center gap-4">
                <div className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50">
                  {branding.logoUrl ? (
                    <img 
                      src={branding.logoUrl} 
                      alt="Company Logo" 
                      className="max-w-full max-h-full object-contain"
                    />
                  ) : (
                    <Image className="h-8 w-8 text-gray-400" />
                  )}
                </div>
                <div>
                  <Button
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                  >
                    {isUploading ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        {t('branding.uploading')}
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4 mr-2" />
                        {branding.logoUrl ? t('branding.changeLogo') : t('branding.uploadLogo')}
                      </>
                    )}
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="hidden"
                  />
                  {branding.logoUrl && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => updateBranding({ logoUrl: undefined })}
                      className="ml-2"
                    >
                      <X className="h-4 w-4 mr-1" />
                      {t('branding.removeLogo')}
                    </Button>
                  )}
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                {t('branding.logoRequirements')}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Company Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            {t('branding.companyInfo')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="company-name">{t('branding.companyName')}</Label>
            <Input
              id="company-name"
              value={branding.companyName}
              onChange={(e) => updateBranding({ companyName: e.target.value })}
              placeholder={t('branding.companyNamePlaceholder')}
            />
          </div>
          
          <div>
            <Label htmlFor="support-email">{t('branding.supportEmail')}</Label>
            <Input
              id="support-email"
              type="email"
              value={branding.supportEmail || ''}
              onChange={(e) => updateBranding({ supportEmail: e.target.value })}
              placeholder={t('branding.supportEmailPlaceholder')}
            />
          </div>

          <div>
            <Label htmlFor="custom-domain">{t('branding.customDomain')}</Label>
            <Input
              id="custom-domain"
              value={branding.customDomain || ''}
              onChange={(e) => updateBranding({ customDomain: e.target.value })}
              placeholder={t('branding.customDomainPlaceholder')}
            />
            <p className="text-xs text-muted-foreground mt-1">
              {t('branding.customDomainHelp')}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Color Customization */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            {t('branding.colorScheme')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <Label htmlFor="primary-color">{t('branding.primaryColor')}</Label>
              <div className="flex items-center gap-2 mt-2">
                <input
                  id="primary-color"
                  type="color"
                  value={branding.primaryColor}
                  onChange={(e) => handleColorChange('primary', e.target.value)}
                  className="w-12 h-10 rounded border"
                />
                <Input
                  value={branding.primaryColor}
                  onChange={(e) => handleColorChange('primary', e.target.value)}
                  placeholder="#3b82f6"
                  className="font-mono"
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {t('branding.primaryColorDesc')}
              </p>
            </div>

            <div>
              <Label htmlFor="secondary-color">{t('branding.secondaryColor')}</Label>
              <div className="flex items-center gap-2 mt-2">
                <input
                  id="secondary-color"
                  type="color"
                  value={branding.secondaryColor}
                  onChange={(e) => handleColorChange('secondary', e.target.value)}
                  className="w-12 h-10 rounded border"
                />
                <Input
                  value={branding.secondaryColor}
                  onChange={(e) => handleColorChange('secondary', e.target.value)}
                  placeholder="#64748b"
                  className="font-mono"
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {t('branding.secondaryColorDesc')}
              </p>
            </div>

            <div>
              <Label htmlFor="accent-color">{t('branding.accentColor')}</Label>
              <div className="flex items-center gap-2 mt-2">
                <input
                  id="accent-color"
                  type="color"
                  value={branding.accentColor}
                  onChange={(e) => handleColorChange('accent', e.target.value)}
                  className="w-12 h-10 rounded border"
                />
                <Input
                  value={branding.accentColor}
                  onChange={(e) => handleColorChange('accent', e.target.value)}
                  placeholder="#f59e0b"
                  className="font-mono"
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {t('branding.accentColorDesc')}
              </p>
            </div>
          </div>          {/* Color Preview */}
          <div 
            className="branding-preview"
            style={{ 
              '--preview-color': previewColor,
              backgroundColor: `${previewColor}10` 
            } as React.CSSProperties}
          >
            <h4 className="font-medium mb-2">{t('branding.preview')}</h4>
            <div className="flex items-center gap-4">
              <Button 
                className="primary-button-preview"
                style={{ backgroundColor: branding.primaryColor }}
              >
                {t('branding.primaryButton')}
              </Button>
              <Button 
                variant="outline" 
                className="secondary-button-preview"
                style={{ 
                  borderColor: branding.secondaryColor, 
                  color: branding.secondaryColor 
                }}
              >
                {t('branding.secondaryButton')}
              </Button>
              <Badge style={{ backgroundColor: branding.accentColor }}>
                {t('branding.accentBadge')}
              </Badge>
            </div>
          </div>

          <div className="flex gap-2">
            <Button onClick={handleSaveChanges}>
              <Save className="h-4 w-4 mr-2" />
              {t('branding.saveChanges')}
            </Button>
            <Button variant="outline" onClick={resetToDefaults}>
              <RefreshCw className="h-4 w-4 mr-2" />
              {t('branding.resetToDefaults')}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Advanced Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            {t('branding.advancedSettings')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>{t('branding.showPoweredBy')}</Label>
              <p className="text-sm text-muted-foreground">
                {t('branding.showPoweredByDesc')}
              </p>
            </div>
            <Switch 
              checked={branding.showPoweredBy}
              onCheckedChange={(checked) => updateBranding({ showPoweredBy: checked })}
            />
          </div>

          <div>
            <Label htmlFor="footer-text">{t('branding.footerText')}</Label>
            <Input
              id="footer-text"
              value={branding.footerText || ''}
              onChange={(e) => updateBranding({ footerText: e.target.value })}
              placeholder={t('branding.footerTextPlaceholder')}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
