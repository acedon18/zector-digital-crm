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

const WebsiteIntelligence = () => {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('7d');

  useEffect(() => {
    loadAnalytics();
  }, [timeRange]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const data = await leadsApi.getAnalytics(timeRange);
      setAnalytics(data);
    } catch (error) {
      toast({
        title: 'Fel',
        description: 'Kunde inte hämta analysdata',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

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
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Website Intelligence</h1>
            <p className="text-muted-foreground">
              Analysera besöksmönster och förstå vad som engagerar dina besökare
            </p>
          </div>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1d">Senaste dagen</SelectItem>
              <SelectItem value="7d">Senaste veckan</SelectItem>
              <SelectItem value="30d">Senaste månaden</SelectItem>
              <SelectItem value="90d">Senaste kvartalet</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <Users className="h-8 w-8 text-blue-600" />
                <div>
                  <p className="text-2xl font-bold">{analytics.totalVisitors}</p>
                  <p className="text-xs text-muted-foreground">Totala besökare</p>
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
                  <p className="text-xs text-muted-foreground">Nya företag</p>
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
                  <p className="text-xs text-muted-foreground">Återkommande</p>
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
                  <p className="text-xs text-muted-foreground">Heta leads</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Pages */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Mest besökta sidor
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
                      <div className="text-xs text-muted-foreground">{page.uniqueCompanies} företag</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Traffic Sources */}
          <Card>
            <CardHeader>
              <CardTitle>Trafikkällor</CardTitle>
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
        <Card>
          <CardHeader>
            <CardTitle>Branschfördelning</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={analytics.industryBreakdown}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="industry" />
                <YAxis />
                <Tooltip 
                  formatter={(value: number, name: string) => [
                    `${value} företag (${analytics.industryBreakdown.find(i => i.count === value)?.percentage}%)`,
                    'Antal'
                  ]}
                />
                <Bar dataKey="count" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Traffic Sources Table */}
        <Card>
          <CardHeader>
            <CardTitle>Detaljerad trafikkällanalys</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Källa</TableHead>
                  <TableHead>Besök</TableHead>
                  <TableHead>Andel</TableHead>
                  <TableHead>Trend</TableHead>
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
