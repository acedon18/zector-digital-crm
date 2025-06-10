import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { TrackingScriptGenerator } from '@/components/dashboard/TrackingScriptGenerator';
import { Users, Plus, Code, Settings, BarChart3, Eye, Clock, Shield } from 'lucide-react';
import { Customer } from '@/types/leads';
import { toast } from '@/components/ui/use-toast';
import { format } from 'date-fns';
import { sv } from 'date-fns/locale';

// Mock data för kunder
const mockCustomers: Customer[] = [
  {
    id: 'cust_1',
    name: 'TechCorp AB',
    email: 'admin@techcorp.se',
    domain: 'techcorp.se',
    isActive: true,
    plan: 'professional',
    createdAt: new Date('2025-05-15'),
    lastLogin: new Date('2025-06-08T14:30:00')
  },
  {
    id: 'cust_2',
    name: 'StartupXYZ',
    email: 'hello@startupxyz.com',
    domain: 'startupxyz.com',
    isActive: true,
    plan: 'basic',
    createdAt: new Date('2025-06-01'),
    lastLogin: new Date('2025-06-09T09:15:00')
  },
  {
    id: 'cust_3',
    name: 'Enterprise Solutions',
    email: 'it@enterprise-solutions.se',
    domain: 'enterprise-solutions.se',
    isActive: false,
    plan: 'enterprise',
    createdAt: new Date('2025-04-20'),
    lastLogin: new Date('2025-06-05T16:45:00')
  }
];

const AdminPanel = () => {
  const [customers, setCustomers] = useState<Customer[]>(mockCustomers);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isScriptDialogOpen, setIsScriptDialogOpen] = useState(false);
  const [newCustomer, setNewCustomer] = useState({
    name: '',
    email: '',
    domain: '',
    plan: 'basic' as const
  });

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case 'basic': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'professional': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'enterprise': return 'bg-orange-100 text-orange-800 border-orange-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPlanText = (plan: string) => {
    switch (plan) {
      case 'basic': return 'Basic';
      case 'professional': return 'Professional';
      case 'enterprise': return 'Enterprise';
      default: return plan;
    }
  };

  const handleCreateCustomer = () => {
    if (!newCustomer.name || !newCustomer.email || !newCustomer.domain) {
      toast({
        title: 'Fel',
        description: 'Alla fält måste fyllas i',
        variant: 'destructive'
      });
      return;
    }

    const customer: Customer = {
      id: `cust_${Date.now()}`,
      ...newCustomer,
      isActive: true,
      createdAt: new Date()
    };

    setCustomers(prev => [...prev, customer]);
    setNewCustomer({ name: '', email: '', domain: '', plan: 'basic' });
    setIsCreateDialogOpen(false);

    toast({
      title: 'Kund skapad',
      description: `${customer.name} har lagts till i systemet`
    });
  };

  const toggleCustomerStatus = (customerId: string) => {
    setCustomers(prev => prev.map(customer => 
      customer.id === customerId 
        ? { ...customer, isActive: !customer.isActive }
        : customer
    ));

    const customer = customers.find(c => c.id === customerId);
    toast({
      title: customer?.isActive ? 'Kund inaktiverad' : 'Kund aktiverad',
      description: `${customer?.name} har ${customer?.isActive ? 'inaktiverats' : 'aktiverats'}`
    });
  };

  const totalRevenue = customers.reduce((sum, customer) => {
    const prices = { basic: 299, professional: 599, enterprise: 1299 };
    return sum + (customer.isActive ? prices[customer.plan] : 0);
  }, 0);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Admin Panel</h1>
            <p className="text-muted-foreground">
              Hantera kunder, tracking scripts och systemöversikt
            </p>
          </div>
          <div className="flex gap-2">
            <Dialog open={isScriptDialogOpen} onOpenChange={setIsScriptDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Code className="h-4 w-4 mr-2" />
                  Script Generator
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Tracking Script Generator</DialogTitle>
                </DialogHeader>
                <TrackingScriptGenerator />
              </DialogContent>
            </Dialog>
            
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Lägg till kund
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Skapa ny kund</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">Företagsnamn</Label>
                    <Input
                      id="name"
                      value={newCustomer.name}
                      onChange={(e) => setNewCustomer(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="t.ex. TechCorp AB"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">E-post</Label>
                    <Input
                      id="email"
                      type="email"
                      value={newCustomer.email}
                      onChange={(e) => setNewCustomer(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="admin@techcorp.se"
                    />
                  </div>
                  <div>
                    <Label htmlFor="domain">Domän</Label>
                    <Input
                      id="domain"
                      value={newCustomer.domain}
                      onChange={(e) => setNewCustomer(prev => ({ ...prev, domain: e.target.value }))}
                      placeholder="techcorp.se"
                    />
                  </div>
                  <div>
                    <Label htmlFor="plan">Plan</Label>
                    <Select value={newCustomer.plan} onValueChange={(value: any) => setNewCustomer(prev => ({ ...prev, plan: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="basic">Basic (299 kr/mån)</SelectItem>
                        <SelectItem value="professional">Professional (599 kr/mån)</SelectItem>
                        <SelectItem value="enterprise">Enterprise (1299 kr/mån)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button onClick={handleCreateCustomer} className="w-full">
                    Skapa kund
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Admin Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <Users className="h-8 w-8 text-blue-600" />
                <div>
                  <p className="text-2xl font-bold">{customers.length}</p>
                  <p className="text-xs text-muted-foreground">Totala kunder</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <Eye className="h-8 w-8 text-green-600" />
                <div>
                  <p className="text-2xl font-bold">{customers.filter(c => c.isActive).length}</p>
                  <p className="text-xs text-muted-foreground">Aktiva kunder</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <BarChart3 className="h-8 w-8 text-purple-600" />
                <div>
                  <p className="text-2xl font-bold">{totalRevenue.toLocaleString('sv-SE')} kr</p>
                  <p className="text-xs text-muted-foreground">Månadsomsättning</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <Shield className="h-8 w-8 text-orange-600" />
                <div>
                  <p className="text-2xl font-bold">{customers.filter(c => c.isActive).length}</p>
                  <p className="text-xs text-muted-foreground">Aktiva scripts</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Customer Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Kundhantering
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Kund</TableHead>
                  <TableHead>Domän</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Senaste inloggning</TableHead>
                  <TableHead>Skapad</TableHead>
                  <TableHead>Åtgärder</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {customers.map((customer) => (
                  <TableRow key={customer.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>
                            {customer.name.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{customer.name}</div>
                          <div className="text-sm text-muted-foreground">{customer.email}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <code className="text-sm bg-muted px-2 py-1 rounded">{customer.domain}</code>
                    </TableCell>
                    <TableCell>
                      <Badge className={getPlanColor(customer.plan)}>
                        {getPlanText(customer.plan)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={customer.isActive ? 'default' : 'secondary'}>
                        {customer.isActive ? 'Aktiv' : 'Inaktiv'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm">
                        <Clock className="h-3 w-3" />
                        {customer.lastLogin ? format(customer.lastLogin, 'PPp', { locale: sv }) : 'Aldrig'}
                      </div>
                    </TableCell>
                    <TableCell>
                      {format(customer.createdAt, 'PP', { locale: sv })}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => toggleCustomerStatus(customer.id)}
                        >
                          {customer.isActive ? 'Inaktivera' : 'Aktivera'}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedCustomer(customer)}
                        >
                          <Settings className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default AdminPanel;
