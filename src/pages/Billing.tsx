import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  Download, 
  CreditCard, 
  Calendar, 
  Clock, 
  Plus, 
  Eye,
  FileText,
  Shield,
  TrendingUp,
  Smartphone,
  Globe,
  Search
} from 'lucide-react';
import { format } from 'date-fns';

// Mock data for current services
const currentServices = [
  {
    id: 'lead-intel',
    name: 'Lead Intelligence',
    description: 'Advanced visitor tracking and company identification',
    price: 299,
    status: 'active',
    startDate: new Date('2024-01-15'),
    endDate: new Date('2025-01-15'),
    features: ['Visitor Tracking', 'Company Database', 'Real-time Alerts', 'Export Tools']
  },
  {
    id: 'seo',
    name: 'SEO Optimization',
    description: 'Search engine optimization and ranking improvement',
    price: 199,
    status: 'active',
    startDate: new Date('2024-02-01'),
    endDate: new Date('2025-02-01'),
    features: ['Keyword Research', 'On-page SEO', 'Monthly Reports', 'Competitor Analysis']
  },
  {
    id: 'google-ads',
    name: 'Google Ads Management',
    description: 'Professional Google Ads campaign management',
    price: 399,
    status: 'active',
    startDate: new Date('2024-03-01'),
    endDate: new Date('2025-03-01'),
    features: ['Campaign Setup', 'Bid Management', 'A/B Testing', 'Performance Reports']
  }
];

// Mock data for available services
const availableServices = [
  {
    id: 'tiktok-ads',
    name: 'TikTok Ads',
    description: 'TikTok advertising campaigns for Gen Z and Millennial audiences',
    price: 349,
    features: ['Campaign Creation', 'Audience Targeting', 'Creative Development', 'Analytics']
  },
  {
    id: 'meta-ads',
    name: 'META Ads (Facebook & Instagram)',
    description: 'Social media advertising on Facebook and Instagram platforms',
    price: 329,
    features: ['Multi-platform Campaigns', 'Pixel Setup', 'Retargeting', 'ROI Tracking']
  },
  {
    id: 'bing-ads',
    name: 'Bing Ads',
    description: 'Microsoft Bing search engine advertising',
    price: 249,
    features: ['Search Campaigns', 'Shopping Ads', 'Audience Network', 'Import from Google']
  },
  {
    id: 'web-dev',
    name: 'Website Development',
    description: 'Custom website design and development services',
    price: 2499,
    isOneTime: true,
    features: ['Responsive Design', 'CMS Integration', 'SEO Optimization', '6 Months Support']
  },
  {
    id: 'cyber-security',
    name: 'Cyber Security',
    description: 'Comprehensive cybersecurity solutions and monitoring',
    price: 199,
    features: ['Security Audits', '24/7 Monitoring', 'Threat Detection', 'Incident Response']
  }
];

// Mock data for invoices
const invoices = [
  {
    id: 'INV-2024-001',
    date: new Date('2024-12-01'),
    amount: 897,
    status: 'paid',
    services: ['Lead Intelligence', 'SEO Optimization', 'Google Ads Management'],
    dueDate: new Date('2024-12-15')
  },
  {
    id: 'INV-2024-002',
    date: new Date('2024-11-01'),
    amount: 897,
    status: 'paid',
    services: ['Lead Intelligence', 'SEO Optimization', 'Google Ads Management'],
    dueDate: new Date('2024-11-15')
  },
  {
    id: 'INV-2024-003',
    date: new Date('2024-10-01'),
    amount: 598,
    status: 'paid',
    services: ['Lead Intelligence', 'SEO Optimization'],
    dueDate: new Date('2024-10-15')
  }
];

const Billing = () => {
  const { t } = useTranslation();
  const [selectedService, setSelectedService] = useState<string | null>(null);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 border-green-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'expired': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getInvoiceStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800 border-green-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'overdue': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getServiceIcon = (serviceId: string) => {
    switch (serviceId) {
      case 'lead-intel': return <Eye className="h-5 w-5" />;
      case 'seo': return <Search className="h-5 w-5" />;
      case 'google-ads': return <TrendingUp className="h-5 w-5" />;
      case 'tiktok-ads': return <Smartphone className="h-5 w-5" />;
      case 'meta-ads': return <Smartphone className="h-5 w-5" />;
      case 'bing-ads': return <Search className="h-5 w-5" />;
      case 'web-dev': return <Globe className="h-5 w-5" />;
      case 'cyber-security': return <Shield className="h-5 w-5" />;
      default: return <FileText className="h-5 w-5" />;
    }
  };

  const calculateDaysRemaining = (endDate: Date) => {
    const today = new Date();
    const diffTime = endDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const calculateProgress = (startDate: Date, endDate: Date) => {
    const today = new Date();
    const totalDays = endDate.getTime() - startDate.getTime();
    const passedDays = today.getTime() - startDate.getTime();
    return Math.min(Math.max((passedDays / totalDays) * 100, 0), 100);
  };

  const totalMonthlySpend = currentServices.reduce((sum, service) => sum + service.price, 0);

  return (
    <DashboardLayout>
      <div className="space-y-6">        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{t('billing.title')}</h1>
            <p className="text-muted-foreground">
              {t('billing.description')}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">{t('billing.monthlyTotal')}</p>
            <p className="text-2xl font-bold">{totalMonthlySpend.toLocaleString('sv-SE')} SEK</p>
          </div>
        </div>

        <Tabs defaultValue="services" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="services">{t('billing.services')}</TabsTrigger>
            <TabsTrigger value="invoices">{t('billing.invoices')}</TabsTrigger>
            <TabsTrigger value="add-services">{t('billing.addServices')}</TabsTrigger>
            <TabsTrigger value="agreement">{t('billing.agreement')}</TabsTrigger>
          </TabsList>

          <TabsContent value="services" className="space-y-6">
            <div className="grid gap-6">
              {currentServices.map((service) => {
                const daysRemaining = calculateDaysRemaining(service.endDate);
                const progress = calculateProgress(service.startDate, service.endDate);
                
                return (
                  <Card key={service.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {getServiceIcon(service.id)}
                          <div>
                            <CardTitle className="text-lg">{service.name}</CardTitle>
                            <p className="text-sm text-muted-foreground">{service.description}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-semibold">{service.price.toLocaleString('sv-SE')} SEK/mån</p>                          <Badge className={getStatusColor(service.status)}>
                            {service.status === 'active' ? t('status.active') : service.status}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">                        <div>
                          <p className="text-sm text-muted-foreground">{t('billing.startDate')}</p>
                          <p className="font-medium">{format(service.startDate, 'dd MMM yyyy')}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">{t('billing.endDate')}</p>
                          <p className="font-medium">{format(service.endDate, 'dd MMM yyyy')}</p>
                        </div>
                      </div>
                      
                      <div className="space-y-2">                        <div className="flex justify-between text-sm">
                          <span>{t('billing.contractTime')}</span>
                          <span>{daysRemaining} {t('billing.daysLeft')}</span>
                        </div>
                        <Progress value={progress} className="h-2" />
                      </div>                      <div>
                        <p className="text-sm text-muted-foreground mb-2">{t('billing.includedFeatures')}</p>
                        <div className="flex flex-wrap gap-2">
                          {service.features.map((feature, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {feature}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="invoices" className="space-y-6">
            <Card>
              <CardHeader>                <div className="flex items-center justify-between">
                  <CardTitle>{t('billing.invoicesPayments')}</CardTitle><Button variant="outline" className="flex items-center gap-2">
                    <Download className="h-4 w-4" />
                    {t('billing.exportAll')}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>                    <TableRow>
                      <TableHead>{t('billing.invoiceNumber')}</TableHead>
                      <TableHead>{t('billing.date')}</TableHead>
                      <TableHead>{t('billing.services')}</TableHead>
                      <TableHead>{t('billing.dueDate')}</TableHead>
                      <TableHead>{t('billing.amount')}</TableHead>
                      <TableHead>{t('common.status')}</TableHead>
                      <TableHead>{t('billing.actions')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {invoices.map((invoice) => (
                      <TableRow key={invoice.id}>
                        <TableCell className="font-medium">{invoice.id}</TableCell>
                        <TableCell>{format(invoice.date, 'dd MMM yyyy')}</TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            {invoice.services.map((service, index) => (
                              <div key={index} className="text-sm text-muted-foreground">
                                {service}
                              </div>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>{format(invoice.dueDate, 'dd MMM yyyy')}</TableCell>
                        <TableCell className="font-medium">
                          {invoice.amount.toLocaleString('sv-SE')} SEK
                        </TableCell>
                        <TableCell>                          <Badge className={getInvoiceStatusColor(invoice.status)}>
                            {invoice.status === 'paid' ? t('billing.paid') : invoice.status}
                          </Badge>
                        </TableCell>
                        <TableCell>                          <Button variant="ghost" size="sm" className="flex items-center gap-1">
                            <Download className="h-3 w-3" />
                            {t('buttons.download')}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="add-services" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              {availableServices.map((service) => (
                <Card key={service.id} className="relative">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      {getServiceIcon(service.id)}
                      <div>
                        <CardTitle className="text-lg">{service.name}</CardTitle>
                        <p className="text-sm text-muted-foreground">{service.description}</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="text-center py-4">
                      <p className="text-3xl font-bold">
                        {service.price.toLocaleString('sv-SE')} SEK
                      </p>                      <p className="text-sm text-muted-foreground">
                        {service.isOneTime ? t('billing.oneTime') : t('billing.perMonth')}
                      </p>
                    </div>                    <div className="space-y-2">
                      <p className="text-sm font-medium">{t('billing.included')}:</p>
                      {service.features.map((feature, index) => (
                        <div key={index} className="flex items-center gap-2 text-sm">
                          <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                          {feature}
                        </div>
                      ))}
                    </div>                    <Button className="w-full" onClick={() => setSelectedService(service.id)}>
                      <Plus className="h-4 w-4 mr-2" />
                      {t('buttons.addService')}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="agreement" className="space-y-6">
            <Card>
              <CardHeader>                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  {t('billing.serviceAgreement')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-6">                  <div>
                    <h3 className="font-semibold mb-2">{t('billing.contractInfo')}</h3>
                    <div className="space-y-2 text-sm">                      <div className="flex justify-between">
                        <span className="text-muted-foreground">{t('billing.contractNumber')}:</span>
                        <span>ZD-2024-0156</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">{t('billing.startDate')}:</span>
                        <span>{t('billing.contractStartDate', '15 januari 2024')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">{t('billing.contractPeriod')}:</span>
                        <span>{t('billing.contractMonths', '12 månader')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">{t('billing.autoRenewal')}:</span>
                        <span>{t('common.yes', 'Ja')}</span>
                      </div>
                    </div>
                  </div>
                    <div>
                    <h3 className="font-semibold mb-2">{t('common.contactInfo')}</h3>
                    <div className="space-y-2 text-sm">                      <div className="flex justify-between">
                        <span className="text-muted-foreground">{t('common.accountManager')}:</span>
                        <span>Marcus Andersson</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">{t('common.email')}:</span>
                        <span>{t('contacts.accountManagerEmail', 'marcus@zectordigital.se')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">{t('common.phone')}:</span>
                        <span>+46 8 123 456 78</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">{t('common.support')}:</span>
                        <span>support@zectordigital.se</span>
                      </div>
                    </div>
                  </div>
                </div>

                <Separator />                <div>
                  <h3 className="font-semibold mb-4">{t('billing.contractDocuments')}</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-muted-foreground" />                        <div>
                          <p className="font-medium">{t('billing.mainContract')}</p>
                          <p className="text-sm text-muted-foreground">{t('billing.signedDate', { date: '15 januari 2024' })}</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        {t('buttons.download')}
                      </Button>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{t('billing.additionalContract')}</p>
                          <p className="text-sm text-muted-foreground">{t('billing.signedDate', { date: '1 mars 2024' })}</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        {t('buttons.download')}
                      </Button>
                    </div>                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{t('billing.generalTerms')}</p>
                          <p className="text-sm text-muted-foreground">{t('billing.versionInfo', { version: '2.1', date: '1 januari 2024' })}</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        {t('buttons.download')}
                      </Button>
                    </div>
                  </div>
                </div>

                <Separator />                <div>
                  <h3 className="font-semibold mb-2">{t('billing.cancellationRenewal')}</h3>
                  <div className="bg-muted/50 p-4 rounded-lg space-y-2 text-sm">                    <p>
                      <strong>{t('billing.cancellationPeriod')}:</strong> {t('billing.cancellationDays', '30 dagar före avtalsperiodens slut')}
                    </p>
                    <p>
                      <strong>{t('billing.nextRenewal')}:</strong> {t('billing.nextRenewalDate', '15 januari 2025')}
                    </p>
                    <p>
                      <strong>{t('billing.lastCancellationDate')}:</strong> {t('billing.lastCancellationDateValue', '15 december 2024')}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Billing;
