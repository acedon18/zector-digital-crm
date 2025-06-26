// EMERGENCY DEPLOYMENT 2025-06-25 21:40:00 - FORCE NEW BUNDLE HASH v4
// CRITICAL: Vercel still serving old bundle LiveVisitors-Qlpjt7JQ.js
// THIS FIXED VERSION should generate NEW bundle hash to replace old one
// All substring operations are now BULLETPROOF with null safety checks - ULTRA SAFE VERSION v4

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
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import SafetyWrapper from '@/components/SafetyWrapper';

// Types for filters
type FilterStatus = 'all' | 'hot' | 'warm' | 'cold';
type FilterIndustry = 'all' | string;
type SortOption = 'lastVisit' | 'score' | 'totalVisits';

export const LiveVisitors = () => {  console.log('🚀 LiveVisitors: EMERGENCY DEPLOYMENT v4 - 21:40 - FORCE NEW BUNDLE HASH');
  console.log('🛡️ ULTRA BULLETPROOF VERSION v4: All substring operations secured with triple safety');
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
  // BULLETPROOF avatar initials function - ULTRA SAFE VERSION 21:30
  const getAvatarInitials = useCallback((company: any): string => {
    // First level safety check
    if (!company || typeof company !== 'object' || company === null) {
      return 'UN';
    }
    
    // Extract values with ultra-safe checks
    let name = null;
    let domain = null;
    
    try {
      name = company.name;
      domain = company.domain;
    } catch (error) {
      console.warn('Error accessing company properties:', error);
      return 'UN';
    }
    
    // Try name first with bulletproof checks
    if (name !== null && name !== undefined && typeof name === 'string') {
      try {
        const trimmedName = name.trim();
        if (trimmedName && trimmedName.length > 0) {
          // Ultra-safe substring
          if (trimmedName.length >= 2) {
            return trimmedName.substring(0, 2).toUpperCase();
          } else if (trimmedName.length === 1) {
            return (trimmedName + 'N').toUpperCase();
          }
        }
      } catch (error) {
        console.warn('Error processing company name for initials:', error, { name, company });
      }
    }
    
    // Try domain as fallback with bulletproof checks
    if (domain !== null && domain !== undefined && typeof domain === 'string') {
      try {
        const trimmedDomain = domain.trim();
        if (trimmedDomain && trimmedDomain.length > 0) {
          // Ultra-safe substring
          if (trimmedDomain.length >= 2) {
            return trimmedDomain.substring(0, 2).toUpperCase();
          } else if (trimmedDomain.length === 1) {
            return (trimmedDomain + 'D').toUpperCase();
          }
        }
      } catch (error) {
        console.warn('Error processing company domain for initials:', error, { domain, company });
      }
    }
    
    // Final fallback
    return 'UN';
  }, []);

  // BULLETPROOF string operations
  const safeStringOp = useCallback((str: any, operation: 'toLowerCase' | 'includes' | 'substring', param?: any): any => {
    if (!str || typeof str !== 'string') {
      return operation === 'includes' ? false : '';
    }
    
    try {
      switch (operation) {
        case 'toLowerCase':
          return str.toLowerCase();
        case 'includes':
          return str.toLowerCase().includes((param || '').toLowerCase());
        case 'substring':
          return str.substring(param || 0, param + 2 || 2);
        default:
          return str;
      }
    } catch (error) {
      console.warn(`Safe string operation ${operation} failed:`, error);
      return operation === 'includes' ? false : '';
    }
  }, []);

  const loadRecentVisitors = useCallback(async () => {
    try {
      console.log('Loading recent visitors from API...');
      const visitors = await leadsApi.getRecentVisitors(15);
      console.log('Received visitors:', visitors);
      
      // BULLETPROOF filtering and processing
      const processedVisitors = (Array.isArray(visitors) ? visitors : [])
        .filter((visitor: any) => {
          return visitor && 
                 typeof visitor === 'object' && 
                 (visitor.id || visitor.name || visitor.domain) &&
                 visitor !== null;
        })
        .map((visitor: any) => ({
          ...visitor,
          lastVisit: visitor.lastVisit instanceof Date ? 
                    visitor.lastVisit : 
                    (visitor.lastVisit ? new Date(visitor.lastVisit) : new Date())
        }));
      
      setRecentVisitors(processedVisitors);
      
      // Extract unique industries for filters with safety checks
      const uniqueIndustries = [...new Set(
        processedVisitors
          .filter(c => c && c.industry && typeof c.industry === 'string')
          .map(c => c.industry)
      )].filter(Boolean) as string[];
      
      setIndustries(uniqueIndustries);
    } catch (error) {
      console.error('Could not fetch recent visitors:', error);
      setRecentVisitors([]);
    }
  }, []);

  // Apply filters locally with BULLETPROOF safety
  const applyLocalFiltering = useCallback(() => {
    if (!Array.isArray(recentVisitors)) {
      setFilteredVisitors([]);
      return;
    }

    let filtered = [...recentVisitors];
    
    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(company => company && company.status === statusFilter);
    }
    
    // Filter by industry
    if (industryFilter !== 'all') {
      filtered = filtered.filter(company => company && company.industry === industryFilter);
    }
    
    // Search term filtering with BULLETPROOF string operations
    if (searchTerm && searchTerm.trim()) {
      const term = searchTerm.toLowerCase().trim();
      filtered = filtered.filter(company => {
        if (!company) return false;
        
        const companyName = safeStringOp(company.name, 'toLowerCase');
        const companyDomain = safeStringOp(company.domain, 'toLowerCase');
        const companyEmail = safeStringOp(company.email, 'toLowerCase');
        const companyWebsite = safeStringOp(company.website, 'toLowerCase');
        
        return safeStringOp(companyName, 'includes', term) ||
               safeStringOp(companyDomain, 'includes', term) ||
               safeStringOp(companyEmail, 'includes', term) ||
               safeStringOp(companyWebsite, 'includes', term);
      });
    }
    
    // Sort results with safety checks
    const sortedResults = [...filtered];
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
          const aTime = a?.lastVisit?.getTime ? a.lastVisit.getTime() : 0;
          const bTime = b?.lastVisit?.getTime ? b.lastVisit.getTime() : 0;
          return bTime - aTime;
        });
    }
    
    setFilteredVisitors(sortedResults);
  }, [recentVisitors, statusFilter, industryFilter, searchTerm, sortBy, safeStringOp]);

  // Function to fetch filtered companies from the API with fallback
  const fetchFilteredCompanies = useCallback(async () => {
    if (!Array.isArray(recentVisitors) || recentVisitors.length === 0) {
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
        
        // BULLETPROOF processing of API response
        const processedCompanies = (Array.isArray(filteredCompanies) ? filteredCompanies : [])
          .filter(company => company && typeof company === 'object')
          .map(company => ({
            ...company,
            lastVisit: company.lastVisit instanceof Date ? 
                      company.lastVisit : 
                      (company.lastVisit ? new Date(company.lastVisit) : new Date())
          }));
          
        setFilteredVisitors(processedCompanies);
        return;
      }
      
      // If no filters applied, just sort the recent visitors
      applyLocalFiltering();
    } catch (error) {
      console.error('Error fetching filtered companies:', error);
      // Fall back to client-side filtering
      applyLocalFiltering();
    }
  }, [recentVisitors, statusFilter, industryFilter, searchTerm, sortBy, applyLocalFiltering]);

  useEffect(() => {
    loadRecentVisitors();
    
    // Subscribe to live updates
    const unsubscribe = subscribeToLiveUpdates((updatedCompany) => {
      // BULLETPROOF safety check for updatedCompany
      if (!updatedCompany || typeof updatedCompany !== 'object') {
        console.warn('Invalid company data received in live update:', updatedCompany);
        return;
      }
      
      // Ensure lastVisit is a Date object
      const processedCompany = {
        ...updatedCompany,
        lastVisit: updatedCompany.lastVisit instanceof Date ? 
                  updatedCompany.lastVisit : 
                  (updatedCompany.lastVisit ? new Date(updatedCompany.lastVisit) : new Date())
      };
      
      setRecentVisitors(prev => {
        if (!Array.isArray(prev)) return [processedCompany];
        
        const filtered = prev.filter(c => c && c.id !== processedCompany.id);
        const updated = [processedCompany, ...filtered].slice(0, 8);
        
        // Extract unique industries for filters with safety checks
        const uniqueIndustries = [...new Set(
          updated
            .filter(c => c && c.industry && typeof c.industry === 'string')
            .map(c => c.industry)
        )].filter(Boolean);
        
        setIndustries(uniqueIndustries);
        return updated;
      });
      
      // Simulate online counter
      setOnlineCount(prev => Math.max(1, prev + Math.floor(Math.random() * 3) - 1));
    });

    // Initial online count
    setOnlineCount(Math.floor(Math.random() * 20) + 5);

    return unsubscribe;
  }, [loadRecentVisitors]);
  
  // Apply filters whenever the filter state or original data changes
  useEffect(() => {
    fetchFilteredCompanies();
  }, [fetchFilteredCompanies]);

  const getStatusColor = useCallback((status: string) => {
    switch (status) {
      case 'hot': return 'bg-red-500';
      case 'warm': return 'bg-yellow-500';
      case 'cold': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  }, []);

  const getStatusName = useCallback((status: string) => {
    switch (status) {
      case 'hot': return t('status.hot');
      case 'warm': return t('status.warm');
      case 'cold': return t('status.cold');
      default: return status || 'Unknown';
    }
  }, [t]);

  const resetFilters = useCallback(() => {
    setStatusFilter('all');
    setIndustryFilter('all');
    setSearchTerm('');
    setSortBy('lastVisit');
    setShowFilters(false);
  }, []);
  return (
    <SafetyWrapper fallback={
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground">Live Visitors temporarily unavailable</p>
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-2" 
              onClick={() => window.location.reload()}
            >
              Refresh Page
            </Button>
          </CardContent>
        </Card>
      </div>
    }>
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
            {Array.isArray(filteredVisitors) && filteredVisitors.length > 0 ? (
              filteredVisitors
                .filter(company => {
                  // BULLETPROOF filtering - eliminate ALL invalid entries
                  return company && 
                         typeof company === 'object' && 
                         (company.id || company.name || company.domain) &&
                         company !== null;
                })                .map((company, index) => {
                  // ULTRA BULLETPROOF safety check inside map
                  if (!company || typeof company !== 'object' || company === null) {
                    return null;
                  }
                  
                  // Additional safety wrapper
                  try {
                    return (
                      <div key={`visitor-${company.id || index}-${Date.now()}-${Math.random()}`} className="flex flex-col p-3 rounded-lg hover:bg-muted/50 border border-muted/20">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="relative">
                              <Avatar className="h-10 w-10">
                                <AvatarFallback className="text-sm font-semibold">
                                  {getAvatarInitials(company)}
                                </AvatarFallback>
                              </Avatar>
                              <div className={`absolute -top-1 -right-1 w-3 h-3 rounded-full ${getStatusColor(company?.status || 'cold')}`}></div>
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="font-semibold text-sm truncate">
                                {company?.name || company?.domain || 'Unknown Company'}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {company?.industry || 'Unknown Industry'}
                              </div>
                              {/* Engagement Score and Status */}
                              <div className="flex items-center gap-2 mt-1">
                                {company?.score && (
                                  <Badge 
                                    variant={company.score > 60 ? "default" : company.score > 30 ? "secondary" : "outline"}
                                    className="text-xs px-1"
                                  >
                                    {company.score}% engaged
                                  </Badge>
                                )}
                                {company?.status && (
                                  <Badge 
                                    variant="outline"
                                    className={`text-xs px-1 ${
                                      company.status === 'hot' ? 'text-red-600 border-red-200' :
                                      company.status === 'warm' ? 'text-yellow-600 border-yellow-200' :
                                      'text-blue-600 border-blue-200'
                                    }`}
                                  >
                                    {company.status}
                                  </Badge>
                                )}
                              </div>
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
                        
                        {/* Enhanced Activity Information */}
                        <div className="mt-3 space-y-2">
                          {/* Recent Activity Summary */}
                          {company?.recentActivity && (
                            <div className="text-xs text-muted-foreground">
                              📊 {company.recentActivity}
                            </div>
                          )}
                          
                          {/* Visitor Tags */}
                          {company?.tags && company.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {company.tags.slice(0, 3).map((tag, tagIndex) => (
                                <Badge 
                                  key={tagIndex} 
                                  variant="secondary" 
                                  className="text-xs px-2 py-0"
                                >
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          )}
                          
                          {/* Session Information */}
                          {(company?.uniqueSessions || company?.avgDuration) && (
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              {company?.uniqueSessions && (
                                <span>🔄 {company.uniqueSessions} sessions</span>
                              )}
                              {company?.avgDuration && company.avgDuration > 0 && (
                                <span>⏱️ {Math.round(company.avgDuration / 60)}m avg</span>
                              )}
                            </div>
                          )}
                        </div>
                        
                        {/* Contact Information */}
                        <div className="mt-2 space-y-1 text-xs text-muted-foreground">
                          {company?.website && (
                            <div className="flex items-center gap-1 overflow-hidden">
                              <span className="font-medium">🌐</span>
                              <a 
                                href={company.website && typeof company.website === 'string' && company.website.startsWith('http') 
                                  ? company.website 
                                  : `https://${company.website || ''}`} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="truncate hover:text-primary"
                              >
                                {company.website}
                              </a>
                            </div>
                          )}
                          {company?.email && (
                            <div className="flex items-center gap-1 overflow-hidden">
                              <span className="font-medium">📧</span>
                              <a href={`mailto:${company.email}`} className="truncate hover:text-primary">
                                {company.email}
                              </a>
                            </div>
                          )}
                          {company?.phone && (
                            <div className="flex items-center gap-1 overflow-hidden">
                              <span className="font-medium">📞</span>
                              <a href={`tel:${company.phone}`} className="truncate hover:text-primary">
                                {company.phone}
                              </a>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  } catch (error) {
                    console.error('Error rendering company:', error, company);
                    return null;
                  }
                })
                .filter(Boolean) // Remove any null entries
            ) : (
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
          
          {(!Array.isArray(recentVisitors) || recentVisitors.length === 0) && (
            <div className="text-center text-muted-foreground py-8">
              <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>{t('liveVisitors.noVisitors')}</p>
            </div>
          )}        </CardContent>
      </Card>
      </div>
    </SafetyWrapper>
  );
};

export default LiveVisitors;
