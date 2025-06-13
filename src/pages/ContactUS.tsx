import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useTranslation } from 'react-i18next';

const Index = () => {
  const { t } = useTranslation();
  
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight mb-2">{t('contactUs.title')}</h1>
          <p className="text-muted-foreground">{t('contactUs.description')}</p>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Index;
