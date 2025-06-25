// EMERGENCY REBUILD v2: 2025-06-25 21:30:00 - LiveVisitors substring fix deployment ULTRA SAFE
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import TranslatedErrorBoundary from '@/components/ErrorBoundary';
import { CustomerProvider } from '@/contexts/CustomerContext';
import { TenantProvider } from '@/contexts/TenantContext';
import { BrandingProvider } from '@/components/layout/BrandingProvider';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from '@/hooks/useTheme';
import { Toaster } from '@/components/ui/toaster';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { withTranslation, WithTranslation } from 'react-i18next';
import { LoadingSpinner } from '@/components/ui/loading';

// Lazy load all page components for better code splitting
const Index = lazy(() => import('./pages/Index'));
const NotFound = lazy(() => import('./pages/NotFound'));
const Messages = lazy(() => import('./pages/Messages'));
const Contactus = lazy(() => import('./pages/ContactUS'));
const Calendar = lazy(() => import('./pages/Calendar'));
const Settings = lazy(() => import('./pages/Settings'));
const Analytics = lazy(() => import('./pages/Analytics'));
const Support = lazy(() => import('./pages/Support'));
const LeadTracking = lazy(() => import('./pages/LeadTracking'));
const WebsiteIntelligence = lazy(() => import('./pages/WebsiteIntelligence'));
const AdminPanel = lazy(() => import('./pages/AdminPanel'));
const CompanyProfile = lazy(() => import('./pages/CompanyProfile'));
const AIQualification = lazy(() => import('./pages/AIQualification'));
const EmailAlerts = lazy(() => import('./pages/EmailAlerts'));
const DataExport = lazy(() => import('./pages/DataExport'));
const Billing = lazy(() => import('./pages/Billing'));
const CustomerOnboarding = lazy(() => import('./pages/CustomerOnboarding'));

const queryClient = new QueryClient();

const App = () => (
  <TranslatedErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TenantProvider>
          <CustomerProvider>
            <BrandingProvider>
              <TooltipProvider>
                <Toaster />
                <Sonner />
                <BrowserRouter
                  future={{
                    v7_startTransition: true,
                    v7_relativeSplatPath: true
                  }}
                >
                <Suspense fallback={<LoadingSpinner size="lg" text="Loading..." />}>
                  <Routes>
                    <Route path="/" element={<Index />} />
                    <Route path="/contacts" element={<Contactus />} />
                    <Route path="/analytics" element={<Analytics />} />
                    <Route path="/lead-tracking" element={<LeadTracking />} />
                    <Route path="/company/:id" element={<CompanyProfile />} />
                    <Route path="/website-intelligence" element={<WebsiteIntelligence />} />
                    <Route path="/ai-qualification" element={<AIQualification />} />
                    <Route path="/email-alerts" element={<EmailAlerts />} />
                    <Route path="/data-export" element={<DataExport />} />
                    <Route path="/billing" element={<Billing />} />
                    <Route path="/customer-onboarding" element={<CustomerOnboarding />} />
                    <Route path="/messages" element={<Messages />} />
                    <Route path="/calendar" element={<Calendar />} />
                    <Route path="/settings" element={<Settings />} />
                    <Route path="/admin" element={<AdminPanel />} />
                    <Route path="/support" element={<Support />} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </Suspense>
              </BrowserRouter>
            </TooltipProvider>
          </BrandingProvider>
        </CustomerProvider>
      </TenantProvider>
    </ThemeProvider>
  </QueryClientProvider>
</TranslatedErrorBoundary>
);

// export default withTranslation()(App); // Wrap App with withTranslation
const TranslatedApp = withTranslation()(App);
export default TranslatedApp;
