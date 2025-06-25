// Tenant Switcher Component - Switch between multiple tenants
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Building2, Plus } from 'lucide-react';
import { useTenant } from '@/contexts/TenantContext';

interface TenantSwitcherProps {
  onCreateNew?: () => void;
  compact?: boolean;
}

interface UserTenant {
  tenantId: string;
  name: string;
  subdomain: string;
  plan: string;
  role: string;
  isActive: boolean;
}

export default function TenantSwitcher({ onCreateNew, compact = false }: TenantSwitcherProps) {
  const { tenant, user, switchTenant, isLoading } = useTenant();
  const [userTenants, setUserTenants] = useState<UserTenant[]>([]);
  const [loadingTenants, setLoadingTenants] = useState(false);

  useEffect(() => {
    if (user) {
      loadUserTenants();
    }
  }, [user]);

  const loadUserTenants = async () => {
    if (!user) return;
    
    try {
      setLoadingTenants(true);
      
      // Get all tenants where this user has access
      const response = await fetch(`/api/users/${user.userId}/tenants`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });
      
      if (response.ok) {
        const tenants = await response.json();
        setUserTenants(tenants);
      }
    } catch (error) {
      console.error('Failed to load user tenants:', error);
      // Fallback to current tenant only
      if (tenant) {
        setUserTenants([{
          tenantId: tenant.tenantId,
          name: tenant.name,
          subdomain: tenant.subdomain,
          plan: tenant.plan,
          role: user?.role || 'user',
          isActive: tenant.isActive
        }]);
      }
    } finally {
      setLoadingTenants(false);
    }
  };

  const handleTenantSwitch = async (tenantId: string) => {
    if (tenantId === tenant?.tenantId) return;
    
    try {
      await switchTenant(tenantId);
      // Optionally reload the page to ensure clean state
      window.location.reload();
    } catch (error) {
      console.error('Failed to switch tenant:', error);
    }
  };

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case 'enterprise': return 'bg-purple-100 text-purple-800';
      case 'professional': return 'bg-blue-100 text-blue-800';
      case 'starter': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800';
      case 'manager': return 'bg-orange-100 text-orange-800';
      case 'user': return 'bg-blue-100 text-blue-800';
      case 'viewer': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (compact) {
    return (
      <Select
        value={tenant?.tenantId || ''}
        onValueChange={handleTenantSwitch}
        disabled={isLoading || loadingTenants}
      >
        <SelectTrigger className="w-48">
          <div className="flex items-center">
            <Building2 className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Select tenant" />
          </div>
        </SelectTrigger>
        <SelectContent>
          {userTenants.map((t) => (
            <SelectItem key={t.tenantId} value={t.tenantId}>
              <div className="flex items-center justify-between w-full">
                <span>{t.name}</span>
                <div className="flex space-x-1 ml-2">
                  <Badge variant="secondary" className={`text-xs ${getPlanColor(t.plan)}`}>
                    {t.plan}
                  </Badge>
                  <Badge variant="outline" className={`text-xs ${getRoleColor(t.role)}`}>
                    {t.role}
                  </Badge>
                </div>
              </div>
            </SelectItem>
          ))}
          {onCreateNew && (
            <SelectItem value="create-new" onSelect={onCreateNew}>
              <div className="flex items-center">
                <Plus className="h-4 w-4 mr-2" />
                Create New Tenant
              </div>
            </SelectItem>
          )}
        </SelectContent>
      </Select>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Switch Organization</h3>
        {onCreateNew && (
          <Button variant="outline" size="sm" onClick={onCreateNew}>
            <Plus className="h-4 w-4 mr-2" />
            New
          </Button>
        )}
      </div>

      {loadingTenants ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-gray-100 rounded animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {userTenants.map((t) => (
            <div
              key={t.tenantId}
              className={`p-4 border rounded-lg cursor-pointer transition-all hover:bg-gray-50 ${
                t.tenantId === tenant?.tenantId 
                  ? 'border-orange-500 bg-orange-50 ring-1 ring-orange-500' 
                  : 'border-gray-200'
              }`}
              onClick={() => handleTenantSwitch(t.tenantId)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    <Building2 className="h-8 w-8 text-gray-600" />
                  </div>
                  <div>
                    <h4 className="font-medium">{t.name}</h4>
                    <p className="text-sm text-gray-500">{t.subdomain}.zectorcrm.com</p>
                  </div>
                </div>
                
                <div className="flex flex-col items-end space-y-1">
                  <div className="flex space-x-1">
                    <Badge variant="secondary" className={`text-xs ${getPlanColor(t.plan)}`}>
                      {t.plan}
                    </Badge>
                    <Badge variant="outline" className={`text-xs ${getRoleColor(t.role)}`}>
                      {t.role}
                    </Badge>
                  </div>
                  {!t.isActive && (
                    <Badge variant="destructive" className="text-xs">
                      Suspended
                    </Badge>
                  )}
                </div>
              </div>
              
              {t.tenantId === tenant?.tenantId && (
                <div className="mt-2 text-sm text-orange-600 font-medium">
                  Currently Active
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {userTenants.length === 0 && !loadingTenants && (
        <div className="text-center py-8 text-gray-500">
          <Building2 className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <p>No organizations found</p>
          {onCreateNew && (
            <Button variant="outline" className="mt-4" onClick={onCreateNew}>
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Organization
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
