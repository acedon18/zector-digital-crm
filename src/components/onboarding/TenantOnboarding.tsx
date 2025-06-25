// Tenant Onboarding Component - Setup new tenants
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Building2, Settings, CreditCard, Users, CheckCircle } from 'lucide-react';

interface TenantOnboardingProps {
  onComplete: (tenantData: any) => void;
  onCancel?: () => void;
}

interface TenantFormData {
  // Basic Info
  name: string;
  domain: string;
  subdomain: string;
  industry: string;
  
  // Plan Selection
  plan: 'starter' | 'professional' | 'enterprise';
  billingCycle: 'monthly' | 'yearly';
  
  // Branding
  primaryColor: string;
  logo: string;
  
  // Settings
  trackingDomains: string[];
  gdprEnabled: boolean;
  
  // Admin User
  adminEmail: string;
  adminFirstName: string;
  adminLastName: string;
  adminPassword: string;
}

const PLAN_FEATURES = {
  starter: {
    price: '$29/month',
    features: ['1,000 monthly visits', '100 email alerts', '5 data exports', 'Basic analytics'],
    limits: { monthlyVisits: 1000, emailAlerts: 100, dataExports: 5, apiCalls: 10000 }
  },
  professional: {
    price: '$79/month',
    features: ['10,000 monthly visits', '500 email alerts', '25 data exports', 'Advanced analytics', 'Custom branding'],
    limits: { monthlyVisits: 10000, emailAlerts: 500, dataExports: 25, apiCalls: 50000 }
  },
  enterprise: {
    price: '$199/month',
    features: ['Unlimited visits', 'Unlimited alerts', 'Unlimited exports', 'White-label', 'API access', 'Priority support'],
    limits: { monthlyVisits: -1, emailAlerts: -1, dataExports: -1, apiCalls: -1 }
  }
};

export default function TenantOnboarding({ onComplete, onCancel }: TenantOnboardingProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<TenantFormData>({
    name: '',
    domain: '',
    subdomain: '',
    industry: '',
    plan: 'starter',
    billingCycle: 'monthly',
    primaryColor: '#ff6b35',
    logo: '',
    trackingDomains: [],
    gdprEnabled: true,
    adminEmail: '',
    adminFirstName: '',
    adminLastName: '',
    adminPassword: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const totalSteps = 4;
  const progress = (currentStep / totalSteps) * 100;

  const updateFormData = (updates: Partial<TenantFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
    setError(null);
  };

  const validateCurrentStep = (): boolean => {
    switch (currentStep) {
      case 1:
        return !!(formData.name && formData.domain && formData.subdomain && formData.industry);
      case 2:
        return !!(formData.plan);
      case 3:
        return true; // Optional branding step
      case 4:
        return !!(formData.adminEmail && formData.adminFirstName && formData.adminLastName && formData.adminPassword);
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (validateCurrentStep()) {
      setCurrentStep(prev => Math.min(prev + 1, totalSteps));
    } else {
      setError('Please fill in all required fields');
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
    setError(null);
  };

  const handleSubmit = async () => {
    if (!validateCurrentStep()) {
      setError('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // Create tenant
      const tenantResponse = await fetch('/api/tenants', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: formData.name,
          domain: formData.domain,
          subdomain: formData.subdomain,
          plan: formData.plan,
          settings: {
            trackingDomains: formData.trackingDomains.length > 0 ? formData.trackingDomains : [formData.domain],
            branding: {
              logo: formData.logo,
              primaryColor: formData.primaryColor,
              customDomain: ''
            },
            gdpr: {
              enabled: formData.gdprEnabled,
              cookieNotice: true,
              dataRetentionDays: 365
            }
          },
          subscription: {
            billingCycle: formData.billingCycle
          }
        })
      });

      if (!tenantResponse.ok) {
        throw new Error('Failed to create tenant');
      }

      const tenant = await tenantResponse.json();

      // Create admin user
      const userResponse = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Tenant-ID': tenant.tenantId
        },
        body: JSON.stringify({
          email: formData.adminEmail,
          firstName: formData.adminFirstName,
          lastName: formData.adminLastName,
          password: formData.adminPassword,
          tenantId: tenant.tenantId,
          role: 'admin'
        })
      });

      if (!userResponse.ok) {
        throw new Error('Failed to create admin user');
      }

      const user = await userResponse.json();

      onComplete({ tenant, user });
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to create tenant');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Company Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => updateFormData({ name: e.target.value })}
                placeholder="Acme Corporation"
              />
            </div>
            
            <div>
              <Label htmlFor="domain">Primary Domain *</Label>
              <Input
                id="domain"
                value={formData.domain}
                onChange={(e) => {
                  const domain = e.target.value;
                  updateFormData({ 
                    domain,
                    subdomain: formData.subdomain || domain.split('.')[0]
                  });
                }}
                placeholder="acme.com"
              />
            </div>
            
            <div>
              <Label htmlFor="subdomain">CRM Subdomain *</Label>
              <div className="flex items-center space-x-2">
                <Input
                  id="subdomain"
                  value={formData.subdomain}
                  onChange={(e) => updateFormData({ subdomain: e.target.value })}
                  placeholder="acme"
                />
                <span className="text-sm text-gray-500">.zectorcrm.com</span>
              </div>
            </div>
            
            <div>
              <Label htmlFor="industry">Industry *</Label>
              <Select value={formData.industry} onValueChange={(value) => updateFormData({ industry: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select industry" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="technology">Technology</SelectItem>
                  <SelectItem value="saas">SaaS</SelectItem>
                  <SelectItem value="ecommerce">E-commerce</SelectItem>
                  <SelectItem value="consulting">Consulting</SelectItem>
                  <SelectItem value="marketing">Marketing</SelectItem>
                  <SelectItem value="finance">Finance</SelectItem>
                  <SelectItem value="healthcare">Healthcare</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <Label className="text-lg font-semibold">Choose Your Plan</Label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                {Object.entries(PLAN_FEATURES).map(([planKey, plan]) => (
                  <Card 
                    key={planKey}
                    className={`cursor-pointer transition-all ${
                      formData.plan === planKey ? 'ring-2 ring-orange-500 bg-orange-50' : ''
                    }`}
                    onClick={() => updateFormData({ plan: planKey as any })}
                  >
                    <CardHeader className="text-center">
                      <CardTitle className="capitalize">{planKey}</CardTitle>
                      <div className="text-2xl font-bold text-orange-600">{plan.price}</div>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2 text-sm">
                        {plan.features.map((feature, index) => (
                          <li key={index} className="flex items-center">
                            <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
            
            <div>
              <Label htmlFor="billingCycle">Billing Cycle</Label>
              <Select value={formData.billingCycle} onValueChange={(value) => updateFormData({ billingCycle: value as any })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="yearly">Yearly (Save 20%)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="primaryColor">Primary Brand Color</Label>
              <div className="flex items-center space-x-2">
                <Input
                  id="primaryColor"
                  type="color"
                  value={formData.primaryColor}
                  onChange={(e) => updateFormData({ primaryColor: e.target.value })}
                  className="w-16 h-10"
                />
                <Input
                  value={formData.primaryColor}
                  onChange={(e) => updateFormData({ primaryColor: e.target.value })}
                  placeholder="#ff6b35"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="logo">Logo URL (Optional)</Label>
              <Input
                id="logo"
                value={formData.logo}
                onChange={(e) => updateFormData({ logo: e.target.value })}
                placeholder="https://example.com/logo.png"
              />
            </div>
            
            <div>
              <Label htmlFor="trackingDomains">Additional Tracking Domains (Optional)</Label>
              <Textarea
                id="trackingDomains"
                value={formData.trackingDomains.join('\n')}
                onChange={(e) => updateFormData({ trackingDomains: e.target.value.split('\n').filter(d => d.trim()) })}
                placeholder="blog.acme.com&#10;shop.acme.com"
                rows={3}
              />
              <p className="text-sm text-gray-500 mt-1">One domain per line</p>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="adminFirstName">First Name *</Label>
                <Input
                  id="adminFirstName"
                  value={formData.adminFirstName}
                  onChange={(e) => updateFormData({ adminFirstName: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="adminLastName">Last Name *</Label>
                <Input
                  id="adminLastName"
                  value={formData.adminLastName}
                  onChange={(e) => updateFormData({ adminLastName: e.target.value })}
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="adminEmail">Email Address *</Label>
              <Input
                id="adminEmail"
                type="email"
                value={formData.adminEmail}
                onChange={(e) => updateFormData({ adminEmail: e.target.value })}
                placeholder="admin@acme.com"
              />
            </div>
            
            <div>
              <Label htmlFor="adminPassword">Password *</Label>
              <Input
                id="adminPassword"
                type="password"
                value={formData.adminPassword}
                onChange={(e) => updateFormData({ adminPassword: e.target.value })}
                placeholder="Choose a strong password"
              />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const getStepIcon = (step: number) => {
    switch (step) {
      case 1: return <Building2 className="h-5 w-5" />;
      case 2: return <CreditCard className="h-5 w-5" />;
      case 3: return <Settings className="h-5 w-5" />;
      case 4: return <Users className="h-5 w-5" />;
      default: return null;
    }
  };

  const getStepTitle = (step: number) => {
    switch (step) {
      case 1: return 'Company Information';
      case 2: return 'Plan Selection';
      case 3: return 'Branding & Settings';
      case 4: return 'Admin Account';
      default: return '';
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl text-center">Setup Your CRM</CardTitle>
          <div className="space-y-2">
            <Progress value={progress} className="h-2" />
            <div className="flex justify-between text-sm text-gray-500">
              <span>Step {currentStep} of {totalSteps}</span>
              <span>{Math.round(progress)}% Complete</span>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Step Navigation */}
          <div className="flex justify-between items-center">
            {[1, 2, 3, 4].map((step) => (
              <div
                key={step}
                className={`flex items-center space-x-2 ${
                  step === currentStep ? 'text-orange-600' : 
                  step < currentStep ? 'text-green-600' : 'text-gray-400'
                }`}
              >
                <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                  step === currentStep ? 'border-orange-600 bg-orange-50' :
                  step < currentStep ? 'border-green-600 bg-green-50' : 'border-gray-300'
                }`}>
                  {step < currentStep ? (
                    <CheckCircle className="h-5 w-5" />
                  ) : (
                    getStepIcon(step)
                  )}
                </div>
                <span className="hidden md:block text-sm font-medium">
                  {getStepTitle(step)}
                </span>
              </div>
            ))}
          </div>

          {/* Step Content */}
          <div className="min-h-[300px]">
            <h3 className="text-lg font-semibold mb-4">{getStepTitle(currentStep)}</h3>
            {renderStepContent()}
          </div>

          {/* Error Display */}
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between pt-4">
            <div>
              {currentStep > 1 && (
                <Button variant="outline" onClick={handlePrevious}>
                  Previous
                </Button>
              )}
              {onCancel && currentStep === 1 && (
                <Button variant="outline" onClick={onCancel}>
                  Cancel
                </Button>
              )}
            </div>
            
            <div>
              {currentStep < totalSteps ? (
                <Button onClick={handleNext} disabled={!validateCurrentStep()}>
                  Next
                </Button>
              ) : (
                <Button 
                  onClick={handleSubmit} 
                  disabled={!validateCurrentStep() || isSubmitting}
                >
                  {isSubmitting ? 'Creating...' : 'Complete Setup'}
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
