// SAFETY FIXED: 2025-06-25 22:00:00 - CompanyProfile component improvements
// Fixed type safety, null checks, and comprehensive error handling
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { 
  ArrowLeft, 
  Building2, 
  MapPin, 
  Users, 
  Calendar, 
  Clock, 
  Globe, 
  Mail, 
  Phone,
  Star,
  TrendingUp,
  Eye,
  Target
} from 'lucide-react';
import { Company, Visit } from '@/types/leads';
import { leadsApi } from '@/lib/api';
import { format } from 'date-fns';
import { sv } from 'date-fns/locale';

export default function CompanyProfile() {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const [company, setCompany] = useState<Company | null>(null);
  const [visits, setVisits] = useState<Visit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // SAFETY: Validate required hooks and params
  if (!t || typeof t !== 'function') {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-4">Translation Error</h2>
          <p className="text-muted-foreground">Unable to load translations</p>
        </div>
      </DashboardLayout>
    );
  }

  if (!id || typeof id !== 'string') {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-4">Invalid Company ID</h2>
          <Button onClick={() => navigate('/lead-tracking')}>
            Back to Leads
          </Button>
        </div>
      </DashboardLayout>
    );
  }
  useEffect(() => {
    const loadCompanyData = async () => {
      if (!id) {
        setError('No company ID provided');
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        setError(null);
        
        const companies = await leadsApi.getCompanies();
        if (!Array.isArray(companies)) {
          throw new Error('Invalid company data received');
        }
        
        const foundCompany = companies.find(c => c && c.id === id);
        
        if (foundCompany) {
          setCompany(foundCompany);
          
          // Mock visits data for demonstration - SAFE
          const mockVisits: Visit[] = [
            {
              id: '1',
              companyId: id,
              timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
              ipAddress: '192.168.1.1',
              userAgent: 'Mozilla/5.0...',
              referrer: 'google.com',
              pages: [
                {
                  id: '1',
                  url: '/products',
                  title: 'Products Page',
                  timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
                  timeOnPage: 180,
                  scrollDepth: 75,
                  interactions: 3
                }
              ],
              sessionDuration: 180,
              isReturning: false
            },
            {
              id: '2',
              companyId: id,
              timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
              ipAddress: '192.168.1.1',
              userAgent: 'Mozilla/5.0...',
              referrer: 'linkedin.com',
              pages: [
                {
                  id: '2',
                  url: '/pricing',
                  title: 'Pricing Page',
                  timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
                  timeOnPage: 420,
                  scrollDepth: 90,
                  interactions: 7
                }
              ],
              sessionDuration: 420,
              isReturning: true
            },
            {
              id: '3',
              companyId: id,
              timestamp: new Date(Date.now() - 48 * 60 * 60 * 1000),
              ipAddress: '192.168.1.1',
              userAgent: 'Mozilla/5.0...',
              referrer: 'direct',
              pages: [
                {
                  id: '3',
                  url: '/',
                  title: 'Home Page',
                  timestamp: new Date(Date.now() - 48 * 60 * 60 * 1000),
                  timeOnPage: 90,
                  scrollDepth: 50,
                  interactions: 2
                }
              ],
              sessionDuration: 90,
              isReturning: false
            }
          ];
          setVisits(mockVisits);
        } else {
          setError('Company not found');
        }
      } catch (error) {
        console.error('Failed to load company data:', error);
        setError(error instanceof Error ? error.message : 'Failed to load company data');
      } finally {
        setLoading(false);
      }
    };

    loadCompanyData();
  }, [id]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }
  if (error) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-4">Error</h2>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={() => navigate('/lead-tracking')}>
            {t('companyProfile.backToLeads')}
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  if (!company) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-4">{t('companyProfile.companyNotFound')}</h2>
          <Button onClick={() => navigate('/lead-tracking')}>
            {t('companyProfile.backToLeads')}
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'hot': return 'bg-red-500 text-white';
      case 'warm': return 'bg-orange-500 text-white';
      case 'cold': return 'bg-blue-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };
  const visitData = visits.map((visit, index) => ({
    visit: `${t('companyProfile.visit')} ${visits.length - index}`,
    duration: visit.sessionDuration,
    pages: visit.pages.length,
    date: format(visit.timestamp, 'dd/MM', { locale: sv })
  }));

  const engagementData = [
    { name: 'Startsida', visits: 12, avgTime: 45 },
    { name: 'Produkter', visits: 8, avgTime: 180 },
    { name: 'Priser', visits: 5, avgTime: 240 },
    { name: 'Kontakt', visits: 3, avgTime: 90 },
    { name: 'Om oss', visits: 2, avgTime: 120 }
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center space-x-4">          <Button variant="ghost" size="sm" onClick={() => navigate('/lead-tracking')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t('companyProfile.backToLeads')}
          </Button>
        </div>

        {/* Company Overview */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">              <div className="flex items-start space-x-4">
                <Avatar className="h-16 w-16">
                  <AvatarFallback className="text-lg font-bold bg-primary/10">
                    {(() => {
                      const name = company?.name;
                      if (name && typeof name === 'string' && name.trim().length > 0) {
                        return name.trim().substring(0, 2).toUpperCase();
                      }
                      return 'UN';
                    })()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h1 className="text-2xl font-bold">{company.name}</h1>
                  <div className="flex items-center space-x-4 mt-2 text-muted-foreground">
                    <div className="flex items-center space-x-1">
                      <Globe className="h-4 w-4" />
                      <span>{company.domain}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Building2 className="h-4 w-4" />
                      <span>{company.industry}</span>
                    </div>                    <div className="flex items-center space-x-1">
                      <MapPin className="h-4 w-4" />
                      <span>
                        {company.location?.city && company.location?.country 
                          ? `${company.location.city}, ${company.location.country}`
                          : 'Location not available'
                        }
                      </span>
                    </div><div className="flex items-center space-x-1">
                      <Users className="h-4 w-4" />
                      <span>{company.size} {t('common.employees')}</span>
                    </div>
                  </div>                  <div className="flex items-center space-x-2 mt-3">
                    {company.tags && Array.isArray(company.tags) && company.tags.map((tag) => (
                      <Badge key={tag} variant="secondary">{tag}</Badge>
                    ))}
                  </div>
                </div>
              </div>              <div className="text-right">
                <Badge className={getStatusColor(company.status || 'cold')}>
                  {company.status === 'hot' ? t('status.hot') : company.status === 'warm' ? t('status.warm') : t('status.cold')}
                </Badge>
                <div className="flex items-center space-x-1 mt-2">
                  <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                  <span className="font-bold text-lg">{company.score}</span>
                  <span className="text-muted-foreground">/100</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <Eye className="h-5 w-5 text-blue-500" />                <div>
                  <p className="text-sm font-medium text-muted-foreground">{t('companyProfile.totalVisits')}</p>
                  <p className="text-2xl font-bold">{company.totalVisits}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <Clock className="h-5 w-5 text-green-500" />                <div>
                  <p className="text-sm font-medium text-muted-foreground">{t('companyProfile.lastVisit')}</p>                  <p className="text-2xl font-bold">
                    {company.lastVisit 
                      ? format(company.lastVisit, 'dd/MM', { locale: sv })
                      : 'N/A'
                    }
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <Target className="h-5 w-5 text-orange-500" />
                <div>                  <p className="text-sm font-medium text-muted-foreground">{t('companyProfile.averageTime')}</p>
                  <p className="text-2xl font-bold">
                    {visits.length > 0 
                      ? Math.round(visits.reduce((acc, v) => acc + v.sessionDuration, 0) / visits.length / 60)
                      : 0}m
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5 text-purple-500" />
                <div>                  <p className="text-sm font-medium text-muted-foreground">{t('companyProfile.pagesPerVisit')}</p>
                  <p className="text-2xl font-bold">
                    {visits.length > 0 
                      ? Math.round(visits.reduce((acc, v) => acc + v.pages.length, 0) / visits.length * 10) / 10
                      : 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>        {/* Detailed Analytics */}
        <Tabs defaultValue="activity" className="space-y-4">
          <TabsList>
            <TabsTrigger value="activity">{t('companyProfile.activity')}</TabsTrigger>
            <TabsTrigger value="engagement">{t('companyProfile.engagement')}</TabsTrigger>
            <TabsTrigger value="timeline">{t('companyProfile.timeline')}</TabsTrigger>
            <TabsTrigger value="contact">{t('companyProfile.contact')}</TabsTrigger>
          </TabsList>

          <TabsContent value="activity" className="space-y-4">
            <Card>              <CardHeader>
                <CardTitle>{t('companyProfile.visitHistory')}</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={visitData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="visit" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="duration" fill="#3b82f6" name={t('companyProfile.timeSeconds')} />
                    <Bar dataKey="pages" fill="#10b981" name={t('companyProfile.pages')} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="engagement" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>{t('companyProfile.popularPages')}</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={engagementData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />                    <Bar dataKey="visits" fill="#f59e0b" name={t('analytics.visits')} />
                    <Bar dataKey="avgTime" fill="#8b5cf6" name={t('analytics.avgTime')} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="timeline" className="space-y-4">
            <Card>              <CardHeader>
                <CardTitle>{t('companyProfile.visitTimeline')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {visits.map((visit) => (
                    <div key={visit.id} className="flex items-start space-x-4 p-4 border rounded-lg">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                        <Eye className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold">{visit.pages[0]?.url || '/'}</h3>
                          <span className="text-sm text-muted-foreground">
                            {format(visit.timestamp, 'PPp', { locale: sv })}
                          </span>
                        </div>
                        <div className="flex items-center space-x-4 mt-1 text-sm text-muted-foreground">
                          <span>{t('companyProfile.source')}: {visit.referrer}</span>
                          <span>{t('companyProfile.time')}: {Math.round(visit.sessionDuration / 60)}m</span>
                          <span>{t('companyProfile.pages')}: {visit.pages.length}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>          <TabsContent value="contact" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>{t('companyProfile.contactInfo')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold mb-3">{t('companyProfile.companyDetails')}</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center space-x-2">
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                        <span>{company.name}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Globe className="h-4 w-4 text-muted-foreground" />
                        <span>{company.domain}</span>
                      </div>                      <div className="flex items-center space-x-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span>
                          {company.location?.city && company.location?.country 
                            ? `${company.location.city}, ${company.location.country}`
                            : 'Location not available'
                          }
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span>{company.size} {t('companyProfile.employees')}</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-3">{t('companyProfile.nextSteps')}</h3>
                    <div className="space-y-2">
                      <Button className="w-full justify-start">
                        <Mail className="h-4 w-4 mr-2" />
                        {t('companyProfile.sendEmail')}
                      </Button>
                      <Button variant="outline" className="w-full justify-start">
                        <Phone className="h-4 w-4 mr-2" />
                        {t('companyProfile.callUp')}
                      </Button>
                      <Button variant="outline" className="w-full justify-start">
                        <Calendar className="h-4 w-4 mr-2" />
                        {t('companyProfile.bookMeeting')}
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
