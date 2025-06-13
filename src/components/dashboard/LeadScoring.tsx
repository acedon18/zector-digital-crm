import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Star, Settings, TrendingUp, Eye, Clock, Download, Phone } from 'lucide-react';
import { Company } from '@/types/leads';
import { leadsApi } from '@/lib/api';
import { toast } from '@/components/ui/use-toast';
import { useTranslation } from 'react-i18next';

interface ScoringRule {
  id: string;
  name: string;
  description: string;
  points: number;
  isActive: boolean;
  icon: React.ComponentType<{ className?: string }>;
}

export const LeadScoring = () => {
  const { t } = useTranslation();

  const defaultRules: ScoringRule[] = [
    {
      id: 'pricing-page',
      name: t('leadScoring.rules.visitedPricingPage', 'Visited pricing page'),
      description: t('leadScoring.rules.visitedPricingPageDesc', 'Companies that visited pricing page'),
      points: 25,
      isActive: true,
      icon: Star
    },
    {
      id: 'contact-page',
      name: t('leadScoring.rules.visitedContactPage', 'Visited contact page'),
      description: t('leadScoring.rules.visitedContactPageDesc', 'Companies that visited contact information'),
      points: 30,
      isActive: true,
      icon: Phone
    },
    {
      id: 'demo-page',
      name: t('leadScoring.rules.bookedDemo', 'Booked demo'),
      description: t('leadScoring.rules.bookedDemoDesc', 'Companies that showed interest in demo'),
      points: 40,
      isActive: true,
      icon: Eye
    },
    {
      id: 'multiple-visits',
      name: t('leadScoring.rules.multipleVisits', 'Multiple visits'),
      description: t('leadScoring.rules.multipleVisitsDesc', 'Visited the website multiple times'),
      points: 20,
      isActive: true,
      icon: TrendingUp
    },
    {
      id: 'long-session',
      name: t('leadScoring.rules.longSessions', 'Long sessions'),
      description: t('leadScoring.rules.longSessionsDesc', 'Session time over 5 minutes'),
      points: 15,
      isActive: true,
      icon: Clock
    },
    {
      id: 'downloaded-content',
      name: t('leadScoring.rules.downloadedContent', 'Downloaded content'),
      description: t('leadScoring.rules.downloadedContentDesc', 'Downloaded whitepaper, case studies etc'),
      points: 35,
      isActive: true,
      icon: Download
    }
  ];

  const [companies, setCompanies] = useState<Company[]>([]);
  const [rules, setRules] = useState<ScoringRule[]>(defaultRules);
  const [loading, setLoading] = useState(true);
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const loadCompanies = useCallback(async () => {    try {
      setLoading(true);
      const data = await leadsApi.getCompanies();
      setCompanies(data);
    } catch (error) {
      toast({
        title: t('common.error', 'Error'),
        description: t('could_not_fetch_companies', 'Could not fetch companies'),
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    loadCompanies();
  }, [loadCompanies]);

  const updateRule = (ruleId: string, updates: Partial<ScoringRule>) => {
    setRules(prev => prev.map(rule => 
      rule.id === ruleId ? { ...rule, ...updates } : rule
    ));
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-red-600 bg-red-50 border-red-200';
    if (score >= 60) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-blue-600 bg-blue-50 border-blue-200';
  };
  const getScoreLevel = (score: number) => {
    if (score >= 80) return t('status.hot');
    if (score >= 60) return t('status.warm');
    return t('status.cold');
  };

  const sortedCompanies = [...companies].sort((a, b) => b.score - a.score);
  const totalActivePoints = rules.filter(r => r.isActive).reduce((sum, r) => sum + r.points, 0);

  return (
    <div className="space-y-6">      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold">{t('leadScoring.title', 'Lead Scoring')}</h2>
          <p className="text-sm text-muted-foreground">
            {t('leadScoring.description', 'Automatic scoring based on visitor behavior')}
          </p>
        </div>
        <Dialog open={isConfigOpen} onOpenChange={setIsConfigOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4 mr-2" />
              {t('leadScoring.configureRules', 'Configure Rules')}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{t('leadScoring.configureScoringRules', 'Configure Scoring Rules')}</DialogTitle>
            </DialogHeader>
            <div className="space-y-6 max-h-96 overflow-y-auto">
              {rules.map((rule) => {
                const IconComponent = rule.icon;
                return (
                  <div key={rule.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3 flex-1">
                      <IconComponent className="h-5 w-5 text-muted-foreground" />
                      <div className="flex-1">
                        <div className="font-medium">{rule.name}</div>
                        <div className="text-sm text-muted-foreground">{rule.description}</div>
                      </div>
                    </div>                    <div className="flex items-center gap-4">
                      <div className="text-right min-w-20">
                        <Label htmlFor={`points-${rule.id}`} className="text-xs">{t('leadScoring.points', 'Points')}</Label>
                        <div className="flex items-center gap-2">
                          <Slider
                            id={`points-${rule.id}`}
                            min={0}
                            max={50}
                            step={5}
                            value={[rule.points]}
                            onValueChange={([value]) => updateRule(rule.id, { points: value })}
                            className="w-20"
                          />
                          <span className="text-sm font-medium w-8">{rule.points}</span>
                        </div>
                      </div>
                      <Switch
                        checked={rule.isActive}
                        onCheckedChange={(checked) => updateRule(rule.id, { isActive: checked })}
                      />
                    </div>
                  </div>
                );
              })}
            </div>            <div className="pt-4 border-t">
              <div className="text-sm text-muted-foreground">
                {t('leadScoring.totalPossiblePoints', 'Total possible points')}: <span className="font-medium">{totalActivePoints}</span>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Scoring Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>              <div>
                <p className="text-2xl font-bold">{companies.filter(c => c.score >= 80).length}</p>
                <p className="text-xs text-muted-foreground">{t('leadScoring.hotLeads', 'Hot leads')} (80+)</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <div>
                <p className="text-2xl font-bold">{companies.filter(c => c.score >= 60 && c.score < 80).length}</p>
                <p className="text-xs text-muted-foreground">{t('leadScoring.warmLeads', 'Warm leads')} (60-79)</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <div>
                <p className="text-2xl font-bold">{companies.filter(c => c.score < 60).length}</p>
                <p className="text-xs text-muted-foreground">{t('leadScoring.coldLeads', 'Cold leads')} (&lt;60)</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Scored Companies */}
      <Card>        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5" />
            {t('leadScoring.topRatedCompanies', 'Top Rated Companies')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            </div>
          ) : (
            <Table>              <TableHeader>
                <TableRow>
                  <TableHead>{t('leadScoring.ranking', 'Ranking')}</TableHead>
                  <TableHead>{t('common.company', 'Company')}</TableHead>
                  <TableHead>{t('common.industry', 'Industry')}</TableHead>
                  <TableHead>{t('leadScoring.visits', 'Visits')}</TableHead>
                  <TableHead>{t('leadScoring.points', 'Points')}</TableHead>
                  <TableHead>{t('leadScoring.level', 'Level')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedCompanies.slice(0, 10).map((company, index) => (
                  <TableRow key={company.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {index === 0 && <span className="text-yellow-500">🥇</span>}
                        {index === 1 && <span className="text-gray-400">🥈</span>}
                        {index === 2 && <span className="text-orange-600">🥉</span>}
                        <span className="font-medium">#{index + 1}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{company.name}</div>
                        <div className="text-sm text-muted-foreground">{company.domain}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{company.industry}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{company.totalVisits}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        <span className="font-bold">{company.score}</span>
                        <span className="text-muted-foreground">/{totalActivePoints}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getScoreColor(company.score)}>
                        {getScoreLevel(company.score)}
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
  );
};
