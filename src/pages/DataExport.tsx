import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { AdvancedExportSystem } from '@/components/dashboard/AdvancedExportSystem';

const DataExport = () => {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight mb-2">Advanced Data Export</h1>
          <p className="text-muted-foreground">Exportera lead-data till CRM-system och externa plattformar med avancerade filter och automation.</p>
        </div>
        <AdvancedExportSystem />
      </div>
    </DashboardLayout>
  );
};

export default DataExport;
