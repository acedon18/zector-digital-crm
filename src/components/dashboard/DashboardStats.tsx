import { ArrowUp, ArrowDown, Users, TrendingUp, UserPlus, DollarSign, Eye, Target } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';
import { leadsApi } from '@/lib/api';

interface StatsCardProps {
  title: string;
  value: number | string;
  change: number;
  changeLabel: string;
  icon: React.ReactNode;
  formatter?: (value: number | string) => string;
}

export function StatsCard({ title, value, change, changeLabel, icon, formatter }: StatsCardProps) {
  const isPositive = change > 0;

  const formattedValue = formatter ? formatter(value) : value;

  return (
    <Card className="dashboard-card">
      <div className="flex justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <h3 className="text-2xl font-bold mt-1">{formattedValue}</h3>
        </div>
        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">{icon}</div>
      </div>
      <div className="flex items-center mt-3">
        <div className={cn('flex items-center text-xs font-medium', isPositive ? 'text-crm-success' : 'text-crm-danger')}>
          {isPositive ? <ArrowUp className="h-3 w-3 mr-1" /> : <ArrowDown className="h-3 w-3 mr-1" />}
          {Math.abs(change)}%
        </div>
        <span className="text-xs text-muted-foreground ml-2">{changeLabel}</span>
      </div>
    </Card>
  );
}

export function DashboardStats() {
  const [stats, setStats] = useState({
    totalLeads: 0,
    newLeads: 0,
    hotLeads: 0,
    totalVisits: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const companies = await leadsApi.getCompanies();
        const analytics = await leadsApi.getAnalytics();
        
        const hotLeads = companies.filter(c => c.status === 'hot').length;
        const newLeads = companies.filter(c => {
          const dayAgo = new Date();
          dayAgo.setDate(dayAgo.getDate() - 1);
          return c.lastVisit > dayAgo;
        }).length;
        
        const totalVisits = companies.reduce((sum, company) => sum + company.totalVisits, 0);

        setStats({
          totalLeads: companies.length,
          newLeads,
          hotLeads,
          totalVisits
        });
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('sv-SE').format(value);
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="dashboard-card animate-pulse">
            <div className="h-20 bg-gray-200 rounded"></div>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatsCard 
        title="Totala Leads" 
        value={stats.totalLeads} 
        change={12} 
        changeLabel="sedan förra månaden" 
        icon={<Users className="h-5 w-5" />} 
        formatter={formatNumber}
      />
      <StatsCard 
        title="Nya Leads" 
        value={stats.newLeads} 
        change={8} 
        changeLabel="senaste dygnet" 
        icon={<UserPlus className="h-5 w-5" />} 
        formatter={formatNumber}
      />
      <StatsCard 
        title="Heta Leads" 
        value={stats.hotLeads} 
        change={15} 
        changeLabel="sedan förra veckan" 
        icon={<Target className="h-5 w-5" />} 
        formatter={formatNumber}
      />
      <StatsCard 
        title="Totala Besök" 
        value={stats.totalVisits} 
        change={-3} 
        changeLabel="sedan förra månaden" 
        icon={<Eye className="h-5 w-5" />} 
        formatter={formatNumber}
      />
    </div>
  );
}
