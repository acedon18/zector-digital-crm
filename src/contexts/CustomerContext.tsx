import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { CustomerSettings, BrandingSettings, PlatformCredentials } from '@/types/integrations';

interface CustomerContextType {
  settings: CustomerSettings | null;
  branding: BrandingSettings;
  integrations: PlatformCredentials[];
  updateBranding: (branding: Partial<BrandingSettings>) => void;
  updateIntegration: (integration: PlatformCredentials) => void;
  removeIntegration: (platformId: string) => void;
  uploadLogo: (file: File) => Promise<string>;
  isAgencyMode: boolean;
  setAgencyMode: (mode: boolean) => void;
  isLoading: boolean;
}

const CustomerContext = createContext<CustomerContextType | undefined>(undefined);

// Default branding settings
const defaultBranding: BrandingSettings = {
  companyName: 'Zector Digital',
  primaryColor: '#3b82f6',
  secondaryColor: '#64748b',
  accentColor: '#f59e0b',
  accountType: 'agency',
  showPoweredBy: true,
  supportEmail: 'support@zectordigital.se'
};

// Mock default customer settings
const defaultCustomerSettings: CustomerSettings = {
  id: 'default-customer',
  name: 'Demo Customer',
  branding: defaultBranding,
  integrations: [],
  dataSources: [],
  timezone: 'Europe/Stockholm',
  currency: 'SEK',
  language: 'sv',
  permissions: {
    canEditBranding: true,
    canManageIntegrations: true,
    canExportData: true,
    canViewAnalytics: true,
    canManageUsers: true,
    maxUsers: 10
  },
  createdAt: new Date(),
  lastLogin: new Date()
};

interface CustomerProviderProps {
  children: ReactNode;
}

export const CustomerProvider: React.FC<CustomerProviderProps> = ({ children }) => {
  const [settings, setSettings] = useState<CustomerSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load customer settings from localStorage or API
    const loadCustomerSettings = async () => {
      try {
        const savedSettings = localStorage.getItem('customer_settings');
        if (savedSettings) {
          setSettings(JSON.parse(savedSettings));
        } else {
          setSettings(defaultCustomerSettings);
        }
      } catch (error) {
        console.error('Failed to load customer settings:', error);
        setSettings(defaultCustomerSettings);
      } finally {
        setIsLoading(false);
      }
    };

    loadCustomerSettings();
  }, []);

  const saveSettings = (newSettings: CustomerSettings) => {
    setSettings(newSettings);
    localStorage.setItem('customer_settings', JSON.stringify(newSettings));
  };

  const updateBranding = (brandingUpdates: Partial<BrandingSettings>) => {
    if (!settings) return;
    
    const newSettings = {
      ...settings,
      branding: {
        ...settings.branding,
        ...brandingUpdates
      }
    };
    
    saveSettings(newSettings);
  };

  const updateIntegration = (integration: PlatformCredentials) => {
    if (!settings) return;
    
    const existingIndex = settings.integrations.findIndex(i => i.platform === integration.platform);
    let newIntegrations;
    
    if (existingIndex >= 0) {
      newIntegrations = [...settings.integrations];
      newIntegrations[existingIndex] = integration;
    } else {
      newIntegrations = [...settings.integrations, integration];
    }
    
    const newSettings = {
      ...settings,
      integrations: newIntegrations
    };
    
    saveSettings(newSettings);
  };

  const removeIntegration = (platformId: string) => {
    if (!settings) return;
    
    const newSettings = {
      ...settings,
      integrations: settings.integrations.filter(i => i.id !== platformId)
    };
    
    saveSettings(newSettings);
  };

  const uploadLogo = async (file: File): Promise<string> => {
    // In a real implementation, this would upload to a cloud service
    // For now, we'll create a local URL
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const logoUrl = e.target?.result as string;
        updateBranding({ logoUrl });
        resolve(logoUrl);
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });
  };

  const setAgencyMode = (mode: boolean) => {
    updateBranding({ 
      accountType: mode ? 'agency' : 'end_customer',
      showPoweredBy: mode
    });
  };

  const value: CustomerContextType = {
    settings,
    branding: settings?.branding || defaultBranding,
    integrations: settings?.integrations || [],
    updateBranding,
    updateIntegration,
    removeIntegration,
    uploadLogo,
    isAgencyMode: settings?.branding.accountType === 'agency',
    setAgencyMode,
    isLoading
  };

  return (
    <CustomerContext.Provider value={value}>
      {children}
    </CustomerContext.Provider>
  );
};

export const useCustomerSettings = (): CustomerContextType => {
  const context = useContext(CustomerContext);
  if (context === undefined) {
    throw new Error('useCustomerSettings must be used within a CustomerProvider');
  }
  return context;
};
