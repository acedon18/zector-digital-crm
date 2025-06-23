import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Zap, RefreshCw, BarChart3, Target } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useLeadFilters } from '@/hooks/useLeadFilters';
import { LeadFiltersComponent } from './lead-tracking/LeadFilters';
import { leadsApi } from '@/lib/api';
import { toast } from '@/components/ui/use-toast';

interface EnhancedLeadTrackingProps {
  useEnrichedData?: boolean;
}

export const EnhancedLeadTracking: React.FC<EnhancedLeadTrackingProps> = ({ 
  useEnrichedData = true 
}) => {
  const { t } = useTranslation();
  const { filters, updateFilter, resetFilters, hasActiveFilters } = useLeadFilters();
  const [loading, setLoading] = useState(false);
  const [companies, setCompanies] = useState([]);
  const [viewMode, setViewMode] = useState<'standard' | 'enriched'>('enriched');

  const handleRefreshData = async () => {
    try {
      setLoading(true);
      toast({
        title: 'Discovering new leads...',
        description: 'Searching connected platforms for new leads'
      });
      
      const newLeads = await leadsApi.findNewLeads();
      
      if (newLeads.length > 0) {
        toast({
          title: 'New leads discovered!',
          description: `Found ${newLeads.length} new leads from platform data`
        });
        loadCompanies();
      } else {
        toast({
          title: 'No new leads found',
          description: 'All current leads are up to date'
        });
      }
    } catch (error) {
      toast({
        title: 'Failed to discover new leads',
        description: 'Please try again later',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const loadCompanies = async () => {
    try {
      setLoading(true);
      const data = await leadsApi.getCompanies({
        status: filters.status !== 'all' ? filters.status : undefined,
        industry: filters.industry !== 'all' ? filters.industry : undefined,
        minScore: filters.scoreFilter > 0 ? filters.scoreFilter : undefined,
      });
      setCompanies(data);
    } catch (error) {
      console.error('Failed to load companies:', error);
      toast({
        title: t('common.error'),
        description: 'Failed to load company data',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    loadCompanies();
  }, [filters]);

  if (loading && companies.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Enhanced Lead Tracking</h2>
          <p className="text-muted-foreground">
            Track and manage leads with integrated platform data
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleRefreshData}
            disabled={loading}
          >
            {loading ? (
              <RefreshCw className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Zap className="h-4 w-4 mr-2" />
            )}
            Discover New Leads
          </Button>
        </div>
      </div>

      {/* Filters */}
      <LeadFiltersComponent
        filters={filters}
        onFilterChange={updateFilter}
        onReset={resetFilters}
        hasActiveFilters={hasActiveFilters}
        loading={loading}
      />

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Companies</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{companies.length}</div>
            <p className="text-xs text-muted-foreground">in your database</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">High Quality Leads</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {companies.filter(c => c.score && c.score >= 80).length}
            </div>
            <p className="text-xs text-muted-foreground">score 80+</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Hot Leads</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {companies.filter(c => c.status === 'hot').length}
            </div>
            <p className="text-xs text-muted-foreground">ready to contact</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Filtered Results</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {companies.filter(company => {
                const matchesSearch = company.name.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
                                    company.domain.toLowerCase().includes(filters.searchTerm.toLowerCase());
                return matchesSearch;
              }).length}
            </div>
            <p className="text-xs text-muted-foreground">matching filters</p>
          </CardContent>
        </Card>
      </div>

      {/* Results will be added in next component */}
      <Card>
        <CardHeader>
          <CardTitle>Company Results</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-muted-foreground">Lead table component will be implemented next</p>
            <p className="text-sm text-muted-foreground mt-2">
              Found {companies.length} companies
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
