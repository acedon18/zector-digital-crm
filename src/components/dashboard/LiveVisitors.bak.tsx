import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Users, Eye, TrendingUp, Clock, Filter, X } from 'lucide-react';
import { Company } from '@/types/leads';
import { leadsApi, subscribeToLiveUpdates } from '@/lib/api';
import { format } from 'date-fns';
import { sv } from 'date-fns/locale';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

// Types for filters
type FilterStatus = 'all' | 'hot' | 'warm' | 'cold';
type FilterIndustry = 'all' | string;
type SortOption = 'lastVisit' | 'score' | 'totalVisits';

export const LiveVisitors = () => {
  const { t } = useTranslation();
  const [recentVisitors, setRecentVisitors] = useState<Company[]>([]);
  const [filteredVisitors, setFilteredVisitors] = useState<Company[]>([]);
  const [onlineCount, setOnlineCount] = useState(0);
  
  // Filter states
  const [showFilters, setShowFilters] = useState(false);
  const [statusFilter, setStatusFilter] = useState<FilterStatus>('all');
  const [industryFilter, setIndustryFilter] = useState<FilterIndustry>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('lastVisit');
  
  // Industry list for filtering
  const [industries, setIndustries] = useState<string[]>([]);

  useEffect(() => {
    loadRecentVisitors();
    
    // Subscribe to live updates
    const unsubscribe = subscribeToLiveUpdates((updatedCompany) => {
      // Ensure lastVisit is a Date object
      const processedCompany = {
        ...updatedCompany,
        lastVisit: updatedCompany.lastVisit instanceof Date ? 
                  updatedCompany.lastVisit : 
                  new Date(updatedCompany.lastVisit)
      };
      
      setRecentVisitors(prev => {
        const filtered = prev.filter(c => c.id !== processedCompany.id);
        const updated = [processedCompany, ...filtered].slice(0, 8);
        
        // Extract unique industries for filters
        const uniqueIndustries = [...new Set(updated.map(c => c.industry))].filter(Boolean);
        setIndustries(uniqueIndustries);
        
        return updated;
      });
      
      // Simulate online counter
      setOnlineCount(prev => Math.max(1, prev + Math.floor(Math.random() * 3) - 1));
    });

    // Initial online count
    setOnlineCount(Math.floor(Math.random() * 20) + 5);

    return unsubscribe;
  }, []);  const loadRecentVisitors = async () => {
    try {
      console.log('Loading recent visitors from API...');
      const visitors = await leadsApi.getRecentVisitors(15); // Increased limit for more filter options
      console.log('Received visitors:', visitors);
      
      // Convert lastVisit string to Date object if needed
      const processedVisitors = visitors.map(visitor => ({
        ...visitor,
        lastVisit: visitor.lastVisit instanceof Date ? 
                  visitor.lastVisit : 
                  new Date(visitor.lastVisit)
      }));
      
      setRecentVisitors(processedVisitors);
      
      // Extract unique industries for filters
      const uniqueIndustries = [...new Set(processedVisitors.map(c => c.industry))].filter(Boolean);
      setIndustries(uniqueIndustries);
    } catch (error) {
      console.error('Could not fetch recent visitors:', error);
    }
  };
  
  // Function to fetch filtered companies from the API
  const fetchFilteredCompanies = async () => {
    if (!recentVisitors.length) {
      setFilteredVisitors([]);
      return;
    }
    
    try {
      // Use the API for filtering if any filters are applied
      if (statusFilter !== 'all' || industryFilter !== 'all' || searchTerm) {
        const filters = {
          status: statusFilter !== 'all' ? statusFilter : undefined,
          industry: industryFilter !== 'all' ? industryFilter : undefined,
          search: searchTerm || undefined,
          sortBy,
          limit: 15
        };
        
        console.log('Fetching filtered companies with filters:', filters);
        const filteredCompanies = await leadsApi.getFilteredCompanies(filters);
        setFilteredVisitors(filteredCompanies);
        return;
      }
      
      // If no filters applied, just sort the recent visitors
      const sorted = [...recentVisitors];
      switch (sortBy) {
        case 'score':
          sorted.sort((a, b) => b.score - a.score);
          break;
        case 'totalVisits':
          sorted.sort((a, b) => b.totalVisits - a.totalVisits);
          break;
        default:
          sorted.sort((a, b) => b.lastVisit.getTime() - a.lastVisit.getTime());
      }
      
      setFilteredVisitors(sorted);
    } catch (error) {
      console.error('Error fetching filtered companies:', error);
      // Fall back to client-side filtering
      applyLocalFiltering();
    }
  };

  // Apply filters locally if API fails
  const applyLocalFiltering = () => {
    const filtered = [...recentVisitors];
    
    // Filter by status
    const statusFiltered = statusFilter === 'all' 
      ? filtered 
      : filtered.filter(company => company.status === statusFilter);
    
    // Filter by industry
    const industryFiltered = industryFilter === 'all' 
      ? statusFiltered 
      : statusFiltered.filter(company => company.industry === industryFilter);
    
    // Search term filtering
    const searchFiltered = !searchTerm
      ? industryFiltered
      : industryFiltered.filter(company => {
          const term = searchTerm.toLowerCase();
          return company.name.toLowerCase().includes(term) ||
            company.domain.toLowerCase().includes(term) ||
            (company.email && company.email.toLowerCase().includes(term)) ||
            (company.website && company.website.toLowerCase().includes(term));
        });
    // Sort results
    const sortedResults = [...searchFiltered];
    switch (sortBy) {
      case 'score':
        sortedResults.sort((a, b) => b.score - a.score);
        break;
      case 'totalVisits':
        sortedResults.sort((a, b) => b.totalVisits - a.totalVisits);
        break;
      case 'lastVisit':
      default:
        sortedResults.sort((a, b) => b.lastVisit.getTime() - a.lastVisit.getTime());
    }
    
    // Update filtered state
    setFilteredVisitors(sortedResults);
  };
    // Apply filters whenever relevant state changes  useEffect(() => {
    fetchFilteredCompanies();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recentVisitors, statusFilter, industryFilter, searchTerm, sortBy]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'hot': return 'bg-red-500';
      case 'warm': return 'bg-yellow-500';
      case 'cold': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusName = (status: string) => {
    switch (status) {
      case 'hot': return t('status.hot');
      case 'warm': return t('status.warm');
      case 'cold': return t('status.cold');
      default: return status;
    }
  };

  const resetFilters = () => {
    setStatusFilter('all');
    setIndustryFilter('all');
    setSearchTerm('');
    setSortBy('lastVisit');
    setShowFilters(false);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Live Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-green-600" />
              {t('liveVisitors.liveActivity')}
            </div>
            
            <div className="flex items-center gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button 
                    variant={showFilters ? "default" : "outline"} 
                    size="sm" 
                    className="flex items-center gap-1"
                    onClick={() => setShowFilters(!showFilters)}
                  >
                    <Filter className="h-4 w-4" />
                    {t('liveVisitors.filter')}
                    {(statusFilter !== 'all' || industryFilter !== 'all' || searchTerm) && (
                      <Badge variant="default" className="ml-1 h-5 w-5 p-0 flex items-center justify-center">
                        {[
                          statusFilter !== 'all' ? 1 : 0, 
                          industryFilter !== 'all' ? 1 : 0, 
                          searchTerm ? 1 : 0
                        ].reduce((a, b) => a + b, 0)}
                      </Badge>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="font-medium text-sm">
                        {t('liveVisitors.statusFilter')}
                      </div>
                      <ToggleGroup 
                        type="single" 
                        variant="outline"
                        value={statusFilter}
                        onValueChange={value => value && setStatusFilter(value as FilterStatus)}
                        className="justify-start"
                      >
                        <ToggleGroupItem value="all" size="sm">
                          {t('status.all')}
                        </ToggleGroupItem>
                        <ToggleGroupItem value="hot" size="sm" className="text-red-500">
                          {t('status.hot')}
                        </ToggleGroupItem>
                        <ToggleGroupItem value="warm" size="sm" className="text-yellow-500">
                          {t('status.warm')}
                        </ToggleGroupItem>
                        <ToggleGroupItem value="cold" size="sm" className="text-blue-500">
                          {t('status.cold')}
                        </ToggleGroupItem>
                      </ToggleGroup>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="font-medium text-sm">
                        {t('liveVisitors.industryFilter')}
                      </div>
                      <Select
                        value={industryFilter}
                        onValueChange={value => setIndustryFilter(value)}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder={t('liveVisitors.selectIndustry')} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">{t('liveVisitors.allIndustries')}</SelectItem>
                          {industries.map(industry => (
                            <SelectItem key={industry} value={industry}>{industry}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="font-medium text-sm">
                        {t('liveVisitors.search')}
                      </div>
                      <Input
                        placeholder={t('liveVisitors.searchPlaceholder')}
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <div className="font-medium text-sm">
                        {t('liveVisitors.sortBy')}
                      </div>
                      <Select
                        value={sortBy}
                        onValueChange={value => setSortBy(value as SortOption)}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder={t('liveVisitors.selectSortOption')} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="lastVisit">{t('liveVisitors.sortByLastVisit')}</SelectItem>
                          <SelectItem value="score">{t('liveVisitors.sortByScore')}</SelectItem>
                          <SelectItem value="totalVisits">{t('liveVisitors.sortByVisits')}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full mt-2"
                      onClick={resetFilters}
                    >
                      <X className="h-4 w-4 mr-1" />
                      {t('liveVisitors.resetFilters')}
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{onlineCount}</div>
              <div className="text-sm text-muted-foreground">{t('liveVisitors.activeNow')}</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{recentVisitors.length}</div>
              <div className="text-sm text-muted-foreground">{t('liveVisitors.lastHour')}</div>
            </div>
          </div>
          
          {/* Active filter indicators */}
          {(statusFilter !== 'all' || industryFilter !== 'all' || searchTerm) && (
            <div className="mt-4 flex flex-wrap gap-2">
              {statusFilter !== 'all' && (
                <Badge variant="outline" className="flex items-center gap-1">
                  {getStatusName(statusFilter)}
                  <X 
                    className="h-3 w-3 ml-1 cursor-pointer" 
                    onClick={() => setStatusFilter('all')} 
                  />
                </Badge>
              )}
              
              {industryFilter !== 'all' && (
                <Badge variant="outline" className="flex items-center gap-1">
                  {industryFilter}
                  <X 
                    className="h-3 w-3 ml-1 cursor-pointer" 
                    onClick={() => setIndustryFilter('all')} 
                  />
                </Badge>
              )}
              
              {searchTerm && (
                <Badge variant="outline" className="flex items-center gap-1">
                  "{searchTerm}"
                  <X 
                    className="h-3 w-3 ml-1 cursor-pointer" 
                    onClick={() => setSearchTerm('')} 
                  />
                </Badge>
              )}
              
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-6 px-2 text-xs" 
                onClick={resetFilters}
              >
                {t('liveVisitors.clearAll')}
              </Button>
            </div>
          )}
          
          <div className="mt-4 flex items-center gap-2 text-sm text-green-600">
            <TrendingUp className="h-4 w-4" />
            <span>{t('liveVisitors.activityIncrease')}</span>
          </div>
        </CardContent>
      </Card>

      {/* Recent Visitors */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            {statusFilter !== 'all' || industryFilter !== 'all' || searchTerm
              ? t('liveVisitors.filteredVisitors')
              : t('liveVisitors.recentVisitors')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {filteredVisitors.length > 0 ? filteredVisitors.map((company) => (
              <div key={`${company.id}-${company.lastVisit.getTime()}`} className="flex flex-col p-2 rounded-lg hover:bg-muted/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="text-xs">
                          {company.name.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className={`absolute -top-1 -right-1 w-3 h-3 rounded-full ${getStatusColor(company.status)}`}></div>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-medium text-sm truncate">{company.name}</div>
                      <div className="text-xs text-muted-foreground">{company.industry}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {format(company.lastVisit, 'HH:mm')}
                    </div>
                    <Badge variant="outline" className="text-xs mt-1">
                      {company.totalVisits} {t('liveVisitors.visits')}
                    </Badge>
                  </div>
                </div>
                
                {/* Contact Information */}
                <div className="mt-2 grid grid-cols-1 gap-1 text-xs text-muted-foreground">
                  {company.website && (
                    <div className="flex items-center gap-1 overflow-hidden">
                      <span className="font-medium">🌐</span>
                      <a href={company.website.startsWith('http') ? company.website : `https://${company.website}`} 
                         target="_blank" 
                         rel="noopener noreferrer"
                         className="truncate hover:text-primary">
                        {company.website}
                      </a>
                    </div>
                  )}
                  {company.email && (
                    <div className="flex items-center gap-1 overflow-hidden">
                      <span className="font-medium">📧</span>
                      <a href={`mailto:${company.email}`} 
                         className="truncate hover:text-primary">
                        {company.email}
                      </a>
                    </div>
                  )}
                  {company.phone && (
                    <div className="flex items-center gap-1 overflow-hidden">
                      <span className="font-medium">📞</span>
                      <a href={`tel:${company.phone}`} 
                         className="truncate hover:text-primary">
                        {company.phone}
                      </a>
                    </div>
                  )}
                </div>
              </div>
            )) : (
              <div className="text-center text-muted-foreground py-8">
                <Filter className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>{t('liveVisitors.noFilterResults')}</p>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="mt-2" 
                  onClick={resetFilters}
                >
                  {t('liveVisitors.resetFilters')}
                </Button>
              </div>
            )}
          </div>
          
          {recentVisitors.length === 0 && (
            <div className="text-center text-muted-foreground py-8">
              <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>{t('liveVisitors.noVisitors')}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
