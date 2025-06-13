import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { AILeadQualification } from '@/components/dashboard/AILeadQualification';
import { useTranslation } from 'react-i18next';

const AIQualification = () => {
  const { t } = useTranslation();
  
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight mb-2">{t('aiQualification.title', 'AI Lead Qualification')}</h1>
          <p className="text-muted-foreground">{t('aiQualification.advancedAnalysis', 'Advanced AI analysis of lead quality and buying intent')}</p>
        </div>
        <AILeadQualification />
      </div>
    </DashboardLayout>
  );
};

export default AIQualification;
