import { useState } from 'react';
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
  const [domain, setDomain] = useState('');
  const [customerId, setCustomerId] = useState('');
  const [gdprCompliant, setGdprCompliant] = useState(true);
  const [anonymizeIp, setAnonymizeIp] = useState(true);
  const [trackScrollDepth, setTrackScrollDepth] = useState(false);
  const [trackDownloads, setTrackDownloads] = useState(true);
  const [trackFormSubmissions, setTrackFormSubmissions] = useState(false);

  const generateScript = () => {
    if (!domain || !customerId) {
      toast({
        title: 'Fel',
        description: 'Domän och kund-ID krävs för att generera script',
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
      payload.anonymizeIp = true;
    }

    // Send to tracking endpoint
    fetch('https://api.zectordigital.com/track', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
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
      navigator.clipboard.writeText(script);
      toast({
        title: 'Kopierat!',
        description: 'Tracking script har kopierats till urklipp'
      });
    }
  };

  const installationInstructions = `
## Installation av Lead Tracking Script

### Steg 1: Placera scriptet
Klistra in scriptet precis före den avslutande </head>-taggen på alla sidor där du vill spåra besökare.

### Steg 2: Verifiera installation
1. Öppna din webbplats i en ny flik
2. Öppna Developer Tools (F12)
3. Kontrollera att meddelandet "Zector Digital Lead Tracking initialized for ${domain}" visas i konsolen

### Steg 3: Testa tracking
1. Navigera mellan olika sidor på din webbplats
2. Kontrollera i din Zector Digital-dashboard att besök registreras

### GDPR Compliance
${gdprCompliant ? 
  '✅ GDPR-kompatibelt läge är aktiverat. Scriptet inkluderar funktioner för att hantera användarsamtycke.' : 
  '⚠️ GDPR-kompatibelt läge är inaktiverat. Se till att du följer gällande dataskyddslagar.'
}

### Säkerhetsnoteringar
- Scriptet anonymiserar IP-adresser${anonymizeIp ? ' (aktiverat)' : ' (inaktiverat)'}
- Inga personliga data samlas in
- Endast företagsrelaterad information spåras

### Support
Vid frågor eller problem, kontakta support@zectordigital.com
`;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-2">Tracking Script Generator</h2>
        <p className="text-sm text-muted-foreground">
          Generera anpassat spårningsscript för din kundens webbplats
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Code className="h-5 w-5" />
              Scriptkonfiguration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="customerId">Kund-ID</Label>
                <Input
                  id="customerId"
                  value={customerId}
                  onChange={(e) => setCustomerId(e.target.value)}
                  placeholder="t.ex. customer_123"
                />
              </div>
              <div>
                <Label htmlFor="domain">Domän</Label>
                <Input
                  id="domain"
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                  placeholder="t.ex. example.com"
                />
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <Label>GDPR-kompatibelt</Label>
                  <p className="text-xs text-muted-foreground">Följer EU:s dataskyddslagar</p>
                </div>
                <Switch checked={gdprCompliant} onCheckedChange={setGdprCompliant} />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Anonymisera IP</Label>
                  <p className="text-xs text-muted-foreground">Anonymisera IP-adresser</p>
                </div>
                <Switch checked={anonymizeIp} onCheckedChange={setAnonymizeIp} />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Spåra scroll-djup</Label>
                  <p className="text-xs text-muted-foreground">Mät hur långt användare scrollar</p>
                </div>
                <Switch checked={trackScrollDepth} onCheckedChange={setTrackScrollDepth} />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Spåra nedladdningar</Label>
                  <p className="text-xs text-muted-foreground">Spåra PDF, DOC och andra filer</p>
                </div>
                <Switch checked={trackDownloads} onCheckedChange={setTrackDownloads} />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Spåra formulär</Label>
                  <p className="text-xs text-muted-foreground">Spåra formulärinskickningar</p>
                </div>
                <Switch checked={trackFormSubmissions} onCheckedChange={setTrackFormSubmissions} />
              </div>
            </div>

            <Button 
              onClick={copyToClipboard} 
              className="w-full"
              disabled={!domain || !customerId}
            >
              <Copy className="h-4 w-4 mr-2" />
              Kopiera script
            </Button>
          </CardContent>
        </Card>

        {/* Preview and Instructions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Script förhandsvisning
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="script" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="script">Script</TabsTrigger>
                <TabsTrigger value="instructions">Instruktioner</TabsTrigger>
              </TabsList>
              
              <TabsContent value="script" className="space-y-4">
                <Textarea
                  value={generateScript()}
                  readOnly
                  className="min-h-64 font-mono text-xs"
                  placeholder="Konfigurera domän och kund-ID för att generera script..."
                />
                
                <div className="flex items-center gap-2">
                  {gdprCompliant && (
                    <Badge variant="outline" className="flex items-center gap-1">
                      <Shield className="h-3 w-3" />
                      GDPR-kompatibel
                    </Badge>
                  )}
                  {anonymizeIp && (
                    <Badge variant="outline" className="flex items-center gap-1">
                      <CheckCircle className="h-3 w-3" />
                      IP-anonymisering
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
        {!gdprCompliant && (
          <Alert className="border-yellow-200 bg-yellow-50">
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
            <AlertDescription>
              GDPR-kompatibelt läge är inaktiverat. Se till att du följer gällande dataskyddslagar och inhämtar nödvändiga samtycken.
            </AlertDescription>
          </Alert>
        )}
        
        {gdprCompliant && (
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription>
              Scriptet är konfigurerat för GDPR-kompatibilitet. Kom ihåg att implementera en samtyckesbanner på webbplatsen.
            </AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  );
};
