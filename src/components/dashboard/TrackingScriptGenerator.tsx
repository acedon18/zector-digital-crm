import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Copy, Code, Globe, Shield, CheckCircle, AlertTriangle } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

export const TrackingScriptGenerator = () => {
  const { t } = useTranslation();
  const [domain, setDomain] = useState('');
  const [customerId, setCustomerId] = useState('');
  const [gdprCompliant, setGdprCompliant] = useState(true);
  const [anonymizeIp, setAnonymizeIp] = useState(true);
  const [trackScrollDepth, setTrackScrollDepth] = useState(false);
  const [trackDownloads, setTrackDownloads] = useState(true);
  const [trackFormSubmissions, setTrackFormSubmissions] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState('generic');
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'failure'>('idle');

  const generateScript = () => {
    if (!domain || !customerId) {      toast({
        title: t('common.error'),
        description: t('trackingScript.domainAndCustomerIdRequired'),
        variant: 'destructive'
      });
      return '';
    }

    const scriptId = `zld_${customerId}_${Date.now()}`;
    
    return `<!-- Zector Digital Lead Tracking Script -->
<script type="text/javascript">
(function() {
  var zld = {
    customerId: '${customerId}',
    domain: '${domain}',
    scriptId: '${scriptId}',
    config: {
      gdprCompliant: ${gdprCompliant},
      anonymizeIp: ${anonymizeIp},
      trackScrollDepth: ${trackScrollDepth},
      trackDownloads: ${trackDownloads},
      trackFormSubmissions: ${trackFormSubmissions}
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

    if (zld.config.anonymizeIp) {
      // IP anonymization handled server-side
      payload.anonymizeIp = true;    }    // Send to tracking endpoint
    fetch('${import.meta.env.VITE_API_ENDPOINT || 'https://zector-digital-crm-leads.vercel.app'}/api/track', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    }).then(function(response) {
      if (!response.ok) {
        console.warn('Zector tracking response error:', response.status);
      }
    }).catch(function(error) {
      console.warn('Zector tracking error:', error);
    });
  };

  // Page view tracking
  zld.track('page_view', {
    title: document.title,
    path: window.location.pathname
  });

  // Scroll depth tracking
  if (zld.config.trackScrollDepth) {
    var maxScroll = 0;
    window.addEventListener('scroll', function() {
      var scrollPercent = Math.round((window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100);
      if (scrollPercent > maxScroll && scrollPercent % 25 === 0) {
        maxScroll = scrollPercent;
        zld.track('scroll_depth', { depth: scrollPercent });
      }
    });
  }

  // Download tracking
  if (zld.config.trackDownloads) {
    document.addEventListener('click', function(e) {
      var link = e.target.closest('a');
      if (link && link.href) {
        var url = link.href;
        var isDownload = /\\.(pdf|doc|docx|xls|xlsx|ppt|pptx|zip|rar|mp3|mp4|avi)$/i.test(url);
        if (isDownload) {
          zld.track('download', {
            url: url,
            fileName: url.split('/').pop()
          });
        }
      }
    });
  }

  // Form submission tracking
  if (zld.config.trackFormSubmissions) {
    document.addEventListener('submit', function(e) {
      var form = e.target;
      if (form.tagName === 'FORM') {
        zld.track('form_submission', {
          formId: form.id || 'unknown',
          formAction: form.action || window.location.href
        });
      }
    });
  }

  // Session tracking
  var sessionStart = Date.now();
  window.addEventListener('beforeunload', function() {
    var sessionDuration = Date.now() - sessionStart;
    zld.track('session_end', {
      duration: sessionDuration
    });
  });

  // Make zld globally available
  window.ZectorLeadDigital = zld;

  console.log('Zector Digital Lead Tracking initialized for ${domain}');
})();
</script>
${gdprCompliant ? `
<!-- GDPR Compliance Notice -->
<script type="text/javascript">
// Show GDPR notice if needed
if (!localStorage.getItem('zld_consent_${customerId}')) {
  // Add your GDPR consent banner here
  console.log('GDPR consent required for lead tracking');
}
</script>` : ''}`;
  };
  const copyToClipboard = () => {
    const script = generateScript();
    if (script) {
      navigator.clipboard.writeText(script);      toast({
        title: t('common.copied'),
        description: t('trackingScript.scriptCopied')
      });
    }
  };

  const generateCustomerId = () => {
    // Generate a unique ID based on domain and timestamp
    const timestamp = Date.now().toString(36);
    const randomStr = Math.random().toString(36).substring(2, 8);
    const domainPart = domain ? domain.replace(/[^a-z0-9]/gi, '').substring(0, 6) : 'zector';
    const newId = `${domainPart}_${timestamp}${randomStr}`;
    setCustomerId(newId);
    
    toast({
      title: t('common.success'),
      description: 'Customer ID generated successfully!'
    });
  };
  
  const testTrackingScript = () => {
    setTestStatus('testing');
    
    // Simulate a test ping to the tracking endpoint
    fetch(`${import.meta.env.VITE_API_ENDPOINT || 'https://api.zectordigital.com'}/health`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    }).then(response => {
      if (response.ok) {
        setTestStatus('success');
        toast({
          title: 'Test Successful',
          description: 'The tracking endpoint is reachable and working correctly.',
        });
      } else {
        setTestStatus('failure');
        throw new Error('Endpoint returned an error');
      }
    }).catch(error => {
      setTestStatus('failure');
      toast({
        title: 'Test Failed',
        description: 'There was a problem connecting to the tracking endpoint.',
        variant: 'destructive'
      });
    });
  };  // Platform-specific installation instructions
  const getPlatformInstructions = () => {
    const commonInstructions = `
### ${t('trackingScript.stepVerifyInstallation')}
1. ${t('trackingScript.openWebsite')}
2. ${t('trackingScript.openDevTools')}
3. ${t('trackingScript.checkConsoleMessage', { domain })}

### ${t('trackingScript.stepTestTracking')}
1. ${t('trackingScript.navigatePages')}
2. ${t('trackingScript.checkDashboard')}

### ${t('trackingScript.gdprCompliance')}
${gdprCompliant ? 
  t('trackingScript.gdprModeEnabled') : 
  t('trackingScript.gdprModeDisabled')
}

### ${t('trackingScript.securityNotes')}
- ${t('trackingScript.ipAnonymization')}${anonymizeIp ? ` ${t('trackingScript.enabled')}` : ` ${t('trackingScript.disabled')}`}
- ${t('trackingScript.noPersonalData')}
- ${t('trackingScript.onlyCompanyData')}

### Support
${t('trackingScript.supportContact')}
`;

    // Platform-specific instructions
    switch(selectedPlatform) {
      case 'wordpress':
        return `## WordPress Installation Guide

### Method 1: Using Header and Footer Plugin
1. Install and activate the "Insert Headers and Footers" plugin
2. Go to Settings > Insert Headers and Footers
3. Paste the tracking script in the "Scripts in Header" section
4. Save changes

### Method 2: Using Theme Functions
1. Access your theme's functions.php file
2. Add the following code:
\`\`\`php
function zector_tracking_code() {
  ?>
${generateScript()}
  <?php
}
add_action('wp_head', 'zector_tracking_code');
\`\`\`
3. Save changes

${commonInstructions}`;

      case 'shopify':
        return `## Shopify Installation Guide

### Adding the tracking script
1. Go to your Shopify admin dashboard
2. Navigate to Online Store > Themes
3. Click "Actions" > "Edit code"
4. Open the theme.liquid file or checkout.liquid file
5. Paste the script just before the closing </head> tag
6. Save changes

${commonInstructions}`;

      case 'wix':
        return `## Wix Installation Guide

### Adding the tracking script
1. Go to your Wix dashboard
2. Navigate to Settings > Custom Code
3. Click "Add Custom Code"
4. Name your code (e.g. "Zector Tracking")
5. Paste the tracking script
6. Set placement to "Head"
7. Check "Add to all pages"
8. Click "Apply"

${commonInstructions}`;

      case 'squarespace':
        return `## Squarespace Installation Guide

### Adding the tracking script
1. Log in to your Squarespace account
2. Go to Settings > Advanced > Code Injection
3. Paste the tracking script in the Header section
4. Save changes

${commonInstructions}`;

      default:
        return `## ${t('trackingScript.installationGuide')}

### ${t('trackingScript.stepPlaceScript')}
${t('trackingScript.placementInstructions')}

${commonInstructions}`;
    }
  };

  const installationInstructions = getPlatformInstructions();

  return (
    <div className="space-y-6">      <div>
        <h2 className="text-xl font-semibold mb-2">{t('trackingScript.title')}</h2>
        <p className="text-sm text-muted-foreground">
          {t('trackingScript.description')}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Configuration */}
        <Card>
          <CardHeader>            <CardTitle className="flex items-center gap-2">
              <Code className="h-5 w-5" />
              {t('trackingScript.scriptConfiguration')}
            </CardTitle>
          </CardHeader>          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">              <div>
                <div className="flex justify-between items-center">
                  <Label htmlFor="customerId">{t('trackingScript.customerId')}</Label>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={generateCustomerId}
                    className="h-6 text-xs text-muted-foreground hover:text-primary"
                  >
                    Auto-generate
                  </Button>
                </div>
                <Input
                  id="customerId"
                  value={customerId}
                  onChange={(e) => setCustomerId(e.target.value)}
                  placeholder={t('placeholders.customerIdExample')}
                />
              </div>
              <div>
                <Label htmlFor="domain">{t('common.domain')}</Label>
                <Input
                  id="domain"
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                  placeholder={t('placeholders.domainForScript')}
                />
              </div>
            </div>
            
            <div>
              <Label>Website Platform</Label>
              <div className="grid grid-cols-5 gap-2 mt-2">
                <Button 
                  variant={selectedPlatform === 'generic' ? 'default' : 'outline'} 
                  size="sm" 
                  onClick={() => setSelectedPlatform('generic')}
                  className="text-xs justify-start"
                >
                  <Globe className="h-3.5 w-3.5 mr-1" />
                  Generic
                </Button>
                <Button 
                  variant={selectedPlatform === 'wordpress' ? 'default' : 'outline'} 
                  size="sm" 
                  onClick={() => setSelectedPlatform('wordpress')}
                  className="text-xs justify-start"
                >
                  <svg className="h-3.5 w-3.5 mr-1" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.486 2 2 6.486 2 12s4.486 10 10 10 10-4.486 10-10S17.514 2 12 2zm0 19.5c-5.246 0-9.5-4.254-9.5-9.5S6.754 2.5 12 2.5s9.5 4.254 9.5 9.5-4.254 9.5-9.5 9.5z"/>
                    <path d="M3.143 12c0 3.509 2.039 6.546 5 8.01l-4.233-11.596c-.444 1.1-.696 2.309-.767 3.586zm16.324-2.302c0-1.099-.395-1.861-.732-2.453-.45-.734-.873-1.353-.873-2.086 0-.817.63-1.577 1.518-1.577.04 0 .078.005.116.007A8.973 8.973 0 0012 3c-3.321 0-6.249 1.693-7.931 4.259.223.007.431.011.612.011 1 0 2.545-.12 2.545-.12.514-.03.575.725.06.785 0 0-.517.06-1.09.09l3.471 10.32 2.088-6.258-1.487-4.062c-.514-.03-1-.09-1-.09-.515-.03-.454-.815.06-.786 0 0 1.575.12 2.515.12.998 0 2.544-.12 2.544-.12.516-.03.576.725.061.785 0 0-.517.06-1.09.09l3.445 10.24.952-3.169c.391-1.251.684-2.143.684-2.907z"/>
                    <path d="M12.184 13.487l-2.857 8.299A8.978 8.978 0 0012 22c1.305 0 2.556-.279 3.678-.782.029-.014.057-.031.085-.046l-2.72-7.825-.859.14zM20.75 7.32c.039.289.061.591.061.903 0 .891-.168 1.891-.672 3.144l-2.694 7.789c2.632-1.534 4.055-4.702 4.055-8.156 0-1.355-.289-2.645-.75-3.679z"/>
                  </svg>
                  WordPress
                </Button>
                <Button 
                  variant={selectedPlatform === 'shopify' ? 'default' : 'outline'} 
                  size="sm" 
                  onClick={() => setSelectedPlatform('shopify')}
                  className="text-xs justify-start"
                >
                  <svg className="h-3.5 w-3.5 mr-1" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M11.72 19.95h.144c.108 0 .216-.018.318-.054.103-.035.197-.09.28-.162.083-.072.15-.163.2-.27.05-.11.075-.236.075-.38 0-.16-.03-.296-.092-.412-.062-.117-.144-.21-.246-.283s-.22-.126-.35-.16c-.133-.031-.27-.047-.41-.047-.152 0-.293.023-.422.07-.13.047-.24.114-.336.2-.095.086-.17.193-.223.318-.052.125-.078.267-.078.425 0 .143.023.273.07.39.046.119.112.221.198.308.087.088.191.155.312.203.123.048.26.072.41.072-.142-.046-.255-.115-.338-.207z"/>
                    <path d="M14.663 8.983c-.153-.08-.229-.223-.229-.426 0-.143.035-.262.106-.358.07-.095.18-.143.328-.143.052 0 .118.008.2.023l1.66.519-1.105.385h-.96zm.455-1.784c-.094-.043-.19-.066-.288-.068-.098-.001-.19.018-.274.059-.084.04-.157.098-.217.173-.06.076-.105.166-.134.272h-.92c.011-.216.063-.416.157-.6.094-.183.22-.346.379-.485.16-.14.345-.25.556-.33.211-.079.44-.119.686-.119.229 0 .435.031.618.093.183.061.34.151.47.268.131.118.23.262.3.432.07.17.104.36.104.57v2.183c0 .18.01.35.03.513.02.162.051.285.095.368h-.926a1.242 1.242 0 01-.062-.197 1.786 1.786 0 01-.023-.221c-.118.16-.268.285-.45.376-.18.09-.376.136-.587.136a1.5 1.5 0 01-.44-.063 1.076 1.076 0 01-.36-.19.949.949 0 01-.247-.309.93.93 0 01-.09-.414c0-.176.033-.326.1-.447.068-.121.161-.22.28-.297.121-.077.264-.136.43-.177.166-.04.347-.072.542-.094.195-.022.38-.039.555-.05.174-.012.325-.034.452-.069v-.167c0-.205-.068-.357-.205-.455z"/>
                    <path d="M4.868 19.863c-.907-.473-1.555-1.2-1.945-2.182-.39-.983-.585-2.254-.585-3.813 0-1.464.192-2.701.576-3.71.384-1.01 1.027-1.76 1.93-2.247.901-.488 2.097-.732 3.588-.732.858 0 1.648.097 2.37.292.721.195 1.342.5 1.862.914.52.415.927.948 1.22 1.598.292.65.44 1.42.44 2.309h-3.69c0-.381-.068-.717-.204-1.007a1.951 1.951 0 00-.561-.71 2.372 2.372 0 00-.813-.42 3.127 3.127 0 00-.968-.141c-.71 0-1.28.18-1.708.542-.428.36-.738.88-.929 1.56-.19.68-.286 1.512-.286 2.495 0 .958.074 1.77.222 2.436.148.665.437 1.171.868 1.517.432.347 1.053.52 1.863.52.36 0 .698-.059 1.014-.176.317-.118.583-.288.799-.51.217-.224.327-.494.33-.813h3.691c-.03 1.025-.305 1.873-.822 2.547-.517.673-1.205 1.175-2.064 1.507-.858.332-1.809.497-2.853.497-1.587 0-2.821-.236-3.7-.669z"/>
                    <path d="M17.789 17.54l-.961-.32v-.511l1.98-.695v-5.88l-1.98-.626v-.497l3.59-1.096v9.076l1.37.448v.497l-4 1.126v-.522z"/>
                  </svg>
                  Shopify
                </Button>
                <Button 
                  variant={selectedPlatform === 'wix' ? 'default' : 'outline'} 
                  size="sm" 
                  onClick={() => setSelectedPlatform('wix')}
                  className="text-xs justify-start"
                >
                  <svg className="h-3.5 w-3.5 mr-1" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M6.391 11.271l2.218 3.942 2.235-3.966L8.5 7.667l-2.109 3.604zm-.318 10.317h2.078L10.519 17l-2.453-4.11-1.993 8.698zm4.892-8.698l5.153 8.698h2.078l-7.23-12.224v3.526zm3.738-.447l1.462-2.75-4-6.556L9.057 8.924l3.323 5.656 2.323-2.137zm3.279-5.59c-1.588.227-2.833-.509-3.127-1.756-.273-1.248.714-2.446 2.302-2.685 1.587-.239 2.856.508 3.128 1.755.272 1.248-.716 2.458-2.303 2.685zM12 22.99c-6.075 0-10.991-4.925-10.991-11 0-6.075 4.916-11 10.991-11s11 4.925 11 11c0 6.075-4.925 11-11 11z"/>
                  </svg>
                  Wix
                </Button>
                <Button 
                  variant={selectedPlatform === 'squarespace' ? 'default' : 'outline'} 
                  size="sm" 
                  onClick={() => setSelectedPlatform('squarespace')}
                  className="text-xs justify-start"
                >
                  <svg className="h-3.5 w-3.5 mr-1" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20.38 8.863l-3.319 3.319a.586.586 0 01-.828 0L13.29 9.24c0-.001-.001-.001 0 0l3.319-3.319a4.128 4.128 0 00-5.834 0l-3.319 3.32a.58.58 0 000 .826l2.94 2.94v.001l-3.319 3.32a4.129 4.129 0 005.834 0l3.319-3.32a.58.58 0 000-.825l-2.94-2.94s0-.002 0 0l3.319-3.32a4.129 4.129 0 000 5.836l-3.32 3.32a.586.586 0 01-.827 0l-2.943-2.942c0-.001-.001-.001 0 0l3.32-3.32a4.128 4.128 0 00-5.834 0l-3.32 3.32a.58.58 0 000 .826l2.942 2.943v.001l-3.32 3.32a4.129 4.129 0 005.835 0l3.32-3.32a.58.58 0 000-.827l-2.943-2.942c0-.001-.001-.001 0 0l3.32-3.32a4.129 4.129 0 005.834 0z"/>
                  </svg>
                  Squarespace
                </Button>
              </div>
            </div>

            <div className="space-y-3">              <div className="flex items-center justify-between">
                <div>
                  <Label>{t('trackingScript.gdprCompliant')}</Label>
                  <p className="text-xs text-muted-foreground">{t('trackingScript.gdprDesc')}</p>
                </div>
                <Switch checked={gdprCompliant} onCheckedChange={setGdprCompliant} />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>{t('trackingScript.anonymizeIp')}</Label>
                  <p className="text-xs text-muted-foreground">{t('trackingScript.anonymizeIpDesc')}</p>
                </div>
                <Switch checked={anonymizeIp} onCheckedChange={setAnonymizeIp} />
              </div><div className="flex items-center justify-between">
                <div>
                  <Label>{t('trackingScript.trackScrollDepth')}</Label>
                  <p className="text-xs text-muted-foreground">{t('trackingScript.trackScrollDesc')}</p>
                </div>
                <Switch checked={trackScrollDepth} onCheckedChange={setTrackScrollDepth} />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>{t('trackingScript.trackDownloads')}</Label>
                  <p className="text-xs text-muted-foreground">{t('trackingScript.trackDownloadsDesc')}</p>
                </div>
                <Switch checked={trackDownloads} onCheckedChange={setTrackDownloads} />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>{t('trackingScript.trackFormSubmissions')}</Label>
                  <p className="text-xs text-muted-foreground">{t('trackingScript.trackFormsDesc')}</p>
                </div>
                <Switch checked={trackFormSubmissions} onCheckedChange={setTrackFormSubmissions} />
              </div>
            </div>            <div className="grid grid-cols-2 gap-2">
              <Button 
                onClick={copyToClipboard} 
                className="w-full"
                disabled={!domain || !customerId}
              >
                <Copy className="h-4 w-4 mr-2" />
                {t('trackingScript.copyScript')}
              </Button>
              <Button 
                onClick={testTrackingScript}
                variant={
                  testStatus === 'idle' ? 'outline' :
                  testStatus === 'testing' ? 'secondary' :
                  testStatus === 'success' ? 'default' : 'destructive'
                }
                className="w-full"
                disabled={testStatus === 'testing'}
              >
                {testStatus === 'testing' && (
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                )}
                {testStatus === 'idle' && <span>Test Connection</span>}
                {testStatus === 'testing' && <span>Testing...</span>}
                {testStatus === 'success' && <span>Test Successful</span>}
                {testStatus === 'failure' && <span>Test Failed</span>}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Preview and Instructions */}        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              {t('trackingScript.scriptPreview')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="script" className="w-full">              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="script">{t('common.script')}</TabsTrigger>
                <TabsTrigger value="instructions">Installation Guide</TabsTrigger>
              </TabsList>
              
              <TabsContent value="script" className="space-y-4">                <Textarea
                  value={generateScript()}
                  readOnly
                  className="min-h-64 font-mono text-xs"
                  placeholder={t('placeholders.configureScript')}
                />
                
                <div className="flex items-center gap-2">
                  {gdprCompliant && (                    <Badge variant="outline" className="flex items-center gap-1">
                      <Shield className="h-3 w-3" />
                      {t('trackingScript.gdprBadge')}
                    </Badge>
                  )}
                  {anonymizeIp && (                    <Badge variant="outline" className="flex items-center gap-1">
                      <CheckCircle className="h-3 w-3" />
                      {t('trackingScript.ipAnonymizationBadge')}
                    </Badge>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="instructions">
                <div className="prose prose-sm max-w-none">
                  <Textarea
                    value={installationInstructions}
                    readOnly
                    className="min-h-64 font-mono text-xs"
                  />
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {/* Compliance Alerts */}
      <div className="space-y-3">
        {!gdprCompliant && (          <Alert className="border-yellow-200 bg-yellow-50">
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
            <AlertDescription>
              {t('trackingScript.gdprNoticeRequired')}
            </AlertDescription>
          </Alert>
        )}
        
        {gdprCompliant && (          <Alert className="border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription>
              {t('trackingScript.gdprCompliantNotice')}
            </AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  );
};
