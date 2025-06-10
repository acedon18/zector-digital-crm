import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { AILeadQualification } from '@/components/dashboard/AILeadQualification';

const AIQualification = () => {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight mb-2">AI Lead Qualification</h1>
          <p className="text-muted-foreground">Använd AI-driven analys för att kvalificera och prioritera leads automatiskt.</p>
        </div>
        <AILeadQualification />
      </div>
    </DashboardLayout>
  );
};

export default AIQualification;
