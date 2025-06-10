import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Brain, TrendingUp, Target, Users, Clock, Star, AlertCircle } from 'lucide-react';
import { Company } from '@/types/leads';
import { leadsApi } from '@/lib/api';

interface AIQualification {
  companyId: string;
  aiScore: number;
  intentScore: number;
  fitScore: number;
  urgencyScore: number;
  factors: {
    behavioralSignals: string[];
    technographics: string[];
    companySignals: string[];
    timeBasedFactors: string[];
  };
  recommendation: 'contact_immediately' | 'nurture' | 'monitor' | 'deprioritize';
  nextAction: string;
  confidence: number;
}

const generateAIQualification = (company: Company): AIQualification => {
  // AI-driven qualification logic
  const behavioralSignals = [];
  const technographics = [];
  const companySignals = [];
  const timeBasedFactors = [];

  // Behavioral analysis
  if (company.totalVisits >= 5) behavioralSignals.push('Hög engagemang - flera återbesök');
  if (company.score >= 80) behavioralSignals.push('Starkt köpintresse identifierat');
  
  // Company fit analysis
  if (company.size.includes('1,000+')) companySignals.push('Enterprise-kund med budget');
  if (company.location.country === 'Sweden') companySignals.push('Lokal marknad - lägre försäljningscykel');
  
  // Intent scoring based on industry and behavior
  let intentScore = Math.min(100, company.score + (company.totalVisits * 3));
  let fitScore = company.size.includes('1,000+') ? 90 : company.size.includes('100+') ? 70 : 50;
  let urgencyScore = Math.max(0, 100 - Math.floor((Date.now() - company.lastVisit.getTime()) / (1000 * 60 * 60 * 24) * 10));

  // AI composite score
  const aiScore = Math.round((intentScore * 0.4 + fitScore * 0.3 + urgencyScore * 0.3));

  // Recommendation engine
  let recommendation: AIQualification['recommendation'] = 'monitor';
  let nextAction = 'Fortsätt övervaka aktivitet';

  if (aiScore >= 85) {
    recommendation = 'contact_immediately';
    nextAction = 'Kontakta inom 24h - hög sannolikhet för affär';
  } else if (aiScore >= 70) {
    recommendation = 'nurture';
    nextAction = 'Starta målriktad nurture-sekvens';
  } else if (aiScore >= 50) {
    recommendation = 'monitor';
    nextAction = 'Övervaka och vänta på fler signaler';
  } else {
    recommendation = 'deprioritize';
    nextAction = 'Låg prioritet - fokusera på andra leads';
  }

  return {
    companyId: company.id,
    aiScore,
    intentScore,
    fitScore,
    urgencyScore,
    factors: {
      behavioralSignals,
      technographics,
      companySignals,
      timeBasedFactors
    },
    recommendation,
    nextAction,
    confidence: Math.min(95, aiScore + 10)
  };
};

const getRecommendationColor = (rec: string) => {
  switch (rec) {
    case 'contact_immediately': return 'bg-red-100 text-red-800 border-red-200';
    case 'nurture': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'monitor': return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'deprioritize': return 'bg-gray-100 text-gray-800 border-gray-200';
    default: return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

const getRecommendationText = (rec: string) => {
  switch (rec) {
    case 'contact_immediately': return 'Kontakta Nu';
    case 'nurture': return 'Nurture';
    case 'monitor': return 'Övervaka';
    case 'deprioritize': return 'Låg Prioritet';
    default: return rec;
  }
};

export const AILeadQualification = () => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [qualifications, setQualifications] = useState<AIQualification[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('high-priority');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const companiesData = await leadsApi.getCompanies();
      setCompanies(companiesData);
      
      // Generate AI qualifications
      const quals = companiesData.map(generateAIQualification);
      setQualifications(quals.sort((a, b) => b.aiScore - a.aiScore));
    } catch (error) {
      console.error('Failed to load AI qualification data:', error);
    } finally {
      setLoading(false);
    }
  };

  const highPriorityLeads = qualifications.filter(q => q.recommendation === 'contact_immediately');
  const nurtureLeads = qualifications.filter(q => q.recommendation === 'nurture');
  const monitorLeads = qualifications.filter(q => q.recommendation === 'monitor');

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            AI Lead Qualification
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5" />
          AI Lead Qualification
          <Badge variant="secondary" className="ml-2">Beta</Badge>
        </CardTitle>
        <p className="text-sm text-muted-foreground mt-2">
          Avancerad AI-analys för optimal lead-prioritering och handlingsrekommendationer
        </p>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="high-priority" className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              Hög Prioritet ({highPriorityLeads.length})
            </TabsTrigger>
            <TabsTrigger value="nurture" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Nurture ({nurtureLeads.length})
            </TabsTrigger>
            <TabsTrigger value="monitor" className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              Övervaka ({monitorLeads.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="high-priority" className="space-y-4">
            {highPriorityLeads.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Inga högprioriterade leads just nu
              </div>
            ) : (
              highPriorityLeads.map(qual => {
                const company = companies.find(c => c.id === qual.companyId);
                if (!company) return null;

                return (
                  <div key={qual.companyId} className="border rounded-lg p-4 space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-lg">{company.name}</h3>
                        <p className="text-sm text-muted-foreground">{company.domain}</p>
                        <Badge className={getRecommendationColor(qual.recommendation)}>
                          {getRecommendationText(qual.recommendation)}
                        </Badge>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-green-600">{qual.aiScore}</div>
                        <div className="text-xs text-muted-foreground">AI Poäng</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <div className="text-sm font-medium">Köpintention</div>
                        <Progress value={qual.intentScore} className="h-2 mt-1" />
                        <div className="text-xs text-muted-foreground mt-1">{qual.intentScore}%</div>
                      </div>
                      <div>
                        <div className="text-sm font-medium">Företagspassning</div>
                        <Progress value={qual.fitScore} className="h-2 mt-1" />
                        <div className="text-xs text-muted-foreground mt-1">{qual.fitScore}%</div>
                      </div>
                      <div>
                        <div className="text-sm font-medium">Brådska</div>
                        <Progress value={qual.urgencyScore} className="h-2 mt-1" />
                        <div className="text-xs text-muted-foreground mt-1">{qual.urgencyScore}%</div>
                      </div>
                    </div>

                    <div className="bg-blue-50 p-3 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Brain className="h-4 w-4 text-blue-600" />
                        <span className="font-medium text-blue-800">AI Rekommendation</span>
                      </div>
                      <p className="text-sm text-blue-700">{qual.nextAction}</p>
                      <div className="text-xs text-blue-600 mt-1">
                        Säkerhet: {qual.confidence}%
                      </div>
                    </div>

                    {qual.factors.behavioralSignals.length > 0 && (
                      <div>
                        <div className="text-sm font-medium mb-1">Beteendesignaler:</div>
                        <div className="flex flex-wrap gap-1">
                          {qual.factors.behavioralSignals.map((signal, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {signal}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex gap-2">
                      <Button size="sm" className="flex-1">
                        <Users className="h-4 w-4 mr-2" />
                        Kontakta Nu
                      </Button>
                      <Button size="sm" variant="outline">
                        <Star className="h-4 w-4 mr-2" />
                        Lägg till CRM
                      </Button>
                    </div>
                  </div>
                );
              })
            )}
          </TabsContent>

          <TabsContent value="nurture" className="space-y-4">
            {nurtureLeads.map(qual => {
              const company = companies.find(c => c.id === qual.companyId);
              if (!company) return null;

              return (
                <div key={qual.companyId} className="border rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-medium">{company.name}</h3>
                      <p className="text-sm text-muted-foreground">{company.domain}</p>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-yellow-600">{qual.aiScore}</div>
                      <div className="text-xs text-muted-foreground">AI Poäng</div>
                    </div>
                  </div>
                  <div className="mt-2 text-sm text-muted-foreground">
                    {qual.nextAction}
                  </div>
                </div>
              );
            })}
          </TabsContent>

          <TabsContent value="monitor" className="space-y-4">
            {monitorLeads.map(qual => {
              const company = companies.find(c => c.id === qual.companyId);
              if (!company) return null;

              return (
                <div key={qual.companyId} className="border rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-medium">{company.name}</h3>
                      <p className="text-sm text-muted-foreground">{company.domain}</p>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-blue-600">{qual.aiScore}</div>
                      <div className="text-xs text-muted-foreground">AI Poäng</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
