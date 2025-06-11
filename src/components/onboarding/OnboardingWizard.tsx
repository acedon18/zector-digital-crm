import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, Zap, Globe, Target, Settings, ArrowRight, ArrowLeft } from 'lucide-react';

interface OnboardingData {
  companyName: string;
  website: string;
  industry: string;
  employeeCount: string;
  goals: string[];
  trackingDomains: string[];
  gdprCompliance: boolean;
  cookiePolicy: string;
  privacyPolicy: string;
}

export function OnboardingWizard({ onComplete }: { onComplete: (data: OnboardingData) => void }) {
  const { t } = useTranslation();
  const [currentStep, setCurrentStep] = useState(1);
  
  const steps = [
    {
      id: 1,
      title: t('onboarding.welcomeTitle'),
      subtitle: t('onboarding.welcomeSubtitle'),
      icon: <Zap className="h-6 w-6" />
    },
    {
      id: 2,
      title: t('onboarding.companyInfoTitle'),
      subtitle: t('onboarding.companyInfoSubtitle'),
      icon: <Globe className="h-6 w-6" />
    },
    {
      id: 3,
      title: t('onboarding.trackingSettingsTitle'),
      subtitle: t('onboarding.trackingSettingsSubtitle'),
      icon: <Target className="h-6 w-6" />
    },
    {
      id: 4,
      title: t('onboarding.gdprTitle'),
      subtitle: t('onboarding.gdprSubtitle'),
      icon: <Settings className="h-6 w-6" />
    }
  ];
  const [data, setData] = useState<OnboardingData>({
    companyName: '',
    website: '',
    industry: '',
    employeeCount: '',
    goals: [],
    trackingDomains: [],
    gdprCompliance: false,
    cookiePolicy: '',
    privacyPolicy: ''
  });

  const updateData = (updates: Partial<OnboardingData>) => {
    setData(prev => ({ ...prev, ...updates }));
  };

  const nextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete(data);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const progress = (currentStep / steps.length) * 100;

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="text-center space-y-6">
            <div className="mx-auto w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
              <Zap className="h-10 w-10 text-primary" />
            </div>            <div>
              <h2 className="text-2xl font-bold mb-2">{t('onboarding.welcomeTitle')}!</h2>
              <p className="text-muted-foreground max-w-md mx-auto">
                {t('onboarding.welcomeDescription')}
              </p>
            </div>            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
              <div className="p-4 border rounded-lg">
                <Target className="h-8 w-8 text-primary mb-2 mx-auto" />
                <h3 className="font-semibold mb-1">{t('onboarding.identifyCompanies')}</h3>
                <p className="text-sm text-muted-foreground">{t('onboarding.identifyCompaniesDesc')}</p>
              </div>
              <div className="p-4 border rounded-lg">
                <Globe className="h-8 w-8 text-primary mb-2 mx-auto" />
                <h3 className="font-semibold mb-1">{t('onboarding.analyzeTraffic')}</h3>
                <p className="text-sm text-muted-foreground">{t('onboarding.analyzeTrafficDesc')}</p>
              </div>
              <div className="p-4 border rounded-lg">
                <CheckCircle className="h-8 w-8 text-primary mb-2 mx-auto" />
                <h3 className="font-semibold mb-1">{t('onboarding.convertLeads')}</h3>
                <p className="text-sm text-muted-foreground">{t('onboarding.convertLeadsDesc')}</p>
              </div>
            </div>
          </div>
        );

      case 2:
        return (          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-xl font-bold mb-2">{t('onboarding.tellAboutCompany')}</h2>
              <p className="text-muted-foreground">{t('onboarding.tellAboutCompanyDesc')}</p>
            </div>
            <div className="space-y-4 max-w-md mx-auto">
              <div>
                <Label htmlFor="companyName">{t('onboarding.companyName')} *</Label>
                <Input
                  id="companyName"
                  value={data.companyName}
                  onChange={(e) => updateData({ companyName: e.target.value })}
                  placeholder={t('placeholders.companyNameOnboarding')}
                />
              </div>
              <div>
                <Label htmlFor="website">{t('onboarding.website')} *</Label>
                <Input
                  id="website"
                  value={data.website}
                  onChange={(e) => updateData({ website: e.target.value })}
                  placeholder={t('placeholders.enterWebsite')}
                />
              </div>
              <div>
                <Label htmlFor="industry">{t('onboarding.industry')}</Label>
                <Select value={data.industry} onValueChange={(value) => updateData({ industry: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder={t('onboarding.selectIndustry')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="technology">{t('onboarding.industries.technology')}</SelectItem>
                    <SelectItem value="finance">{t('onboarding.industries.finance')}</SelectItem>
                    <SelectItem value="healthcare">{t('onboarding.industries.healthcare')}</SelectItem>
                    <SelectItem value="retail">{t('onboarding.industries.retail')}</SelectItem>
                    <SelectItem value="manufacturing">{t('onboarding.industries.manufacturing')}</SelectItem>
                    <SelectItem value="consulting">{t('onboarding.industries.consulting')}</SelectItem>
                    <SelectItem value="other">{t('onboarding.industries.other')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="employeeCount">{t('onboarding.employeeCount')}</Label>
                <Select value={data.employeeCount} onValueChange={(value) => updateData({ employeeCount: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder={t('onboarding.selectSize')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1-10">1-10</SelectItem>
                    <SelectItem value="11-50">11-50</SelectItem>
                    <SelectItem value="51-200">51-200</SelectItem>
                    <SelectItem value="201-1000">201-1000</SelectItem>
                    <SelectItem value="1000+">1000+</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        );

      case 3:
        return (          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-xl font-bold mb-2">{t('onboarding.trackingSettingsTitle')}</h2>
              <p className="text-muted-foreground">{t('onboarding.trackingSettingsDesc')}</p>
            </div>
            <div className="space-y-4 max-w-md mx-auto">
              <div>
                <Label>{t('onboarding.mainGoals')}</Label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {[
                    t('onboarding.goals.generateLeads'),
                    t('onboarding.goals.increaseSales'),
                    t('onboarding.goals.understandAudience'),
                    t('onboarding.goals.optimizeWebsite'),
                    t('onboarding.goals.competitiveIntelligence'),
                    t('onboarding.goals.marketAnalysis')
                  ].map((goal) => (
                    <Button
                      key={goal}
                      variant={data.goals.includes(goal) ? "default" : "outline"}
                      size="sm"
                      onClick={() => {
                        const newGoals = data.goals.includes(goal)
                          ? data.goals.filter(g => g !== goal)
                          : [...data.goals, goal];
                        updateData({ goals: newGoals });
                      }}
                      className="justify-start text-sm"
                    >
                      {goal}
                    </Button>
                  ))}
                </div>
              </div>              <div>
                <Label htmlFor="trackingDomains">{t('onboarding.domainsToTrack')}</Label>
                <Textarea
                  id="trackingDomains"
                  placeholder={t('onboarding.domainsPlaceholder')}
                  value={data.trackingDomains.join('\n')}
                  onChange={(e) => updateData({ trackingDomains: e.target.value.split('\n').filter(d => d.trim()) })}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {t('onboarding.domainsHelp')}
                </p>
              </div>
            </div>
          </div>
        );

      case 4:
        return (          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-xl font-bold mb-2">{t('onboarding.gdprTitle')}</h2>
              <p className="text-muted-foreground">{t('onboarding.gdprDesc')}</p>
            </div>
            <div className="space-y-4 max-w-md mx-auto">
              <div className="p-4 border border-amber-200 bg-amber-50 rounded-lg">
                <div className="flex items-start space-x-2">
                  <CheckCircle className="h-5 w-5 text-amber-600 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-amber-800">{t('onboarding.gdprCompliance')}</h3>
                    <p className="text-sm text-amber-700">
                      {t('onboarding.gdprComplianceDesc')}
                    </p>
                  </div>
                </div>
              </div>
              
              <div>
                <Label htmlFor="privacyPolicy">{t('onboarding.privacyPolicyLink')} *</Label>
                <Input
                  id="privacyPolicy"
                  value={data.privacyPolicy}
                  onChange={(e) => updateData({ privacyPolicy: e.target.value })}
                  placeholder={t('onboarding.privacyPolicyPlaceholder')}
                />
              </div>
              
              <div>
                <Label htmlFor="cookiePolicy">{t('onboarding.cookiePolicyLink')}</Label>
                <Input
                  id="cookiePolicy"
                  value={data.cookiePolicy}
                  onChange={(e) => updateData({ cookiePolicy: e.target.value })}
                  placeholder={t('onboarding.cookiePolicyPlaceholder')}
                />
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold">{t('onboarding.automaticFeatures')}:</h3>
                <div className="text-sm space-y-1">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>{t('onboarding.features.cookieBanner')}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>{t('onboarding.features.ipAnonymization')}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>{t('onboarding.features.dataStorage')}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>{t('onboarding.features.automaticCleanup')}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return true;
      case 2:
        return data.companyName && data.website;
      case 3:
        return data.goals.length > 0;
      case 4:
        return data.privacyPolicy;
      default:
        return false;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className="flex justify-center space-x-2 mb-4">
            {steps.map((step) => (
              <div
                key={step.id}
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${
                  step.id === currentStep
                    ? 'bg-primary text-primary-foreground'
                    : step.id < currentStep
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-200 text-gray-600'
                }`}
              >
                {step.id < currentStep ? <CheckCircle className="h-4 w-4" /> : step.id}
              </div>
            ))}
          </div>
          <Progress value={progress} className="w-full" />
          <CardTitle className="mt-4">
            {steps[currentStep - 1]?.title}
          </CardTitle>          <p className="text-sm text-muted-foreground">
            {t('onboarding.stepProgress', { current: currentStep, total: steps.length })}
          </p>
        </CardHeader>
        <CardContent>
          {renderStepContent()}
          
          <div className="flex justify-between mt-8">            <Button
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 1}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t('buttons.back')}
            </Button>
            <Button
              onClick={nextStep}
              disabled={!canProceed()}
            >
              {currentStep === steps.length ? t('buttons.finish') : t('buttons.next')}
              {currentStep < steps.length && <ArrowRight className="h-4 w-4 ml-2" />}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
