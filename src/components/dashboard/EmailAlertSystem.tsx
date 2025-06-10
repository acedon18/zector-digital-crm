import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Mail, Bell, Users, Clock, Zap, Settings, Send, AlertTriangle } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  trigger: 'hot_lead' | 'return_visitor' | 'high_engagement' | 'pricing_page' | 'contact_page';
  isActive: boolean;
}

interface AlertRule {
  id: string;
  name: string;
  trigger: string;
  condition: string;
  recipients: string[];
  template: string;
  isActive: boolean;
  priority: 'low' | 'medium' | 'high' | 'urgent';
}

const defaultTemplates: EmailTemplate[] = [
  {
    id: 'hot-lead-alert',
    name: 'Het Lead Identifierat',
    subject: '🔥 Nytt het lead: {{company_name}} - {{score}} poäng',
    body: `Hej!

Ett nytt het lead har identifierats:

Företag: {{company_name}}
Domän: {{company_domain}}
Bransch: {{company_industry}}
Poäng: {{score}}/100
Senaste besök: {{last_visit}}
Totala besök: {{total_visits}}

Åtgärder som lett till hög poäng:
{{actions_taken}}

Rekommenderad nästa åtgärd: {{recommended_action}}

Gå till dashboard: {{dashboard_link}}

Bästa hälsningar,
Zector Digital Lead Intelligence`,
    trigger: 'hot_lead',
    isActive: true
  },
  {
    id: 'pricing-interest',
    name: 'Prissida Besökt',
    subject: '💰 {{company_name}} kollar på era priser',
    body: `{{company_name}} från {{company_industry}}-branschen har precis besökt er prissida.

Detta indikerar starkt köpintresse. De spenderade {{time_on_page}} minuter på sidan.

Historik:
- Totala besök: {{total_visits}}
- Senaste aktivitet: {{recent_pages}}

Kontakta dem medan intresset är varmt!

Dashboard: {{dashboard_link}}`,
    trigger: 'pricing_page',
    isActive: true
  },
  {
    id: 'high-engagement',
    name: 'Högt Engagemang',
    subject: '⭐ {{company_name}} visar högt engagemang',
    body: `{{company_name}} har visat exceptionellt högt engagemang:

- Session längd: {{session_duration}} minuter
- Sidor besökta: {{pages_viewed}}
- Nedladdningar: {{downloads}}

Detta är en stark signal om köpintresse. Överväg att kontakta dem direkt.

Se full aktivitet: {{dashboard_link}}`,
    trigger: 'high_engagement',
    isActive: true
  }
];

const defaultRules: AlertRule[] = [
  {
    id: 'immediate-hot-leads',
    name: 'Omedelbara Heta Leads',
    trigger: 'score_increase',
    condition: 'score >= 85',
    recipients: ['sales@example.com'],
    template: 'hot-lead-alert',
    isActive: true,
    priority: 'urgent'
  },
  {
    id: 'pricing-page-visits',
    name: 'Prissida Besök',
    trigger: 'page_visit',
    condition: 'page_url contains "pricing" OR page_url contains "priser"',
    recipients: ['sales@example.com'],
    template: 'pricing-interest',
    isActive: true,
    priority: 'high'
  },
  {
    id: 'high-engagement-sessions',
    name: 'Långa Sessioner',
    trigger: 'session_end',
    condition: 'session_duration >= 300 AND pages_viewed >= 5',
    recipients: ['sales@example.com'],
    template: 'high-engagement',
    isActive: true,
    priority: 'medium'
  }
];

export const EmailAlertSystem = () => {
  const [templates, setTemplates] = useState<EmailTemplate[]>(defaultTemplates);
  const [rules, setRules] = useState<AlertRule[]>(defaultRules);
  const [activeTab, setActiveTab] = useState('rules');
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null);
  const [testEmail, setTestEmail] = useState('');

  const sendTestEmail = async (templateId: string) => {
    if (!testEmail) {
      toast({
        title: 'Fel',
        description: 'Ange en e-postadress för test',
        variant: 'destructive'
      });
      return;
    }

    // Simulate sending test email
    toast({
      title: 'Test-email skickat!',
      description: `Test-email skickat till ${testEmail}`
    });
  };

  const toggleRule = (ruleId: string) => {
    setRules(prev => prev.map(rule => 
      rule.id === ruleId ? { ...rule, isActive: !rule.isActive } : rule
    ));
  };

  const toggleTemplate = (templateId: string) => {
    setTemplates(prev => prev.map(template => 
      template.id === templateId ? { ...template, isActive: !template.isActive } : template
    ));
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'Akut';
      case 'high': return 'Hög';
      case 'medium': return 'Medium';
      case 'low': return 'Låg';
      default: return priority;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-2">Email Alert System</h2>
        <p className="text-sm text-muted-foreground">
          Konfigurera automatiska e-postaviseringar för viktiga lead-aktiviteter
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="rules">Regler</TabsTrigger>
          <TabsTrigger value="templates">Mallar</TabsTrigger>
          <TabsTrigger value="settings">Inställningar</TabsTrigger>
        </TabsList>

        <TabsContent value="rules" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Aktiva Varningsregler
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {rules.map(rule => (
                <div key={rule.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium">{rule.name}</h3>
                        <Badge className={getPriorityColor(rule.priority)}>
                          {getPriorityText(rule.priority)}
                        </Badge>
                        {rule.isActive ? (
                          <Badge variant="secondary" className="bg-green-100 text-green-800">Aktiv</Badge>
                        ) : (
                          <Badge variant="secondary">Inaktiv</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        <strong>Trigger:</strong> {rule.trigger} | <strong>Villkor:</strong> {rule.condition}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        <strong>Mottagare:</strong> {rule.recipients.join(', ')}
                      </p>
                    </div>
                    <Switch 
                      checked={rule.isActive} 
                      onCheckedChange={() => toggleRule(rule.id)}
                    />
                  </div>
                </div>
              ))}

              <Button className="w-full">
                <Bell className="h-4 w-4 mr-2" />
                Lägg till ny regel
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                E-postmallar
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {templates.map(template => (
                <div key={template.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium">{template.name}</h3>
                        {template.isActive ? (
                          <Badge variant="secondary" className="bg-green-100 text-green-800">Aktiv</Badge>
                        ) : (
                          <Badge variant="secondary">Inaktiv</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        <strong>Ämne:</strong> {template.subject}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        <strong>Trigger:</strong> {template.trigger}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Switch 
                        checked={template.isActive} 
                        onCheckedChange={() => toggleTemplate(template.id)}
                      />
                    </div>
                  </div>
                  
                  <div className="border-t pt-3 mt-3">
                    <div className="flex gap-2">
                      <Input
                        placeholder="test@example.com"
                        value={testEmail}
                        onChange={(e) => setTestEmail(e.target.value)}
                        className="flex-1"
                      />
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => sendTestEmail(template.id)}
                      >
                        <Send className="h-4 w-4 mr-1" />
                        Testa
                      </Button>
                      <Button variant="outline" size="sm">
                        <Settings className="h-4 w-4 mr-1" />
                        Redigera
                      </Button>
                    </div>
                  </div>
                </div>
              ))}

              <Button className="w-full">
                <Mail className="h-4 w-4 mr-2" />
                Skapa ny mall
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>SMTP Inställningar</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="smtp-host">SMTP Server</Label>
                  <Input id="smtp-host" placeholder="smtp.gmail.com" />
                </div>
                <div>
                  <Label htmlFor="smtp-port">Port</Label>
                  <Input id="smtp-port" placeholder="587" />
                </div>
                <div>
                  <Label htmlFor="smtp-user">Användarnamn</Label>
                  <Input id="smtp-user" placeholder="din-email@example.com" />
                </div>
                <div>
                  <Label htmlFor="smtp-pass">Lösenord</Label>
                  <Input id="smtp-pass" type="password" placeholder="ditt-lösenord" />
                </div>
                <Button className="w-full">
                  <Send className="h-4 w-4 mr-2" />
                  Testa anslutning
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Allmänna Inställningar</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Aktivera e-postaviseringar</Label>
                    <p className="text-sm text-muted-foreground">Huvudbrytare för alla e-postuppdateringar</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Samla meddelanden</Label>
                    <p className="text-sm text-muted-foreground">Skicka max 1 e-post per timme</p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div>
                  <Label htmlFor="from-email">Från e-postadress</Label>
                  <Input id="from-email" placeholder="noreply@zectordigital.com" />
                </div>

                <div>
                  <Label htmlFor="from-name">Avsändarnamn</Label>
                  <Input id="from-name" placeholder="Zector Digital" />
                </div>

                <Button className="w-full">
                  <Settings className="h-4 w-4 mr-2" />
                  Spara inställningar
                </Button>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Test & Felsökning
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <h4 className="font-medium text-yellow-800 mb-2">Senaste e-postaviseringar</h4>
                  <div className="space-y-2">
                    <div className="text-sm">
                      <span className="font-medium">09:23:</span> Het lead alert skickat för Volvo Group
                    </div>
                    <div className="text-sm">
                      <span className="font-medium">08:45:</span> Prissida besök för Spotify Technology
                    </div>
                    <div className="text-sm">
                      <span className="font-medium">07:12:</span> Högt engagemang för Klarna Bank
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1">
                    <Zap className="h-4 w-4 mr-2" />
                    Skicka test-alert
                  </Button>
                  <Button variant="outline" className="flex-1">
                    <Settings className="h-4 w-4 mr-2" />
                    Visa loggar
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
