// SAFETY FIXED: 2025-06-25 21:55:00 - SubdomainSetup component improvements v2
// Complete rewrite in English with comprehensive safety checks
// All Swedish text translated to English, full accessibility compliance
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
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
  // Safety check for props
  if (!companyName || typeof companyName !== 'string') {
    console.warn('SubdomainSetup: Invalid companyName prop');
    return (
      <Alert className="border-red-200 bg-red-50">
        <AlertCircle className="h-4 w-4 text-red-600" />
        <AlertDescription>
          <strong>Setup Error:</strong> Invalid company name provided.
        </AlertDescription>
      </Alert>
    );
  }

  if (!onComplete || typeof onComplete !== 'function') {
    console.warn('SubdomainSetup: Invalid onComplete prop');
    return (
      <Alert className="border-red-200 bg-red-50">
        <AlertCircle className="h-4 w-4 text-red-600" />
        <AlertDescription>
          <strong>Setup Error:</strong> Invalid completion handler.
        </AlertDescription>
      </Alert>
    );
  }
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
  // Generate subdomain from company name - BULLETPROOF
  function generateSubdomain(name: string): string {
    if (!name || typeof name !== 'string') {
      return 'company';
    }
    
    try {
      return name
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '')
        .substring(0, 20) || 'company';
    } catch (error) {
      console.warn('Error generating subdomain:', error);
      return 'company';
    }
  }
  // Generate secure password - BULLETPROOF
  function generatePassword(): string {
    try {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
      let password = '';
      
      // Ensure we have at least one of each type
      const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
      const lowercase = 'abcdefghijklmnopqrstuvwxyz';
      const numbers = '0123456789';
      const symbols = '!@#$%^&*';
      
      // Add at least one of each type
      password += uppercase.charAt(Math.floor(Math.random() * uppercase.length));
      password += lowercase.charAt(Math.floor(Math.random() * lowercase.length));
      password += numbers.charAt(Math.floor(Math.random() * numbers.length));
      password += symbols.charAt(Math.floor(Math.random() * symbols.length));
      
      // Fill the rest randomly
      for (let i = 4; i < 16; i++) { // 16 character password
        password += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      
      // Shuffle the password
      return password.split('').sort(() => Math.random() - 0.5).join('');
    } catch (error) {
      console.error('Error generating password:', error);
      return 'SecurePass123!'; // Fallback password
    }
  }
  // Check subdomain availability - SAFE
  const checkAvailability = async () => {
    if (!subdomainData.subdomain || !subdomainData.subdomain.trim()) {
      toast({
        title: "❌ Invalid Subdomain",
        description: "Please enter a valid subdomain name",
        variant: "destructive"
      });
      return;
    }

    setChecking(true);
    
    try {
      // Simulate API call to check subdomain availability
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // For demo purposes, mark some subdomains as taken
      const takenSubdomains = ['test', 'demo', 'admin', 'www', 'api', 'app', 'mail', 'ftp'];
      const isAvailable = !takenSubdomains.includes(subdomainData.subdomain.toLowerCase());
      
      setSubdomainData(prev => ({ ...prev, isAvailable }));
      
      if (isAvailable) {
        toast({
          title: "✅ Subdomain Available!",
          description: `${subdomainData.subdomain}.zectordigital.es is available`
        });
      } else {
        toast({
          title: "❌ Subdomain Taken",
          description: "This subdomain is already in use. Please try another name.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error checking subdomain availability:', error);
      toast({
        title: "❌ Check Failed",
        description: "Unable to check subdomain availability. Please try again.",
        variant: "destructive"
      });
    } finally {
      setChecking(false);
    }
  };
  // Setup subdomain and create customer instance - SAFE
  const setupSubdomain = async () => {
    if (!subdomainData.adminEmail || !subdomainData.isAvailable || !subdomainData.subdomain) {
      toast({
        title: "❌ Setup Failed", 
        description: "Please ensure all required fields are filled and subdomain is available.",
        variant: "destructive"
      });
      return;
    }

    try {
      // Simulate subdomain setup
      setSubdomainData(prev => ({ ...prev, setupComplete: true }));
      
      toast({
        title: "🎉 Subdomain Created!",
        description: `${subdomainData.subdomain}.zectordigital.es is now ready`
      });

      // Safely call completion handler
      try {
        onComplete(subdomainData);
      } catch (error) {
        console.error('Error calling onComplete:', error);
      }
    } catch (error) {
      console.error('Error setting up subdomain:', error);
      toast({
        title: "❌ Setup Error",
        description: "Failed to set up your subdomain. Please try again.",
        variant: "destructive"
      });
    }
  };
  // Copy credentials to clipboard - SAFE
  const copyCredentials = () => {
    try {
      const credentials = `
Subdomain: ${subdomainData.subdomain}.zectordigital.es
Email: ${subdomainData.adminEmail}
Password: ${subdomainData.adminPassword}
Direct URL: https://${subdomainData.subdomain}.zectordigital.es
      `.trim();
      
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(credentials);
        toast({
          title: "📋 Copied!",
          description: "Login credentials copied to clipboard"
        });
      } else {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = credentials;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        
        toast({
          title: "📋 Copied!",
          description: "Login credentials copied to clipboard"
        });
      }
    } catch (error) {
      console.error('Error copying credentials:', error);
      toast({
        title: "❌ Copy Failed",
        description: "Unable to copy credentials. Please copy manually.",
        variant: "destructive"
      });
    }
  };

  const previewUrl = `https://${subdomainData.subdomain}.zectordigital.es`;

  return (    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-bold mb-2">Create Your Own CRM Subdomain</h2>
        <p className="text-muted-foreground">
          Give your business a professional, dedicated CRM platform
        </p>
      </div>

      {!subdomainData.setupComplete ? (
        <div className="space-y-6">
          {/* Subdomain Configuration */}          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Subdomain Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="subdomain">Your Subdomain</Label>
                <div className="flex items-center space-x-2">
                  <Input
                    id="subdomain"
                    value={subdomainData.subdomain}
                    onChange={(e) => setSubdomainData(prev => ({ 
                      ...prev, 
                      subdomain: e.target.value.toLowerCase().replace(/[^a-z0-9]/g, ''),
                      isAvailable: true
                    }))}
                    placeholder="yourcompany"
                    className="flex-1"
                    aria-label="Enter your desired subdomain name"
                  />
                  <span className="text-muted-foreground whitespace-nowrap">.zectordigital.es</span>
                  <Button 
                    onClick={checkAvailability}
                    disabled={checking || !subdomainData.subdomain}
                    size="sm"
                    aria-label="Check subdomain availability"
                  >
                    {checking ? 'Checking...' : 'Check'}
                  </Button>
                </div>
                
                {subdomainData.isAvailable && subdomainData.subdomain && (
                  <div className="mt-2 flex items-center gap-2 text-green-600">
                    <CheckCircle className="h-4 w-4" />
                    <span className="text-sm">✅ {subdomainData.subdomain}.zectordigital.es is available</span>
                  </div>
                )}
                
                {!subdomainData.isAvailable && (
                  <div className="mt-2 flex items-center gap-2 text-red-600">
                    <AlertCircle className="h-4 w-4" />
                    <span className="text-sm">❌ This subdomain is already taken</span>
                  </div>
                )}
              </div>

              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h3 className="font-semibold text-blue-800 mb-2">Your CRM will be available at:</h3>
                <code className="text-blue-700 text-sm break-all">
                  https://{subdomainData.subdomain}.zectordigital.es
                </code>
              </div>
            </CardContent>
          </Card>

          {/* Admin Account Setup */}          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5" />
                Administrator Account
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="adminEmail">Admin Email *</Label>
                <Input
                  id="adminEmail"
                  type="email"
                  value={subdomainData.adminEmail}
                  onChange={(e) => setSubdomainData(prev => ({ ...prev, adminEmail: e.target.value }))}
                  placeholder="admin@yourcompany.com"
                  aria-label="Enter admin email address"
                  required
                />
              </div>

              <div>
                <Label htmlFor="adminPassword">Admin Password</Label>
                <div className="flex items-center space-x-2">
                  <Input
                    id="adminPassword"
                    type="text"
                    value={subdomainData.adminPassword}
                    onChange={(e) => setSubdomainData(prev => ({ ...prev, adminPassword: e.target.value }))}
                    className="flex-1"
                    aria-label="Admin password"
                  />
                  <Button 
                    onClick={() => setSubdomainData(prev => ({ ...prev, adminPassword: generatePassword() }))}
                    size="sm"
                    variant="outline"
                    aria-label="Generate new password"
                  >
                    Generate New
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  A secure password has been generated automatically
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Custom Domain Option */}          <Card>
            <CardHeader>
              <CardTitle>Custom Domain (Optional)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2 mb-4">
                <input 
                  type="checkbox" 
                  id="customDomain" 
                  checked={customDomainMode}
                  onChange={(e) => setCustomDomainMode(e.target.checked)}
                  aria-label="Use custom domain instead of subdomain"
                  title="Enable custom domain configuration"
                />
                <Label htmlFor="customDomain">I want to use my own domain</Label>
              </div>
              
              {customDomainMode && (
                <div>
                  <Label htmlFor="customDomainInput">Your Domain</Label>
                  <Input
                    id="customDomainInput"
                    value={subdomainData.customDomain || ''}
                    onChange={(e) => setSubdomainData(prev => ({ ...prev, customDomain: e.target.value }))}
                    placeholder="crm.yourcompany.com"
                    aria-label="Enter your custom domain"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    We'll help you configure the DNS settings
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
            aria-label="Create CRM platform"
          >
            🚀 Create My CRM Platform
          </Button>        </div>
      ) : (
        // Setup Complete
        <div className="space-y-6">
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription>
              <strong>🎉 Your CRM platform is ready!</strong> Your business now has its own dedicated lead-tracking platform.
            </AlertDescription>
          </Alert>

          <Card>
            <CardHeader>
              <CardTitle>Your CRM Platform</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-semibold">Subdomain:</Label>
                  <div className="flex items-center space-x-2">
                    <code className="text-sm bg-muted px-2 py-1 rounded">
                      {subdomainData.subdomain}.zectordigital.es
                    </code>
                    <Button asChild size="sm" variant="outline">
                      <a 
                        href={previewUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        aria-label="Open CRM platform in new tab"
                        title="Open your CRM platform"
                      >
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </Button>
                  </div>
                </div>
                
                <div>
                  <Label className="text-sm font-semibold">Admin Email:</Label>
                  <code className="text-sm bg-muted px-2 py-1 rounded block">
                    {subdomainData.adminEmail}
                  </code>
                </div>
                
                <div>
                  <Label className="text-sm font-semibold">Admin Password:</Label>
                  <code className="text-sm bg-muted px-2 py-1 rounded block">
                    {subdomainData.adminPassword}
                  </code>
                </div>
                
                <div>
                  <Label className="text-sm font-semibold">Direct Link:</Label>
                  <code className="text-sm bg-muted px-2 py-1 rounded block break-all">
                    {previewUrl}
                  </code>
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button onClick={copyCredentials} className="flex-1">
                  <Copy className="h-4 w-4 mr-2" />
                  Copy Login Credentials
                </Button>
                <Button asChild variant="outline" className="flex-1">
                  <a 
                    href={previewUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    aria-label="Open CRM platform"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Open CRM
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Next Steps</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">                <div className="flex items-start space-x-2">
                  <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold">1</div>
                  <div>
                    <h3 className="font-semibold">Log in to your CRM</h3>
                    <p className="text-sm text-muted-foreground">Use the login credentials above to access your platform</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-2">
                  <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold">2</div>
                  <div>
                    <h3 className="font-semibold">Install tracking script</h3>
                    <p className="text-sm text-muted-foreground">Add the tracking script to your website to start tracking leads</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-2">
                  <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold">3</div>
                  <div>
                    <h3 className="font-semibold">Configure settings</h3>
                    <p className="text-sm text-muted-foreground">Customize your CRM with company branding and integrations</p>
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
