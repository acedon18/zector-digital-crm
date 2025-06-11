import { useState, useEffect, useCallback } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Download, Filter, Search, Eye, Star, MapPin, Clock } from 'lucide-react';
import { Company } from '@/types/leads';
import { leadsApi } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const LeadTracking = () => {  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [industryFilter, setIndustryFilter] = useState<string>('all');
  const { toast } = useToast();
  const { t } = useTranslation();const loadCompanies = useCallback(async () => {
    try {
      setLoading(true);
      const filters: { status?: string; industry?: string } = {};
      if (statusFilter && statusFilter !== 'all') filters.status = statusFilter;
      if (industryFilter && industryFilter !== 'all') filters.industry = industryFilter;
      
      const data = await leadsApi.getCompanies(filters);
      setCompanies(data);
    } catch (error) {      toast({
        title: t('common.error'),
        description: t('toast.exportFailedDescription'),
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  }, [statusFilter, industryFilter, toast, t]);

  useEffect(() => {
    loadCompanies();
  }, [loadCompanies]);

  const handleExport = async () => {
    try {
      const blob = await leadsApi.exportCompanies('csv');
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `companies_${format(new Date(), 'yyyy-MM-dd')}.csv`;
      a.click();
      URL.revokeObjectURL(url);
        toast({
        title: t('toast.exportCompleted'),
        description: t('toast.exportDescription')
      });
    } catch (error) {
      toast({
        title: 'Export misslyckades',
        description: 'Kunde inte exportera data',
        variant: 'destructive'
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'hot': return 'bg-red-100 text-red-800 border-red-200';
      case 'warm': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'cold': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };
  const getStatusText = (status: string) => {
    switch (status) {
      case 'hot': return t('leadTracking.status.hot');
      case 'warm': return t('leadTracking.status.warm');
      case 'cold': return t('leadTracking.status.cold');
      default: return status;
    }
  };

  const filteredCompanies = companies.filter(company =>
    company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    company.domain.toLowerCase().includes(searchTerm.toLowerCase()) ||
    company.industry.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">          <div>
            <h1 className="text-2xl font-bold tracking-tight">{t('leadTracking.title')}</h1>
            <p className="text-muted-foreground">
              {t('leadTracking.description')}
            </p>
          </div>
          <Button onClick={handleExport} className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            {t('leadTracking.exportCSV')}
          </Button>
        </div>

        {/* Filter och sök */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />                  <Input
                    placeholder={t('placeholders.companyDomainIndustry')}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder={t('common.status')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alla statusar</SelectItem>
                  <SelectItem value="hot">{t('leadTracking.status.hot')}</SelectItem>
                  <SelectItem value="warm">{t('leadTracking.status.warm')}</SelectItem>
                  <SelectItem value="cold">{t('leadTracking.status.cold')}</SelectItem>
                </SelectContent>
              </Select>
              <Select value={industryFilter} onValueChange={setIndustryFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder={t('common.industry')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alla branscher</SelectItem>
                  <SelectItem value="Technology">Teknik</SelectItem>
                  <SelectItem value="Financial Services">Finansiella tjänster</SelectItem>
                  <SelectItem value="Manufacturing">Tillverkning</SelectItem>
                  <SelectItem value="Retail">Detaljhandel</SelectItem>
                  <SelectItem value="Healthcare">Sjukvård</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Företagslista */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Identifierade företag ({filteredCompanies.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Företag</TableHead>
                    <TableHead>Bransch</TableHead>
                    <TableHead>Plats</TableHead>
                    <TableHead>Senaste besök</TableHead>
                    <TableHead>Besök</TableHead>
                    <TableHead>Poäng</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCompanies.map((company) => (
                    <TableRow key={company.id} className="hover:bg-muted/50">                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback>
                              {company.name.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <Link 
                              to={`/company/${company.id}`}
                              className="font-medium hover:text-primary hover:underline"
                            >
                              {company.name}
                            </Link>
                            <div className="text-sm text-muted-foreground">{company.domain}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{company.industry}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm">
                          <MapPin className="h-3 w-3" />
                          {company.location.city}, {company.location.country}
                        </div>
                      </TableCell>                      <TableCell>
                        <div className="flex items-center gap-1 text-sm">
                          <Clock className="h-3 w-3" />
                          {format(company.lastVisit, 'PPp')}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{company.totalVisits}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          <span className="font-medium">{company.score}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(company.status)}>
                          {getStatusText(company.status)}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default LeadTracking;
