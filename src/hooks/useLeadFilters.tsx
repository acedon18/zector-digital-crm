import { useState } from 'react';

export interface LeadFilters {
  status: string;
  industry: string;
  scoreFilter: number;
  searchTerm: string;
}

export const useLeadFilters = () => {
  const [filters, setFilters] = useState<LeadFilters>({
    status: 'all',
    industry: 'all',
    scoreFilter: 0,
    searchTerm: ''
  });

  const updateFilter = (key: keyof LeadFilters, value: string | number) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const resetFilters = () => {
    setFilters({
      status: 'all',
      industry: 'all',
      scoreFilter: 0,
      searchTerm: ''
    });
  };

  const hasActiveFilters = () => {
    return filters.status !== 'all' || 
           filters.industry !== 'all' || 
           filters.scoreFilter > 0 || 
           filters.searchTerm.length > 0;
  };

  return {
    filters,
    updateFilter,
    resetFilters,
    hasActiveFilters: hasActiveFilters()
  };
};
