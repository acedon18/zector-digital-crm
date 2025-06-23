import { useState, useEffect, useCallback } from 'react';
import { Company } from '@/types/leads';
import { EnrichedLeadData } from '@/services/dataEnrichmentService';
import { leadsApi } from '@/lib/api';
import { toast } from '@/components/ui/use-toast';
import { useTranslation } from 'react-i18next';

export interface UseLeadDataOptions {
  useEnrichedData?: boolean;
}

export interface LeadFilters {
  status: string;
  industry: string;
  scoreFilter: number;
  searchTerm: string;
}

export const useLeadData = ({ useEnrichedData = true }: UseLeadDataOptions = {}) => {
  const { t } = useTranslation();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [enrichedCompanies, setEnrichedCompanies] = useState<EnrichedLeadData[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'standard' | 'enriched'>('enriched');
  const [filters, setFilters] = useState<LeadFilters>({
    status: 'all',
    industry: 'all',
    scoreFilter: 0,
    searchTerm: ''
  });

  const loadCompanies = useCallback(async () => {
    try {
      setLoading(true);
      
      if (useEnrichedData && viewMode === 'enriched') {
        const enrichedData = await leadsApi.getEnrichedCompanies({
          status: filters.status !== 'all' ? filters.status : undefined,
          industry: filters.industry !== 'all' ? filters.industry : undefined,
          minScore: filters.scoreFilter > 0 ? filters.scoreFilter : undefined,
        });
        setEnrichedCompanies(enrichedData);
      } else {
        const standardData = await leadsApi.getCompanies({
          status: filters.status !== 'all' ? filters.status : undefined,
          industry: filters.industry !== 'all' ? filters.industry : undefined,
          minScore: filters.scoreFilter > 0 ? filters.scoreFilter : undefined,
          enriched: false
        });
        setCompanies(standardData);
      }
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
  }, [useEnrichedData, viewMode, filters, t]);

  const refreshData = async () => {
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
        await loadCompanies();
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

  const getDisplayData = () => {
    const data = viewMode === 'enriched' ? enrichedCompanies : companies;
    
    return data.filter(item => {
      const company = 'company' in item ? item.company : item;
      const matchesSearch = company.name.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
                          company.domain.toLowerCase().includes(filters.searchTerm.toLowerCase());
      return matchesSearch;
    });
  };

  useEffect(() => {
    loadCompanies();
  }, [loadCompanies]);

  return {
    // Data
    companies,
    enrichedCompanies,
    displayData: getDisplayData(),
    
    // State
    loading,
    viewMode,
    filters,
    
    // Actions
    setViewMode,
    setFilters,
    refreshData,
    reload: loadCompanies
  };
};
