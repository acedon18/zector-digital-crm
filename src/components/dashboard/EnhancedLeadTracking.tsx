// Enhanced Lead Tracking with Platform Data Integration
import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Search,
  Filter,
  Download,
  Eye,
  TrendingUp,
  Users,
  Building2,
  Globe,
  Calendar,
  Target,
  Zap,
  BarChart3,
  RefreshCw
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Company } from '@/types/leads';
import { EnrichedLeadData } from '@/services/dataEnrichmentService';
import { PlatformType } from '@/types/integrations';
import { leadsApi } from '@/lib/api';
import { toast } from '@/components/ui/use-toast';
import { format } from 'date-fns';

interface EnhancedLeadTrackingProps {
  useEnrichedData?: boolean;
}

export const EnhancedLeadTracking: React.FC<EnhancedLeadTrackingProps> = ({ 
  useEnrichedData = true 
}) => {
  const { t } = useTranslation();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [enrichedCompanies, setEnrichedCompanies] = useState<EnrichedLeadData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');  const [industryFilter, setIndustryFilter] = useState<string>('all');
  const [scoreFilter, setScoreFilter] = useState<number>(0);
  const [selectedCompany, setSelectedCompany] = useState<Company | EnrichedLeadData | null>(null);
  const [viewMode, setViewMode] = useState<'standard' | 'enriched'>('enriched');

  const loadCompanies = useCallback(async () => {
    try {
      setLoading(true);
      
      if (useEnrichedData && viewMode === 'enriched') {
        const enrichedData = await leadsApi.getEnrichedCompanies({
          status: statusFilter !== 'all' ? statusFilter : undefined,
          industry: industryFilter !== 'all' ? industryFilter : undefined,
          minScore: scoreFilter > 0 ? scoreFilter : undefined,
        });
        setEnrichedCompanies(enrichedData);
      } else {
        const standardData = await leadsApi.getCompanies({
          status: statusFilter !== 'all' ? statusFilter : undefined,
          industry: industryFilter !== 'all' ? industryFilter : undefined,
          minScore: scoreFilter > 0 ? scoreFilter : undefined,
          enriched: false
        });
        setCompanies(standardData);
      }
    } catch (error) {
      console.error('Failed to load companies:', error);      toast({
        title: t('common.error'),
        description: 'Failed to load company data',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);    }
  }, [useEnrichedData, viewMode, statusFilter, industryFilter, scoreFilter, t]);

  useEffect(() => {
    loadCompanies();
  }, [loadCompanies]);

  const handleRefreshData = async () => {
    // Trigger new lead discovery from platforms
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
        await loadCompanies(); // Reload to include new leads
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
      const matchesSearch = company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          company.domain.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesSearch;
    });
  };

  const getCompanyFromItem = (item: Company | EnrichedLeadData): Company => {
    return 'company' in item ? item.company : item;
  };

  const getEnrichmentData = (item: Company | EnrichedLeadData) => {
    return 'platformData' in item ? item : null;
  };

  const getPlatformBadges = (enrichmentData: EnrichedLeadData | null) => {
    if (!enrichmentData?.platformData) return [];
    
    return Object.keys(enrichmentData.platformData).map(platform => ({
      platform: platform as PlatformType,
      lastSync: enrichmentData.platformData[platform as PlatformType]?.lastSync
    }));
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'bg-green-100 text-green-800';
    if (score >= 60) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'hot': return 'bg-red-100 text-red-800';
      case 'warm': return 'bg-orange-100 text-orange-800';
      case 'cold': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const displayData = getDisplayData();

  if (loading) {
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

      {/* Filters and Controls */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4 items-end">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search companies..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="hot">Hot</SelectItem>
                <SelectItem value="warm">Warm</SelectItem>
                <SelectItem value="cold">Cold</SelectItem>
              </SelectContent>
            </Select>

            <Select value={industryFilter} onValueChange={setIndustryFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Industry" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Industries</SelectItem>
                <SelectItem value="Technology">Technology</SelectItem>
                <SelectItem value="Healthcare">Healthcare</SelectItem>
                <SelectItem value="Finance">Finance</SelectItem>
                <SelectItem value="Manufacturing">Manufacturing</SelectItem>
              </SelectContent>
            </Select>

            <Select value={viewMode} onValueChange={(value: 'standard' | 'enriched') => setViewMode(value)}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="View Mode" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="enriched">Enriched Data</SelectItem>
                <SelectItem value="standard">Standard Data</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Companies</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{displayData.length}</div>
            <p className="text-xs text-muted-foreground">
              {viewMode === 'enriched' ? 'with platform data' : 'standard view'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Hot Leads</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {displayData.filter(item => getCompanyFromItem(item).status === 'hot').length}
            </div>
            <p className="text-xs text-muted-foreground">
              high priority prospects
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Score</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {displayData.length > 0 
                ? Math.round(displayData.reduce((sum, item) => sum + getCompanyFromItem(item).score, 0) / displayData.length)
                : 0
              }
            </div>
            <p className="text-xs text-muted-foreground">
              lead qualification score
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Platform Enhanced</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {viewMode === 'enriched' 
                ? enrichedCompanies.filter(e => e.enrichmentScore > 0).length
                : '0'
              }
            </div>
            <p className="text-xs text-muted-foreground">
              companies with platform data
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Companies List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Companies
            {viewMode === 'enriched' && (
              <Badge variant="secondary">Enhanced with Platform Data</Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {displayData.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No companies found matching your criteria.
            </div>
          ) : (
            <div className="space-y-4">
              {displayData.map((item) => {
                const company = getCompanyFromItem(item);
                const enrichmentData = getEnrichmentData(item);
                const platformBadges = getPlatformBadges(enrichmentData);

                return (
                  <div
                    key={company.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold">{company.name}</h3>
                        <Badge className={getStatusColor(company.status)}>
                          {company.status}
                        </Badge>
                        <Badge variant="outline" className={getScoreColor(company.score)}>
                          Score: {company.score}
                        </Badge>
                        {enrichmentData && (
                          <Badge variant="secondary">
                            Enrichment: {enrichmentData.enrichmentScore.toFixed(1)}
                          </Badge>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                        <span className="flex items-center gap-1">
                          <Globe className="h-4 w-4" />
                          {company.domain}
                        </span>
                        <span className="flex items-center gap-1">
                          <Building2 className="h-4 w-4" />
                          {company.industry}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          Last visit: {format(new Date(company.lastVisit), 'MMM d, yyyy')}
                        </span>
                        <span className="flex items-center gap-1">
                          <Eye className="h-4 w-4" />
                          {company.totalVisits} visits
                        </span>
                      </div>

                      {/* Platform Data Badges */}
                      {platformBadges.length > 0 && (
                        <div className="flex gap-2 mt-2">
                          {platformBadges.map(({ platform, lastSync }) => (
                            <Badge key={platform} variant="outline" className="text-xs">
                              {platform.replace('_', ' ')}
                              {lastSync && (
                                <span className="ml-1 text-muted-foreground">
                                  ({format(new Date(lastSync), 'MMM d')})
                                </span>
                              )}
                            </Badge>
                          ))}
                        </div>
                      )}

                      {/* Enrichment Summary */}
                      {enrichmentData && enrichmentData.enrichmentScore > 0 && (
                        <div className="mt-2 text-xs text-muted-foreground">
                          Platform insights: {Object.keys(enrichmentData.platformData).length} connected sources
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedCompany(item)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View Details
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl">
                          <DialogHeader>
                            <DialogTitle>{company.name} - Detailed View</DialogTitle>
                          </DialogHeader>
                          <CompanyDetailView company={company} enrichmentData={enrichmentData} />
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

// Company Detail View Component
const CompanyDetailView: React.FC<{
  company: Company;
  enrichmentData: EnrichedLeadData | null;
}> = ({ company, enrichmentData }) => {
  return (
    <div className="space-y-6">
      {/* Basic Information */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Company Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <span className="font-medium">Domain:</span> {company.domain}
            </div>
            <div>
              <span className="font-medium">Industry:</span> {company.industry}
            </div>
            <div>
              <span className="font-medium">Company Size:</span> {company.size}
            </div>
            <div>
              <span className="font-medium">Location:</span> {company.location.city}, {company.location.country}
            </div>
            <div>
              <span className="font-medium">Total Visits:</span> {company.totalVisits}
            </div>
            <div>
              <span className="font-medium">Lead Score:</span> {company.score}
            </div>
          </CardContent>
        </Card>

        {enrichmentData && (
          <Card>
            <CardHeader>
              <CardTitle>Platform Enrichment</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <span className="font-medium">Enrichment Score:</span> {enrichmentData.enrichmentScore.toFixed(1)}
              </div>
              <div>
                <span className="font-medium">Connected Platforms:</span> {Object.keys(enrichmentData.platformData).length}
              </div>
              <div>
                <span className="font-medium">Last Enriched:</span> {format(enrichmentData.lastEnriched, 'PPp')}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Platform Data */}
      {enrichmentData && Object.keys(enrichmentData.platformData).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Platform Data</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue={Object.keys(enrichmentData.platformData)[0]} className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                {Object.keys(enrichmentData.platformData).slice(0, 3).map(platform => (
                  <TabsTrigger key={platform} value={platform}>
                    {platform.replace('_', ' ').toUpperCase()}
                  </TabsTrigger>
                ))}
              </TabsList>
              
              {Object.entries(enrichmentData.platformData).map(([platform, data]) => (
                <TabsContent key={platform} value={platform} className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <h4 className="font-medium mb-2">Metrics</h4>
                      <div className="space-y-2 text-sm">
                        {data.metrics && Object.entries(data.metrics).map(([key, value]) => (
                          <div key={key}>
                            <span className="font-medium">{key}:</span> {String(value)}
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Last Sync</h4>
                      <p className="text-sm text-muted-foreground">
                        {format(data.lastSync, 'PPp')}
                      </p>
                    </div>
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </CardContent>
        </Card>
      )}

      {/* Tags */}
      <Card>
        <CardHeader>
          <CardTitle>Tags</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {company.tags.map((tag, index) => (
              <Badge key={index} variant="outline">
                {tag}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
