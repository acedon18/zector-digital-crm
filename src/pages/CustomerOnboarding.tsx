import { useState } from 'react';
import { CustomerOnboarding, type CustomerOnboardingData } from '@/components/onboarding/CustomerOnboarding';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Users, Globe, Zap } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

interface OnboardedCustomer {
  companyName: string;
  website: string;
  customerId: string;
  trackingScript: string;
  contactEmail: string;
  industry: string;
  goals: string[];
  onboardedAt: Date;
}

const CustomerOnboardingPage = () => {
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [onboardedCustomers, setOnboardedCustomers] = useState<OnboardedCustomer[]>([]);
  const handleOnboardingComplete = (data: CustomerOnboardingData) => {
    const customer: OnboardedCustomer = {
      companyName: data.companyName,
      website: data.website,
      customerId: data.customerId || `customer_${Date.now()}`,
      trackingScript: data.trackingScript || '',
      contactEmail: data.contactEmail,
      industry: data.industry,
      goals: data.goals,
      onboardedAt: new Date()
    };

    setOnboardedCustomers(prev => [...prev, customer]);
    setShowOnboarding(false);
    
    toast({
      title: "Customer Onboarded Successfully! 🎉",
      description: `${data.companyName} is now set up with lead tracking.`
    });
  };

  const startQuickDemo = () => {
    // Pre-fill with Zector Digital data for quick testing
    const demoData = {
      companyName: 'Zector Digital',
      website: 'https://zectordigital.es',
      customerId: 'customer_zector_digital_' + Date.now(),
      trackingScript: '<!-- Demo script would be here -->',
      contactEmail: 'demo@zectordigital.es',
      industry: 'marketing',
      goals: ['Generate more leads', 'Understand website visitors'],
      onboardedAt: new Date()
    };

    setOnboardedCustomers(prev => [...prev, demoData]);
    
    toast({
      title: "Demo Customer Added! 🚀",
      description: "Zector Digital is now set up for testing."
    });
  };

  if (showOnboarding) {
    return <CustomerOnboarding onComplete={handleOnboardingComplete} />;
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold tracking-tight mb-2">
              Customer Onboarding
            </h1>
            <p className="text-muted-foreground">
              Easy setup process for new customers to start tracking leads
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={startQuickDemo}>
              <Zap className="h-4 w-4 mr-2" />
              Quick Demo (Zector Digital)
            </Button>
            <Button onClick={() => setShowOnboarding(true)}>
              <Users className="h-4 w-4 mr-2" />
              Start New Onboarding
            </Button>
          </div>
        </div>

        {/* Onboarding Process Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Onboarding Process
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="flex flex-col items-center text-center p-4 border rounded-lg">
                <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-semibold mb-2">1</div>
                <h3 className="font-semibold text-sm">Welcome</h3>
                <p className="text-xs text-muted-foreground">Introduce the platform</p>
              </div>
              <div className="flex flex-col items-center text-center p-4 border rounded-lg">
                <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-semibold mb-2">2</div>
                <h3 className="font-semibold text-sm">Company Info</h3>
                <p className="text-xs text-muted-foreground">Collect business details</p>
              </div>
              <div className="flex flex-col items-center text-center p-4 border rounded-lg">
                <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-semibold mb-2">3</div>
                <h3 className="font-semibold text-sm">Tracking Setup</h3>
                <p className="text-xs text-muted-foreground">Configure tracking preferences</p>
              </div>
              <div className="flex flex-col items-center text-center p-4 border rounded-lg">
                <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-semibold mb-2">4</div>
                <h3 className="font-semibold text-sm">Integration</h3>
                <p className="text-xs text-muted-foreground">Connect existing tools</p>
              </div>
              <div className="flex flex-col items-center text-center p-4 border rounded-lg">
                <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-semibold mb-2">5</div>
                <h3 className="font-semibold text-sm">Deploy & Test</h3>
                <p className="text-xs text-muted-foreground">Install and verify tracking</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Onboarded Customers */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              Onboarded Customers ({onboardedCustomers.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {onboardedCustomers.length === 0 ? (
              <div className="text-center py-8">
                <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">No customers onboarded yet</h3>
                <p className="text-muted-foreground mb-4">Start the onboarding process to add your first customer</p>
                <Button onClick={() => setShowOnboarding(true)}>
                  Start First Onboarding
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {onboardedCustomers.map((customer, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-semibold">{customer.companyName}</h3>
                        <p className="text-sm text-muted-foreground">{customer.website}</p>
                      </div>
                      <Badge variant="outline">{customer.industry}</Badge>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Customer ID:</span>
                        <p className="text-muted-foreground font-mono text-xs">{customer.customerId}</p>
                      </div>
                      <div>
                        <span className="font-medium">Contact:</span>
                        <p className="text-muted-foreground">{customer.contactEmail}</p>
                      </div>
                      <div>
                        <span className="font-medium">Onboarded:</span>
                        <p className="text-muted-foreground">{customer.onboardedAt.toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="mt-2">
                      <span className="font-medium text-sm">Goals:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {customer.goals.map((goal, goalIndex) => (
                          <Badge key={goalIndex} variant="secondary" className="text-xs">
                            {goal}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default CustomerOnboardingPage;
