import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
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
  const { id } = useParams();
  const navigate = useNavigate();
  const [company, setCompany] = useState<Company | null>(null);
  const [visits, setVisits] = useState<Visit[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCompanyData = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const companies = await leadsApi.getCompanies();
        const foundCompany = companies.find(c => c.id === id);
        
        if (foundCompany) {
          setCompany(foundCompany);
          
          // Mock visits data för demonstration
          const mockVisits: Visit[] = [
            {
              id: '1',
              companyId: id,
              timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
              pageUrl: '/produkter',
              referrer: 'google.com',
              duration: 180,
              pagesViewed: 3
            },
            {
              id: '2',
              companyId: id,
              timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
              pageUrl: '/priser',
              referrer: 'linkedin.com',
              duration: 420,
              pagesViewed: 7
            },
            {
              id: '3',
              companyId: id,
              timestamp: new Date(Date.now() - 48 * 60 * 60 * 1000),
              pageUrl: '/',
              referrer: 'direct',
              duration: 90,
              pagesViewed: 2
            }
          ];
          setVisits(mockVisits);
        }
      } catch (error) {
        console.error('Failed to load company data:', error);
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

  if (!company) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-4">Företaget hittades inte</h2>
          <Button onClick={() => navigate('/lead-tracking')}>
            Tillbaka till leads
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
    visit: `Besök ${visits.length - index}`,
    duration: visit.duration,
    pages: visit.pagesViewed,
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
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" onClick={() => navigate('/lead-tracking')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Tillbaka till leads
          </Button>
        </div>

        {/* Company Overview */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-4">
                <Avatar className="h-16 w-16">
                  <AvatarFallback className="text-lg font-bold bg-primary/10">
                    {company.name.substring(0, 2).toUpperCase()}
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
                    </div>
                    <div className="flex items-center space-x-1">
                      <MapPin className="h-4 w-4" />
                      <span>{company.location.city}, {company.location.country}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Users className="h-4 w-4" />
                      <span>{company.size} anställda</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 mt-3">
                    {company.tags.map((tag) => (
                      <Badge key={tag} variant="secondary">{tag}</Badge>
                    ))}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <Badge className={getStatusColor(company.status)}>
                  {company.status === 'hot' ? 'Het' : company.status === 'warm' ? 'Varm' : 'Kall'}
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
                <Eye className="h-5 w-5 text-blue-500" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Totala besök</p>
                  <p className="text-2xl font-bold">{company.totalVisits}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <Clock className="h-5 w-5 text-green-500" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Senaste besök</p>
                  <p className="text-2xl font-bold">
                    {format(company.lastVisit, 'dd/MM', { locale: sv })}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <Target className="h-5 w-5 text-orange-500" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Genomsnittlig tid</p>
                  <p className="text-2xl font-bold">
                    {visits.length > 0 
                      ? Math.round(visits.reduce((acc, v) => acc + v.duration, 0) / visits.length / 60)
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
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Sidor per besök</p>
                  <p className="text-2xl font-bold">
                    {visits.length > 0 
                      ? Math.round(visits.reduce((acc, v) => acc + v.pagesViewed, 0) / visits.length * 10) / 10
                      : 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Analytics */}
        <Tabs defaultValue="activity" className="space-y-4">
          <TabsList>
            <TabsTrigger value="activity">Aktivitet</TabsTrigger>
            <TabsTrigger value="engagement">Engagemang</TabsTrigger>
            <TabsTrigger value="timeline">Tidslinje</TabsTrigger>
            <TabsTrigger value="contact">Kontakt</TabsTrigger>
          </TabsList>

          <TabsContent value="activity" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Besökshistorik</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={visitData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="visit" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="duration" fill="#3b82f6" name="Tid (sekunder)" />
                    <Bar dataKey="pages" fill="#10b981" name="Sidor" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="engagement" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Populäraste sidor</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={engagementData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="visits" fill="#f59e0b" name="Besök" />
                    <Bar dataKey="avgTime" fill="#8b5cf6" name="Genomsnittlig tid (s)" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="timeline" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Besökstidslinje</CardTitle>
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
                          <h3 className="font-semibold">{visit.pageUrl}</h3>
                          <span className="text-sm text-muted-foreground">
                            {format(visit.timestamp, 'PPp', { locale: sv })}
                          </span>
                        </div>
                        <div className="flex items-center space-x-4 mt-1 text-sm text-muted-foreground">
                          <span>Källa: {visit.referrer}</span>
                          <span>Tid: {Math.round(visit.duration / 60)}m</span>
                          <span>Sidor: {visit.pagesViewed}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="contact" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Kontaktinformation</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold mb-3">Företagsdetaljer</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center space-x-2">
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                        <span>{company.name}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Globe className="h-4 w-4 text-muted-foreground" />
                        <span>{company.domain}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span>{company.location.city}, {company.location.country}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span>{company.size} anställda</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-3">Nästa steg</h3>
                    <div className="space-y-2">
                      <Button className="w-full justify-start">
                        <Mail className="h-4 w-4 mr-2" />
                        Skicka e-post
                      </Button>
                      <Button variant="outline" className="w-full justify-start">
                        <Phone className="h-4 w-4 mr-2" />
                        Ring upp
                      </Button>
                      <Button variant="outline" className="w-full justify-start">
                        <Calendar className="h-4 w-4 mr-2" />
                        Boka möte
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
