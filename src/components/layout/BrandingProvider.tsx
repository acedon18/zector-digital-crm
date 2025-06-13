import React, { useEffect } from 'react';
import { useCustomerSettings } from '@/contexts/CustomerContext';

interface BrandingProviderProps {
  children: React.ReactNode;
}

export const BrandingProvider: React.FC<BrandingProviderProps> = ({ children }) => {
  const { branding, isAgencyMode } = useCustomerSettings();

  useEffect(() => {
    // Apply branding colors as CSS custom properties
    const root = document.documentElement;
    
    if (!isAgencyMode && branding) {
      // Apply custom branding colors
      root.style.setProperty('--brand-primary', branding.primaryColor);
      root.style.setProperty('--brand-secondary', branding.secondaryColor);
      root.style.setProperty('--brand-accent', branding.accentColor);
      
      // Update the primary color in the CSS variables used by Tailwind
      root.style.setProperty('--primary', branding.primaryColor);
      root.style.setProperty('--accent', branding.accentColor);
    } else {
      // Reset to default colors in agency mode
      root.style.setProperty('--brand-primary', '#3b82f6');
      root.style.setProperty('--brand-secondary', '#64748b');
      root.style.setProperty('--brand-accent', '#f59e0b');
      root.style.setProperty('--primary', '#3b82f6');
      root.style.setProperty('--accent', '#f59e0b');
    }

    // Update document title based on mode
    if (isAgencyMode) {
      document.title = 'CRM Platform';
    } else {
      document.title = `${branding.companyName} - CRM`;
    }

    // Update favicon if custom logo is available (in real implementation)
    // This would typically involve converting the logo to favicon format
    
  }, [branding, isAgencyMode]);

  return <>{children}</>;
};
