import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Users, Eye, TrendingUp, Clock, Filter, X } from 'lucide-react';
import { Company } from '@/types/leads';
import { leadsApi, subscribeToLiveUpdates } from '@/lib/api';
import { format } from 'date-fns';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

// Types for filters
type FilterStatus = 'all' | 'hot' | 'warm' | 'cold';
type FilterIndustry = 'all' | string;
type SortOption = 'lastVisit' | 'score' | 'totalVisits';

export const LiveVisitorsFixed = () => {
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
  const [industries, setIndustries] = useState<string[]>([]);

  // FIXED: Safe avatar initials function
  const getAvatarInitials = (company: Company | null | undefined): string => {
    if (!company) return 'UN';
    
    const name = company.name;
    const domain = company.domain;
    
    if (typeof name === 'string' && name.length > 0) {
      return name.substring(0, 2).toUpperCase();
    }
    if (typeof domain === 'string' && domain.length > 0) {
      return domain.substring(0, 2).toUpperCase();
    }
    return 'UN';
  };

  const loadRecentVisitors = async () => {
    try {
      const visitors = await leadsApi.getRecentVisitors(15);
      
      // FIXED: Filter out invalid visitors
      const validVisitors = (visitors || [])
        .filter((visitor: any) => visitor && (visitor.id || visitor.name || visitor.domain))
        .map((visitor: any) => ({
          ...visitor,
          lastVisit: visitor.lastVisit instanceof Date ? 
                    visitor.lastVisit : 
                    new Date(visitor.lastVisit || Date.now())
        }));
      
      setRecentVisitors(validVisitors);
      
      const uniqueIndustries = [...new Set(validVisitors.map((c: any) => c.industry))].filter(Boolean) as string[];
      setIndustries(uniqueIndustries);
    } catch (error) {
      console.error('Could not fetch recent visitors:', error);
      setRecentVisitors([]);
    }
  };

  const applyLocalFiltering = useCallback(() => {
    const filtered = [...recentVisitors];
    
    const statusFiltered = statusFilter === 'all' 
      ? filtered 
      : filtered.filter(company => company?.status === statusFilter);
    
    const industryFiltered = industryFilter === 'all' 
      ? statusFiltered 
      : statusFiltered.filter(company => company?.industry === industryFilter);
      
    const searchFiltered = !searchTerm
      ? industryFiltered
      : industryFiltered.filter(company => {
          const term = searchTerm.toLowerCase();
          const companyName = company?.name || '';
          const companyDomain = company?.domain || '';
          const companyEmail = company?.email || '';
          const companyWebsite = company?.website || '';
          
          return companyName.toLowerCase().includes(term) ||
            companyDomain.toLowerCase().includes(term) ||
            companyEmail.toLowerCase().includes(term) ||
            companyWebsite.toLowerCase().includes(term);
        });
      
    const sortedResults = [...searchFiltered];
    switch (sortBy) {
      case 'score':
        sortedResults.sort((a, b) => (b?.score || 0) - (a?.score || 0));
        break;
      case 'totalVisits':
        sortedResults.sort((a, b) => (b?.totalVisits || 0) - (a?.totalVisits || 0));
        break;
      case 'lastVisit':
      default:
        sortedResults.sort((a, b) => {
          const aTime = a?.lastVisit ? a.lastVisit.getTime() : 0;
          const bTime = b?.lastVisit ? b.lastVisit.getTime() : 0;
          return bTime - aTime;
        });
    }
    
    setFilteredVisitors(sortedResults);
  }, [recentVisitors, statusFilter, industryFilter, searchTerm, sortBy]);

  useEffect(() => {
    loadRecentVisitors();
    
    const unsubscribe = subscribeToLiveUpdates((updatedCompany) => {
      if (!updatedCompany || typeof updatedCompany !== 'object') {
        return;
      }
      
      const processedCompany = {
        ...updatedCompany,
        lastVisit: updatedCompany.lastVisit instanceof Date ? 
                  updatedCompany.lastVisit : 
                  new Date(updatedCompany.lastVisit || Date.now())
      };
      
      setRecentVisitors(prev => {
        const filtered = prev.filter(c => c?.id !== processedCompany.id);
        const updated = [processedCompany, ...filtered].slice(0, 8);
        return updated;
      });
      
      setOnlineCount(prev => Math.max(1, prev + Math.floor(Math.random() * 3) - 1));
    });

    setOnlineCount(Math.floor(Math.random() * 5) + 3);

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  useEffect(() => {
    applyLocalFiltering();
  }, [applyLocalFiltering]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'hot': return 'bg-red-500';
      case 'warm': return 'bg-yellow-500';
      case 'cold': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const resetFilters = () => {
    setStatusFilter('all');
    setIndustryFilter('all');
    setSearchTerm('');
  };

  return (
    <div className="space-y-4">
      {/* Online Stats Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            {t('liveVisitors.title')}
            <div className="ml-auto flex items-center gap-2">
              <Popover open={showFilters} onOpenChange={setShowFilters}>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Filter className="h-4 w-4 mr-1" />
                    {t('liveVisitors.filter')}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="font-medium text-sm">
                        {t('liveVisitors.statusFilter')}
                      </div>
                      <Select
                        value={statusFilter}
                        onValueChange={value => setStatusFilter(value as FilterStatus)}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder={t('liveVisitors.selectStatus')} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">{t('liveVisitors.allStatuses')}</SelectItem>
                          <SelectItem value="hot">{t('status.hot')}</SelectItem>
                          <SelectItem value="warm">{t('status.warm')}</SelectItem>
                          <SelectItem value="cold">{t('status.cold')}</SelectItem>
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
            {t('liveVisitors.recentVisitors')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {filteredVisitors?.length > 0 ? 
              filteredVisitors
                .filter(company => company) // FIXED: Filter out any null/undefined
                .map((company, index) => (
                <div key={`visitor-${company?.id || index}-${Date.now()}`} className="flex flex-col p-2 rounded-lg hover:bg-muted/50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="text-xs">
                            {getAvatarInitials(company)}
                          </AvatarFallback>
                        </Avatar>
                        <div className={`absolute -top-1 -right-1 w-3 h-3 rounded-full ${getStatusColor(company?.status || 'cold')}`}></div>
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="font-medium text-sm truncate">{company?.name || company?.domain || 'Unknown'}</div>
                        <div className="text-xs text-muted-foreground">{company?.industry || 'Unknown'}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {company?.lastVisit ? format(company.lastVisit, 'HH:mm') : 'Unknown'}
                      </div>
                      <Badge variant="outline" className="text-xs mt-1">
                        {company?.totalVisits || 0} {t('liveVisitors.visits')}
                      </Badge>
                    </div>
                  </div>
                  
                  {/* Contact Information */}
                  <div className="mt-2 grid grid-cols-1 gap-1 text-xs text-muted-foreground">
                    {company?.website && (
                      <div className="flex items-center gap-1 overflow-hidden">
                        <span className="font-medium">🌐</span>
                        <a href={company.website?.startsWith?.('http') ? company.website : `https://${company.website}`} 
                           target="_blank" 
                           rel="noopener noreferrer"
                           className="truncate hover:text-primary">
                          {company.website}
                        </a>
                      </div>
                    )}
                    {company?.email && (
                      <div className="flex items-center gap-1 overflow-hidden">
                        <span className="font-medium">📧</span>
                        <a href={`mailto:${company.email}`} 
                           className="truncate hover:text-primary">
                          {company.email}
                        </a>
                      </div>
                    )}
                    {company?.phone && (
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
                <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>{t('liveVisitors.noVisitors')}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
