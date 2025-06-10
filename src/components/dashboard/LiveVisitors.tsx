import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Users, Clock, Eye, TrendingUp } from 'lucide-react';
import { Company } from '@/types/leads';
import { leadsApi, subscribeToLiveUpdates } from '@/lib/api';
import { format } from 'date-fns';
import { sv } from 'date-fns/locale';

export const LiveVisitors = () => {
  const [recentVisitors, setRecentVisitors] = useState<Company[]>([]);
  const [onlineCount, setOnlineCount] = useState(0);

  useEffect(() => {
    loadRecentVisitors();
    
    // Prenumerera på live-uppdateringar
    const unsubscribe = subscribeToLiveUpdates((updatedCompany) => {
      setRecentVisitors(prev => {
        const filtered = prev.filter(c => c.id !== updatedCompany.id);
        return [updatedCompany, ...filtered].slice(0, 8);
      });
      
      // Simulera online-räknare
      setOnlineCount(prev => Math.max(1, prev + Math.floor(Math.random() * 3) - 1));
    });

    // Initial online count
    setOnlineCount(Math.floor(Math.random() * 20) + 5);

    return unsubscribe;
  }, []);

  const loadRecentVisitors = async () => {
    try {
      const visitors = await leadsApi.getRecentVisitors(8);
      setRecentVisitors(visitors);
    } catch (error) {
      console.error('Kunde inte hämta senaste besökare:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'hot': return 'bg-red-500';
      case 'warm': return 'bg-yellow-500';
      case 'cold': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Live Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-green-600" />
            Live Aktivitet
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{onlineCount}</div>
              <div className="text-sm text-muted-foreground">Aktiva nu</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{recentVisitors.length}</div>
              <div className="text-sm text-muted-foreground">Senaste timmen</div>
            </div>
          </div>
          
          <div className="mt-4 flex items-center gap-2 text-sm text-green-600">
            <TrendingUp className="h-4 w-4" />
            <span>Aktiviteten ökar med 15% jämfört med igår</span>
          </div>
        </CardContent>
      </Card>

      {/* Recent Visitors */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Senaste besökare
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {recentVisitors.map((company) => (
              <div key={`${company.id}-${company.lastVisit.getTime()}`} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="text-xs">
                        {company.name.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className={`absolute -top-1 -right-1 w-3 h-3 rounded-full ${getStatusColor(company.status)}`}></div>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-medium text-sm truncate">{company.name}</div>
                    <div className="text-xs text-muted-foreground">{company.industry}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {format(company.lastVisit, 'HH:mm')}
                  </div>
                  <Badge variant="outline" className="text-xs mt-1">
                    {company.totalVisits} besök
                  </Badge>
                </div>
              </div>
            ))}
          </div>
          
          {recentVisitors.length === 0 && (
            <div className="text-center text-muted-foreground py-8">
              <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>Inga besökare just nu</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
