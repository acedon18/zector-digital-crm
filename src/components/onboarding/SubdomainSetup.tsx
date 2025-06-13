import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Globe, Key, Copy, ExternalLink, AlertCircle } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

interface SubdomainSetupData {
  companyName: string;
  subdomain: string;
  adminEmail: string;
  adminPassword: string;
  customDomain?: string;
  isAvailable: boolean;
  setupComplete: boolean;
}

export function SubdomainSetup({ 
  companyName, 
  onComplete 
}: { 
  companyName: string;
  onComplete: (data: SubdomainSetupData) => void;
}) {
  const { t } = useTranslation();
  const [subdomainData, setSubdomainData] = useState<SubdomainSetupData>({
    companyName,
    subdomain: generateSubdomain(companyName),
    adminEmail: '',
    adminPassword: generatePassword(),
    isAvailable: true,
    setupComplete: false
  });

  const [checking, setChecking] = useState(false);
  const [customDomainMode, setCustomDomainMode] = useState(false);

  // Generate subdomain from company name
  function generateSubdomain(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '')
      .substring(0, 20);
  }

  // Generate secure password
  function generatePassword(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  }

  // Check subdomain availability
  const checkAvailability = async () => {
    setChecking(true);
    
    // Simulate API call to check subdomain availability
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // For demo purposes, mark some subdomains as taken
    const takenSubdomains = ['test', 'demo', 'admin', 'www', 'api', 'app'];
    const isAvailable = !takenSubdomains.includes(subdomainData.subdomain);
    
    setSubdomainData(prev => ({ ...prev, isAvailable }));
    setChecking(false);
    
    if (isAvailable) {
      toast({
        title: "✅ Subdomän tillgänglig!",
        description: `${subdomainData.subdomain}.zectordigital.es är tillgänglig`
      });
    } else {
      toast({
        title: "❌ Subdomän upptagen",
        description: "Prova ett annat namn",
        variant: "destructive"
      });
    }
  };

  // Setup subdomain and create customer instance
  const setupSubdomain = async () => {
    if (!subdomainData.adminEmail || !subdomainData.isAvailable) return;

    // Simulate subdomain setup
    setSubdomainData(prev => ({ ...prev, setupComplete: true }));
    
    toast({
      title: "🎉 Subdomän skapad!",
      description: `${subdomainData.subdomain}.zectordigital.es är nu redo`
    });

    onComplete(subdomainData);
  };

  const copyCredentials = () => {
    const credentials = `
Subdomain: ${subdomainData.subdomain}.zectordigital.es
Email: ${subdomainData.adminEmail}
Password: ${subdomainData.adminPassword}
Direct URL: https://${subdomainData.subdomain}.zectordigital.es
    `;
    
    navigator.clipboard.writeText(credentials);
    toast({
      title: "📋 Kopierat!",
      description: "Inloggningsuppgifter kopierade till urklipp"
    });
  };

  const previewUrl = `https://${subdomainData.subdomain}.zectordigital.es`;

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-bold mb-2">Skapa Din Egen CRM-Subdomän</h2>
        <p className="text-muted-foreground">
          Ge ditt företag en professionell, dedikerad CRM-plattform
        </p>
      </div>

      {!subdomainData.setupComplete ? (
        <div className="space-y-6">
          {/* Subdomain Configuration */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Subdomän Konfiguration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="subdomain">Din Subdomän</Label>
                <div className="flex items-center space-x-2">
                  <Input
                    id="subdomain"
                    value={subdomainData.subdomain}
                    onChange={(e) => setSubdomainData(prev => ({ 
                      ...prev, 
                      subdomain: e.target.value.toLowerCase().replace(/[^a-z0-9]/g, ''),
                      isAvailable: true
                    }))}
                    placeholder="dittforetag"
                    className="flex-1"
                  />
                  <span className="text-muted-foreground whitespace-nowrap">.zectordigital.es</span>
                  <Button 
                    onClick={checkAvailability}
                    disabled={checking || !subdomainData.subdomain}
                    size="sm"
                  >
                    {checking ? 'Kollar...' : 'Kolla'}
                  </Button>
                </div>
                
                {subdomainData.isAvailable && subdomainData.subdomain && (
                  <div className="mt-2 flex items-center gap-2 text-green-600">
                    <CheckCircle className="h-4 w-4" />
                    <span className="text-sm">✅ {subdomainData.subdomain}.zectordigital.es är tillgänglig</span>
                  </div>
                )}
                
                {!subdomainData.isAvailable && (
                  <div className="mt-2 flex items-center gap-2 text-red-600">
                    <AlertCircle className="h-4 w-4" />
                    <span className="text-sm">❌ Denna subdomän är redan upptagen</span>
                  </div>
                )}
              </div>

              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h3 className="font-semibold text-blue-800 mb-2">Din CRM kommer att finnas på:</h3>
                <code className="text-blue-700 text-sm break-all">
                  https://{subdomainData.subdomain}.zectordigital.es
                </code>
              </div>
            </CardContent>
          </Card>

          {/* Admin Account Setup */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5" />
                Administratörskonto
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="adminEmail">Admin E-post *</Label>
                <Input
                  id="adminEmail"
                  type="email"
                  value={subdomainData.adminEmail}
                  onChange={(e) => setSubdomainData(prev => ({ ...prev, adminEmail: e.target.value }))}
                  placeholder="admin@dittforetag.se"
                />
              </div>

              <div>
                <Label htmlFor="adminPassword">Admin Lösenord</Label>
                <div className="flex items-center space-x-2">
                  <Input
                    id="adminPassword"
                    type="text"
                    value={subdomainData.adminPassword}
                    onChange={(e) => setSubdomainData(prev => ({ ...prev, adminPassword: e.target.value }))}
                    className="flex-1"
                  />
                  <Button 
                    onClick={() => setSubdomainData(prev => ({ ...prev, adminPassword: generatePassword() }))}
                    size="sm"
                    variant="outline"
                  >
                    Generera Nytt
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Ett säkert lösenord har genererats automatiskt
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Custom Domain Option */}
          <Card>
            <CardHeader>
              <CardTitle>Egen Domän (Valfritt)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2 mb-4">
                <input 
                  type="checkbox" 
                  id="customDomain" 
                  checked={customDomainMode}
                  onChange={(e) => setCustomDomainMode(e.target.checked)}
                />
                <Label htmlFor="customDomain">Jag vill använda min egen domän</Label>
              </div>
              
              {customDomainMode && (
                <div>
                  <Label htmlFor="customDomainInput">Din Domän</Label>
                  <Input
                    id="customDomainInput"
                    value={subdomainData.customDomain || ''}
                    onChange={(e) => setSubdomainData(prev => ({ ...prev, customDomain: e.target.value }))}
                    placeholder="crm.dittforetag.se"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Vi hjälper dig att konfigurera DNS-inställningar
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <Button 
            onClick={setupSubdomain}
            disabled={!subdomainData.adminEmail || !subdomainData.isAvailable || !subdomainData.subdomain}
            className="w-full"
            size="lg"
          >
            🚀 Skapa Min CRM-Plattform
          </Button>
        </div>
      ) : (
        // Setup Complete
        <div className="space-y-6">
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription>
              <strong>🎉 Din CRM-plattform är redo!</strong> Ditt företag har nu sin egen dedikerade lead-tracking plattform.
            </AlertDescription>
          </Alert>

          <Card>
            <CardHeader>
              <CardTitle>Din CRM-Plattform</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-semibold">Subdomän:</Label>
                  <div className="flex items-center space-x-2">
                    <code className="text-sm bg-muted px-2 py-1 rounded">
                      {subdomainData.subdomain}.zectordigital.es
                    </code>
                    <Button asChild size="sm" variant="outline">
                      <a href={previewUrl} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </Button>
                  </div>
                </div>
                
                <div>
                  <Label className="text-sm font-semibold">Admin E-post:</Label>
                  <code className="text-sm bg-muted px-2 py-1 rounded block">
                    {subdomainData.adminEmail}
                  </code>
                </div>
                
                <div>
                  <Label className="text-sm font-semibold">Admin Lösenord:</Label>
                  <code className="text-sm bg-muted px-2 py-1 rounded block">
                    {subdomainData.adminPassword}
                  </code>
                </div>
                
                <div>
                  <Label className="text-sm font-semibold">Direkt Länk:</Label>
                  <code className="text-sm bg-muted px-2 py-1 rounded block break-all">
                    {previewUrl}
                  </code>
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button onClick={copyCredentials} className="flex-1">
                  <Copy className="h-4 w-4 mr-2" />
                  Kopiera Inloggningsuppgifter
                </Button>
                <Button asChild variant="outline" className="flex-1">
                  <a href={previewUrl} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Öppna CRM
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Nästa Steg</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-start space-x-2">
                  <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold">1</div>
                  <div>
                    <h3 className="font-semibold">Logga in på din CRM</h3>
                    <p className="text-sm text-muted-foreground">Använd inloggningsuppgifterna ovan för att komma åt din plattform</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-2">
                  <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold">2</div>
                  <div>
                    <h3 className="font-semibold">Installera tracking-script</h3>
                    <p className="text-sm text-muted-foreground">Lägg till tracking-scriptet på din webbplats för att börja spåra leads</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-2">
                  <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold">3</div>
                  <div>
                    <h3 className="font-semibold">Konfigurera inställningar</h3>
                    <p className="text-sm text-muted-foreground">Anpassa din CRM med företagsbranding och integrationer</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
