import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Globe, BarChart3, Users, Clock, Eye, TrendingUp, MapPin } from 'lucide-react';
import { Analytics } from '@/types/leads';
import { leadsApi } from '@/lib/api';
import { toast } from '@/components/ui/use-toast';
import { useTranslation } from 'react-i18next';

const WebsiteIntelligence = () => {
  const { t } = useTranslation();  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('7d');

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const data = await leadsApi.getAnalytics(timeRange);
      setAnalytics(data);
    } catch (error) {
      toast({
        title: t('common.error'),
        description: t('websiteIntelligence.couldNotLoadAnalytics'),
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, [timeRange]);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

  if (loading || !analytics) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">          <div>
            <h1 className="text-2xl font-bold tracking-tight">{t('websiteIntelligence.title')}</h1>
            <p className="text-muted-foreground">
              {t('websiteIntelligence.description')}
            </p>
          </div>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>            <SelectContent>
              <SelectItem value="1d">{t('websiteIntelligence.lastDay')}</SelectItem>
              <SelectItem value="7d">{t('websiteIntelligence.lastWeek')}</SelectItem>
              <SelectItem value="30d">{t('websiteIntelligence.lastMonth')}</SelectItem>
              <SelectItem value="90d">{t('websiteIntelligence.lastQuarter')}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <Users className="h-8 w-8 text-blue-600" />                <div>
                  <p className="text-2xl font-bold">{analytics.totalVisitors}</p>
                  <p className="text-xs text-muted-foreground">{t('websiteIntelligence.totalVisitors')}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-8 w-8 text-green-600" />
                <div>
                  <p className="text-2xl font-bold">{analytics.newCompanies}</p>
                  <p className="text-xs text-muted-foreground">{t('websiteIntelligence.newCompanies')}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <Eye className="h-8 w-8 text-purple-600" />
                <div>
                  <p className="text-2xl font-bold">{analytics.returningCompanies}</p>
                  <p className="text-xs text-muted-foreground">{t('websiteIntelligence.returningCompanies')}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <Globe className="h-8 w-8 text-red-600" />
                <div>
                  <p className="text-2xl font-bold">{analytics.hotLeads}</p>
                  <p className="text-xs text-muted-foreground">{t('websiteIntelligence.hotLeads')}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Pages */}
          <Card>            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                {t('websiteIntelligence.topPages')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.topPages.map((page, index) => (
                  <div key={page.url} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div className="flex-1">
                      <div className="font-medium text-sm">{page.title}</div>
                      <div className="text-xs text-muted-foreground">{page.url}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold">{page.visits}</div>
                      <div className="text-xs text-muted-foreground">{page.uniqueCompanies} {t('websiteIntelligence.companies')}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Traffic Sources */}
          <Card>            <CardHeader>
              <CardTitle>{t('websiteIntelligence.trafficSources')}</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={analytics.trafficSources}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="visits"
                    label={({ source, percentage }) => `${source} (${percentage}%)`}
                  >
                    {analytics.trafficSources.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Industry Breakdown */}
        <Card>          <CardHeader>
            <CardTitle>{t('websiteIntelligence.industryBreakdown')}</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={analytics.industryBreakdown}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="industry" />
                <YAxis />                <Tooltip 
                  formatter={(value: number, name: string) => [
                    `${value} ${t('websiteIntelligence.companies')} (${analytics.industryBreakdown.find(i => i.count === value)?.percentage}%)`,
                    t('websiteIntelligence.count')
                  ]}
                />
                <Bar dataKey="count" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Traffic Sources Table */}
        <Card>          <CardHeader>
            <CardTitle>{t('websiteIntelligence.detailedTrafficAnalysis')}</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('websiteIntelligence.source')}</TableHead>
                  <TableHead>{t('websiteIntelligence.visits')}</TableHead>
                  <TableHead>{t('websiteIntelligence.share')}</TableHead>
                  <TableHead>{t('websiteIntelligence.trend')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {analytics.trafficSources.map((source, index) => (
                  <TableRow key={source.source}>
                    <TableCell className="font-medium">{source.source}</TableCell>
                    <TableCell>{source.visits}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{source.percentage}%</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-green-600 text-sm">
                        <TrendingUp className="h-3 w-3" />
                        +{Math.floor(Math.random() * 20) + 5}%
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default WebsiteIntelligence;
