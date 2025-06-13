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
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { CheckCircle, Zap, Globe, Target, Settings, ArrowRight, ArrowLeft, Copy, Code, ExternalLink, AlertCircle, Key } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { SubdomainSetup } from './SubdomainSetup';

interface CustomerOnboardingData {
  // Company Info
  companyName: string;
  website: string;
  industry: string;
  employeeCount: string;
  country: string;
  
  // Contact Info
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  
  // Subdomain Setup
  subdomain: string;
  adminEmail: string;
  adminPassword: string;
  customDomain?: string;
  subdomainUrl?: string;
  
  // Tracking Setup
  trackingDomains: string[];
  goals: string[];
  
  // Technical Settings
  gdprCompliant: boolean;
  anonymizeIp: boolean;
  cookiePolicy: string;
  privacyPolicy: string;
  
  // CRM Integration
  existingCrm: string;
  crmApiKey?: string;
  webhookUrl?: string;
  
  // Generated Data
  customerId?: string;
  trackingScript?: string;
}

export type { CustomerOnboardingData };

export function CustomerOnboarding({ onComplete }: { onComplete: (data: CustomerOnboardingData) => void }) {
  const { t } = useTranslation();
  const [currentStep, setCurrentStep] = useState(1);
  const [generatedCustomerId, setGeneratedCustomerId] = useState('');
  const [generatedScript, setGeneratedScript] = useState('');
    const steps = [
    {
      id: 1,
      title: 'Welcome to Zector Digital CRM',
      subtitle: 'Let\'s set up your lead tracking in minutes',
      icon: <Zap className="h-6 w-6" />
    },
    {
      id: 2,
      title: 'Company Information',
      subtitle: 'Tell us about your business',
      icon: <Globe className="h-6 w-6" />
    },
    {
      id: 3,
      title: 'Subdomain Setup',
      subtitle: 'Create your dedicated CRM instance',
      icon: <Key className="h-6 w-6" />
    },
    {
      id: 4,
      title: 'Tracking Configuration',
      subtitle: 'Configure what you want to track',
      icon: <Target className="h-6 w-6" />
    },
    {
      id: 5,
      title: 'Integration Setup',
      subtitle: 'Connect your existing tools',
      icon: <Settings className="h-6 w-6" />
    },
    {
      id: 6,
      title: 'Deploy & Test',
      subtitle: 'Install tracking and verify it works',
      icon: <Code className="h-6 w-6" />
    }
  ];
    const [data, setData] = useState<CustomerOnboardingData>({
    companyName: '',
    website: '',
    industry: '',
    employeeCount: '',
    country: '',
    contactName: '',
    contactEmail: '',
    contactPhone: '',
    subdomain: '',
    adminEmail: '',
    adminPassword: '',
    trackingDomains: [],
    goals: [],
    gdprCompliant: true,
    anonymizeIp: true,
    cookiePolicy: '',
    privacyPolicy: '',
    existingCrm: 'none'
  });

  const updateData = (updates: Partial<CustomerOnboardingData>) => {
    setData(prev => ({ ...prev, ...updates }));
  };

  // Generate customer ID and tracking script
  const generateTrackingSetup = () => {
    const customerId = `customer_${data.companyName.toLowerCase().replace(/\s+/g, '_')}_${Date.now()}`;
    const domain = data.website.replace(/^https?:\/\//, '').replace(/\/$/, '');
    
    const script = `<!-- Zector Digital Lead Tracking Script -->
<script type="text/javascript">
(function() {
  var zld = {
    customerId: '${customerId}',
    domain: '${domain}',
    config: {
      gdprCompliant: ${data.gdprCompliant},
      anonymizeIp: ${data.anonymizeIp},
      trackScrollDepth: true,
      trackDownloads: true,
      trackFormSubmissions: true
    }
  };

  // Tracking functions
  zld.track = function(event, data) {
    var payload = {
      event: event,
      data: data || {},
      timestamp: new Date().toISOString(),
      url: window.location.href,
      referrer: document.referrer,
      userAgent: navigator.userAgent,
      customerId: zld.customerId,
      domain: zld.domain
    };

    // Send to Zector Digital tracking endpoint
    fetch('https://api.zectordigital.com/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }).catch(function(error) {
      console.warn('Zector tracking error:', error);
    });
  };

  // Auto-track page views
  zld.track('page_view', {
    title: document.title,
    path: window.location.pathname
  });

  // Scroll depth tracking
  var maxScroll = 0;
  window.addEventListener('scroll', function() {
    var scrollPercent = Math.round((window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100);
    if (scrollPercent > maxScroll && scrollPercent % 25 === 0) {
      maxScroll = scrollPercent;
      zld.track('scroll_depth', { depth: scrollPercent });
    }
  });

  window.ZectorLeadDigital = zld;
  console.log('Zector Digital Lead Tracking initialized for ${domain}');
})();
</script>`;

    setGeneratedCustomerId(customerId);
    setGeneratedScript(script);
    updateData({ customerId, trackingScript: script });
  };
  const nextStep = () => {
    if (currentStep === 5) {
      generateTrackingSetup();
    }
    
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    } else {
      // Complete onboarding
      onComplete({
        ...data,
        customerId: generatedCustomerId,
        trackingScript: generatedScript
      });
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
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-2">Welcome to Zector Digital CRM!</h2>
              <p className="text-muted-foreground max-w-md mx-auto">
                We'll help you set up lead tracking for your website in just 5 minutes. 
                Identify which companies visit your site and convert them into customers.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
              <div className="p-4 border rounded-lg">
                <Target className="h-8 w-8 text-primary mb-2 mx-auto" />
                <h3 className="font-semibold mb-1">Identify Companies</h3>
                <p className="text-sm text-muted-foreground">See which companies visit your website</p>
              </div>
              <div className="p-4 border rounded-lg">
                <Globe className="h-8 w-8 text-primary mb-2 mx-auto" />
                <h3 className="font-semibold mb-1">Analyze Behavior</h3>
                <p className="text-sm text-muted-foreground">Understand visitor engagement and intent</p>
              </div>
              <div className="p-4 border rounded-lg">
                <CheckCircle className="h-8 w-8 text-primary mb-2 mx-auto" />
                <h3 className="font-semibold mb-1">Convert Leads</h3>
                <p className="text-sm text-muted-foreground">Turn anonymous visitors into sales opportunities</p>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-xl font-bold mb-2">Tell us about your company</h2>
              <p className="text-muted-foreground">This helps us personalize your experience</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
              <div>
                <Label htmlFor="companyName">Company Name *</Label>
                <Input
                  id="companyName"
                  value={data.companyName}
                  onChange={(e) => updateData({ companyName: e.target.value })}
                  placeholder="e.g. Zector Digital"
                />
              </div>
              <div>
                <Label htmlFor="website">Website URL *</Label>
                <Input
                  id="website"
                  value={data.website}
                  onChange={(e) => updateData({ website: e.target.value })}
                  placeholder="https://zectordigital.es"
                />
              </div>
              <div>
                <Label htmlFor="contactName">Contact Name *</Label>
                <Input
                  id="contactName"
                  value={data.contactName}
                  onChange={(e) => updateData({ contactName: e.target.value })}
                  placeholder="Your full name"
                />
              </div>
              <div>
                <Label htmlFor="contactEmail">Email Address *</Label>
                <Input
                  id="contactEmail"
                  type="email"
                  value={data.contactEmail}
                  onChange={(e) => updateData({ contactEmail: e.target.value })}
                  placeholder="your@email.com"
                />
              </div>
              <div>
                <Label htmlFor="industry">Industry</Label>
                <Select value={data.industry} onValueChange={(value) => updateData({ industry: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select industry" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="technology">Technology</SelectItem>
                    <SelectItem value="marketing">Digital Marketing</SelectItem>
                    <SelectItem value="finance">Finance</SelectItem>
                    <SelectItem value="healthcare">Healthcare</SelectItem>
                    <SelectItem value="retail">Retail</SelectItem>
                    <SelectItem value="manufacturing">Manufacturing</SelectItem>
                    <SelectItem value="consulting">Consulting</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="employeeCount">Company Size</Label>
                <Select value={data.employeeCount} onValueChange={(value) => updateData({ employeeCount: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select company size" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1-10">1-10 employees</SelectItem>
                    <SelectItem value="11-50">11-50 employees</SelectItem>
                    <SelectItem value="51-200">51-200 employees</SelectItem>
                    <SelectItem value="201-1000">201-1000 employees</SelectItem>
                    <SelectItem value="1000+">1000+ employees</SelectItem>
                  </SelectContent>
                </Select>
              </div>            </div>
          </div>
        );

      case 3:
        return (
          <SubdomainSetup
            companyName={data.companyName}
            onComplete={(subdomainData) => {
              updateData({
                subdomain: subdomainData.subdomain,
                adminEmail: subdomainData.adminEmail,
                adminPassword: subdomainData.adminPassword,
                customDomain: subdomainData.customDomain,
                subdomainUrl: `https://${subdomainData.subdomain}.zectordigital.es`
              });
            }}
          />
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-xl font-bold mb-2">Configure Tracking Settings</h2>
              <p className="text-muted-foreground">What do you want to track and achieve?</p>
            </div>
            <div className="space-y-6 max-w-2xl mx-auto">
              <div>
                <Label>Primary Goals (select all that apply)</Label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {[
                    'Generate more leads',
                    'Increase sales conversion',
                    'Understand website visitors',
                    'Optimize marketing campaigns',
                    'Competitive intelligence',
                    'Market research'
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
              </div>
              
              <div>
                <Label htmlFor="trackingDomains">Domains to Track</Label>
                <Textarea
                  id="trackingDomains"
                  placeholder="zectordigital.es&#10;www.zectordigital.es&#10;blog.zectordigital.es"
                  value={data.trackingDomains.join('\n')}
                  onChange={(e) => updateData({ trackingDomains: e.target.value.split('\n').filter(d => d.trim()) })}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  One domain per line. Include all domains you want to track.
                </p>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold">Privacy & Compliance Settings</h3>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label>GDPR Compliant Mode</Label>
                    <p className="text-xs text-muted-foreground">Follow EU data protection regulations</p>
                  </div>
                  <Switch checked={data.gdprCompliant} onCheckedChange={(checked) => updateData({ gdprCompliant: checked })} />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Anonymize IP Addresses</Label>
                    <p className="text-xs text-muted-foreground">Anonymize visitor IP addresses for privacy</p>
                  </div>
                  <Switch checked={data.anonymizeIp} onCheckedChange={(checked) => updateData({ anonymizeIp: checked })} />
                </div>
              </div>            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-xl font-bold mb-2">Integration Setup</h2>
              <p className="text-muted-foreground">Connect your existing CRM and tools</p>
            </div>
            <div className="space-y-4 max-w-2xl mx-auto">
              <div>
                <Label htmlFor="existingCrm">Existing CRM System</Label>
                <Select value={data.existingCrm} onValueChange={(value) => updateData({ existingCrm: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your CRM" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No existing CRM</SelectItem>
                    <SelectItem value="hubspot">HubSpot</SelectItem>
                    <SelectItem value="salesforce">Salesforce</SelectItem>
                    <SelectItem value="pipedrive">Pipedrive</SelectItem>
                    <SelectItem value="zoho">Zoho CRM</SelectItem>
                    <SelectItem value="custom">Custom/Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {data.existingCrm !== 'none' && (
                <div>
                  <Label htmlFor="webhookUrl">Webhook URL (Optional)</Label>
                  <Input
                    id="webhookUrl"
                    value={data.webhookUrl || ''}
                    onChange={(e) => updateData({ webhookUrl: e.target.value })}
                    placeholder="https://your-crm.com/webhook"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    We'll send lead data to this URL when new companies are identified.
                  </p>
                </div>
              )}

              <div>
                <Label htmlFor="privacyPolicy">Privacy Policy URL</Label>
                <Input
                  id="privacyPolicy"
                  value={data.privacyPolicy}
                  onChange={(e) => updateData({ privacyPolicy: e.target.value })}
                  placeholder="https://zectordigital.es/privacy"                />
              </div>
            </div>
          </div>
        );

      case 6:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-xl font-bold mb-2">Deploy & Test Your Tracking</h2>
              <p className="text-muted-foreground">Your tracking script is ready! Install it on your website.</p>
            </div>
            
            <div className="max-w-4xl mx-auto space-y-6">
              <Alert className="border-green-200 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription>
                  <strong>Your Customer ID:</strong> {generatedCustomerId}
                </AlertDescription>
              </Alert>

              <Tabs defaultValue="script" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="script">Tracking Script</TabsTrigger>
                  <TabsTrigger value="instructions">Installation Guide</TabsTrigger>
                  <TabsTrigger value="test">Test Setup</TabsTrigger>
                </TabsList>
                
                <TabsContent value="script" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Code className="h-5 w-5" />
                        Your Tracking Script
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Textarea
                        value={generatedScript}
                        readOnly
                        className="min-h-64 font-mono text-xs"
                      />
                      <Button 
                        onClick={() => {
                          navigator.clipboard.writeText(generatedScript);
                          toast({ title: "Copied!", description: "Tracking script copied to clipboard" });
                        }}
                        className="w-full mt-4"
                      >
                        <Copy className="h-4 w-4 mr-2" />
                        Copy Script to Clipboard
                      </Button>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="instructions" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Installation Instructions</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-3">
                        <div className="flex items-start space-x-2">
                          <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold">1</div>
                          <div>
                            <h3 className="font-semibold">Copy the tracking script</h3>
                            <p className="text-sm text-muted-foreground">Use the "Copy Script" button above</p>
                          </div>
                        </div>
                        <div className="flex items-start space-x-2">
                          <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold">2</div>
                          <div>
                            <h3 className="font-semibold">Paste in your website's &lt;head&gt; section</h3>
                            <p className="text-sm text-muted-foreground">Add the script just before the closing &lt;/head&gt; tag on every page</p>
                          </div>
                        </div>
                        <div className="flex items-start space-x-2">
                          <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold">3</div>
                          <div>
                            <h3 className="font-semibold">Test the installation</h3>
                            <p className="text-sm text-muted-foreground">Visit your website and check the browser console for confirmation</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="test" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Test Your Setup</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-3">
                        <Alert>
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription>
                            After installing the script, test it by visiting your website from a different device or browser.
                          </AlertDescription>
                        </Alert>
                        
                        <Button asChild className="w-full">
                          <a href={data.website} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-4 w-4 mr-2" />
                            Open {data.website} in New Tab
                          </a>
                        </Button>
                        
                        <p className="text-sm text-muted-foreground">
                          Look for "Zector Digital Lead Tracking initialized" in the browser console to confirm the script is working.
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
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
        return data.companyName && data.website && data.contactName && data.contactEmail;
      case 3:
        return data.subdomain && data.adminEmail;
      case 4:
        return data.goals.length > 0;
      case 5:
        return true;
      case 6:
        return true;
      default:
        return false;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl">
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
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Step {currentStep} of {steps.length}
          </p>
        </CardHeader>
        <CardContent>
          {renderStepContent()}
          
          <div className="flex justify-between mt-8">
            <Button
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 1}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <Button
              onClick={nextStep}
              disabled={!canProceed()}
            >
              {currentStep === steps.length ? 'Complete Setup' : 'Next'}
              {currentStep < steps.length && <ArrowRight className="h-4 w-4 ml-2" />}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
