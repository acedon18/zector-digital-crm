import React from 'react';
import { useCustomerSettings } from '@/contexts/CustomerContext';
import { useTranslation } from 'react-i18next';

export const DashboardFooter: React.FC = () => {
  const { branding, isAgencyMode } = useCustomerSettings();
  const { t } = useTranslation();

  if (isAgencyMode && !branding.showPoweredBy) {
    return null;
  }

  return (
    <footer className="border-t border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="px-4 py-3 flex items-center justify-between text-sm text-muted-foreground">
        <div className="flex items-center gap-4">
          {branding.footerText && (
            <span>{branding.footerText}</span>
          )}
          {!branding.footerText && !isAgencyMode && (
            <span>© 2025 {branding.companyName}. All rights reserved.</span>
          )}
        </div>
        
        {branding.showPoweredBy && (
          <div className="flex items-center gap-1">
            <span>Powered by</span>
            <a 
              href="https://zectordigital.se" 
              target="_blank" 
              rel="noopener noreferrer"
              className="font-medium text-primary hover:underline"
            >
              Zector Digital
            </a>
          </div>
        )}
      </div>
    </footer>
  );
};
