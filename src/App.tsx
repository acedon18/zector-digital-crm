import { Toaster } from '@/components/ui/toaster';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import Index from './pages/Index';
import NotFound from './pages/NotFound';
import Messages from './pages/Messages';
import Contactus from './pages/ContactUS';
import Calendar from './pages/Calendar';
import Settings from './pages/Settings';
import Analytics from './pages/Analytics';
import Support from './pages/Support';
import LeadTracking from './pages/LeadTracking';
import WebsiteIntelligence from './pages/WebsiteIntelligence';
import AdminPanel from './pages/AdminPanel';
import CompanyProfile from './pages/CompanyProfile';
import AIQualification from './pages/AIQualification';
import EmailAlerts from './pages/EmailAlerts';
import DataExport from './pages/DataExport';
import Billing from './pages/Billing';
import { AILeadQualification } from './components/dashboard/AILeadQualification';
import { EmailAlertSystem } from './components/dashboard/EmailAlertSystem';
import { AdvancedExportSystem } from './components/dashboard/AdvancedExportSystem';

const queryClient = new QueryClient();

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/contacts" element={<Contactus />} />          <Route path="/analytics" element={<Analytics />} />
          <Route path="/lead-tracking" element={<LeadTracking />} />
          <Route path="/company/:id" element={<CompanyProfile />} />
          <Route path="/website-intelligence" element={<WebsiteIntelligence />} />
          <Route path="/ai-qualification" element={<AIQualification />} />
          <Route path="/email-alerts" element={<EmailAlerts />} />
          <Route path="/data-export" element={<DataExport />} />
          <Route path="/billing" element={<Billing />} />
            <Route path="/messages" element={<Messages />} />
            <Route path="/calendar" element={<Calendar />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/admin" element={<AdminPanel />} />
            <Route path="/support" element={<Support />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
