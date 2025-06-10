import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { EmailAlertSystem } from '@/components/dashboard/EmailAlertSystem';

const EmailAlerts = () => {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight mb-2">Email Alert System</h1>
          <p className="text-muted-foreground">Konfigurera smarta email-aviseringar för lead-aktivitet och viktiga händelser.</p>
        </div>
        <EmailAlertSystem />
      </div>
    </DashboardLayout>
  );
};

export default EmailAlerts;
