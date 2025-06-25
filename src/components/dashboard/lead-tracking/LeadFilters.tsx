// SAFETY FIXED: 2025-06-25 21:45:00 - LeadFilters component improvements v2
// Added proper accessibility, error handling, and safety checks
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, RotateCcw } from 'lucide-react';

export interface LeadFilters {
  status: string;
  industry: string;
  scoreFilter: number;
  searchTerm: string;
}

interface LeadFiltersProps {
  filters: LeadFilters;
  onFilterChange: (key: keyof LeadFilters, value: string | number) => void;
  onReset: () => void;
  hasActiveFilters: boolean;
  loading?: boolean;
}

export const LeadFiltersComponent: React.FC<LeadFiltersProps> = ({
  filters,
  onFilterChange,
  onReset,
  hasActiveFilters,
  loading = false
}) => {
  // Safety checks for props
  if (!filters || typeof filters !== 'object') {
    console.warn('LeadFiltersComponent: Invalid filters prop received');
    return null;
  }

  if (typeof onFilterChange !== 'function') {
    console.warn('LeadFiltersComponent: onFilterChange is not a function');
    return null;
  }

  // Safe event handlers with error boundaries
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const value = e.target?.value || '';
      onFilterChange('searchTerm', value);
    } catch (error) {
      console.error('Error in search filter:', error);
    }
  };

  const handleStatusChange = (value: string) => {
    try {
      onFilterChange('status', value || 'all');
    } catch (error) {
      console.error('Error in status filter:', error);
    }
  };

  const handleIndustryChange = (value: string) => {
    try {
      onFilterChange('industry', value || 'all');
    } catch (error) {
      console.error('Error in industry filter:', error);
    }
  };

  const handleScoreChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const value = Number(e.target?.value) || 0;
      onFilterChange('scoreFilter', value);
    } catch (error) {
      console.error('Error in score filter:', error);
    }
  };

  const handleReset = () => {
    try {
      if (typeof onReset === 'function') {
        onReset();
      }
    } catch (error) {
      console.error('Error resetting filters:', error);
    }
  };
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Filter className="h-5 w-5" />
          Filters & Search
          {hasActiveFilters && (
            <Badge variant="secondary" className="ml-2">
              Active
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">          {/* Search */}
          <div className="space-y-2">
            <label htmlFor="search-input" className="text-sm font-medium">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />              <Input
                id="search-input"
                placeholder="Search companies..."
                value={filters.searchTerm || ''}
                onChange={handleSearchChange}
                className="pl-10"
                disabled={loading}
                aria-label="Search companies by name or domain"
              />
            </div>
          </div>          {/* Status Filter */}
          <div className="space-y-2">
            <label htmlFor="status-select" className="text-sm font-medium">Status</label>            <Select
              value={filters.status || 'all'}
              onValueChange={handleStatusChange}
              disabled={loading}
            >
              <SelectTrigger id="status-select" aria-label="Filter by lead status">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="hot">Hot</SelectItem>
                <SelectItem value="warm">Warm</SelectItem>
                <SelectItem value="cold">Cold</SelectItem>
                <SelectItem value="new">New</SelectItem>
              </SelectContent>
            </Select>
          </div>          {/* Industry Filter */}
          <div className="space-y-2">
            <label htmlFor="industry-select" className="text-sm font-medium">Industry</label>            <Select
              value={filters.industry || 'all'}
              onValueChange={handleIndustryChange}
              disabled={loading}
            >
              <SelectTrigger id="industry-select" aria-label="Filter by industry">
                <SelectValue placeholder="All Industries" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Industries</SelectItem>
                <SelectItem value="Technology">Technology</SelectItem>
                <SelectItem value="Manufacturing">Manufacturing</SelectItem>
                <SelectItem value="Financial Services">Financial Services</SelectItem>
                <SelectItem value="Healthcare">Healthcare</SelectItem>
                <SelectItem value="Retail">Retail</SelectItem>
                <SelectItem value="Consulting">Consulting</SelectItem>
                <SelectItem value="Design">Design</SelectItem>
              </SelectContent>
            </Select>
          </div>          {/* Score Filter */}          <div className="space-y-2">
            <label htmlFor="score-filter" className="text-sm font-medium">
              Min Score: {filters.scoreFilter || 0}
            </label>
            <div className="flex items-center gap-2">
              <input
                id="score-filter"
                type="range"
                min="0"
                max="100"
                step="10"
                value={filters.scoreFilter || 0}
                onChange={handleScoreChange}
                className="flex-1"
                disabled={loading}
                aria-label={`Minimum score filter: ${filters.scoreFilter || 0}`}
                title={`Set minimum score to ${filters.scoreFilter || 0}`}
              />              {hasActiveFilters && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleReset}
                  disabled={loading}
                  className="shrink-0"
                >
                  <RotateCcw className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
