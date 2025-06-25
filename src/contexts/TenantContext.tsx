// Tenant Context Provider for Multi-Tenant CRM
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface Tenant {
  tenantId: string;
  name: string;
  domain: string;
  subdomain: string;
  plan: 'starter' | 'professional' | 'enterprise';
  subscription: {
    status: 'active' | 'trial' | 'suspended' | 'cancelled';
    startDate: string;
    endDate: string | null;
    trialEnd: string | null;
    billingCycle: 'monthly' | 'yearly';
  };
  settings: {
    trackingDomains: string[];
    apiKeys: {
      clearbit: string;
      hunter: string;
      ipinfo: string;
    };
    branding: {
      logo: string;
      primaryColor: string;
      customDomain: string;
    };
    gdpr: {
      enabled: boolean;
      cookieNotice: boolean;
      dataRetentionDays: number;
    };
    notifications: {
      email: boolean;
      realTime: boolean;
      digest: 'daily' | 'weekly' | 'monthly';
    };
  };
  limits: {
    monthlyVisits: number;
    emailAlerts: number;
    dataExports: number;
    apiCalls: number;
    dataRetentionDays: number;
  };
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
}

interface User {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  tenantId: string;
  role: 'admin' | 'manager' | 'user' | 'viewer';
  profile: {
    avatar: string;
    timezone: string;
    language: string;
    phone: string;
    department: string;
    title: string;
  };
  permissions: {
    dashboard: boolean;
    analytics: boolean;
    leads: boolean;
    companies: boolean;
    settings: boolean;
    billing: boolean;
    userManagement: boolean;
  };
  preferences: {
    emailNotifications: boolean;
    realTimeAlerts: boolean;
    digestFrequency: 'daily' | 'weekly' | 'monthly';
  };
  authentication: {
    lastLogin: string | null;
    loginCount: number;
    isActive: boolean;
    emailVerified: boolean;
    twoFactorEnabled: boolean;
  };
  createdAt: string;
  updatedAt: string;
}

interface TenantContextType {
  // Current tenant and user
  tenant: Tenant | null;
  user: User | null;
  
  // Loading states
  isLoading: boolean;
  isAuthenticated: boolean;
  
  // Tenant operations
  switchTenant: (tenantId: string) => Promise<void>;
  updateTenant: (updates: Partial<Tenant>) => Promise<void>;
  
  // User operations
  updateUser: (updates: Partial<User>) => Promise<void>;
  login: (email: string, password: string, tenantId?: string) => Promise<void>;
  logout: () => void;
  
  // Permission checks
  hasPermission: (permission: keyof User['permissions']) => boolean;
  isAdmin: () => boolean;
  isManager: () => boolean;
  
  // Plan limits
  isWithinLimits: (resource: keyof Tenant['limits']) => boolean;
  getRemainingLimit: (resource: keyof Tenant['limits']) => number;
  
  // Error handling
  error: string | null;
  clearError: () => void;
}

const TenantContext = createContext<TenantContextType | undefined>(undefined);

interface TenantProviderProps {
  children: ReactNode;
}

export function TenantProvider({ children }: TenantProviderProps) {
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize tenant context on mount
  useEffect(() => {
    initializeTenantContext();
  }, []);

  const initializeTenantContext = async () => {
    try {
      setIsLoading(true);
      
      // Try to get tenant from subdomain or localStorage
      const tenantId = getTenantIdFromContext();
      const storedUser = getStoredUser();
      
      if (tenantId && storedUser) {
        await loadTenantAndUser(tenantId, storedUser.userId);
      } else {
        // No authentication found, redirect to login
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('Failed to initialize tenant context:', error);
      setError(error instanceof Error ? error.message : 'Failed to initialize');
    } finally {
      setIsLoading(false);
    }
  };

  const getTenantIdFromContext = (): string | null => {
    // Try subdomain first (e.g., client.zectorcrm.com)
    const subdomain = window.location.hostname.split('.')[0];
    if (subdomain && subdomain !== 'www' && subdomain !== 'localhost') {
      return subdomain;
    }
    
    // Try localStorage
    return localStorage.getItem('tenantId');
  };

  const getStoredUser = (): { userId: string } | null => {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  };

  const loadTenantAndUser = async (tenantId: string, userId: string) => {
    try {
      // Load tenant
      const tenantResponse = await fetch(`/api/tenants?tenantId=${tenantId}`, {
        headers: {
          'X-Tenant-ID': tenantId
        }
      });
      
      if (!tenantResponse.ok) {
        throw new Error('Failed to load tenant');
      }
      
      const tenantData = await tenantResponse.json();
      setTenant(tenantData);

      // Load user
      const userResponse = await fetch(`/api/users?userId=${userId}`, {
        headers: {
          'X-Tenant-ID': tenantId
        }
      });
      
      if (!userResponse.ok) {
        throw new Error('Failed to load user');
      }
      
      const userData = await userResponse.json();
      setUser(userData);
      setIsAuthenticated(true);
      
      // Store in localStorage
      localStorage.setItem('tenantId', tenantId);
      localStorage.setItem('user', JSON.stringify({ userId: userData.userId }));
      
    } catch (error) {
      throw error;
    }
  };

  const switchTenant = async (newTenantId: string) => {
    if (!user) throw new Error('No user authenticated');
    
    try {
      setIsLoading(true);
      await loadTenantAndUser(newTenantId, user.userId);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to switch tenant');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updateTenant = async (updates: Partial<Tenant>) => {
    if (!tenant) throw new Error('No tenant loaded');
    
    try {
      const response = await fetch(`/api/tenants?tenantId=${tenant.tenantId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-Tenant-ID': tenant.tenantId
        },
        body: JSON.stringify(updates)
      });
      
      if (!response.ok) {
        throw new Error('Failed to update tenant');
      }
      
      const updatedTenant = await response.json();
      setTenant(updatedTenant);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to update tenant');
      throw error;
    }
  };

  const updateUser = async (updates: Partial<User>) => {
    if (!user || !tenant) throw new Error('No user or tenant loaded');
    
    try {
      const response = await fetch(`/api/users?userId=${user.userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-Tenant-ID': tenant.tenantId
        },
        body: JSON.stringify(updates)
      });
      
      if (!response.ok) {
        throw new Error('Failed to update user');
      }
      
      const updatedUser = await response.json();
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify({ userId: updatedUser.userId }));
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to update user');
      throw error;
    }
  };

  const login = async (email: string, password: string, tenantId?: string) => {
    try {
      setIsLoading(true);
      
      const loginData: any = { email, password };
      if (tenantId) loginData.tenantId = tenantId;
      
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(loginData)
      });
      
      if (!response.ok) {
        throw new Error('Login failed');
      }
      
      const { tenant: tenantData, user: userData, token } = await response.json();
      
      setTenant(tenantData);
      setUser(userData);
      setIsAuthenticated(true);
      
      // Store authentication
      localStorage.setItem('tenantId', tenantData.tenantId);
      localStorage.setItem('user', JSON.stringify({ userId: userData.userId }));
      localStorage.setItem('authToken', token);
      
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Login failed');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setTenant(null);
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('tenantId');
    localStorage.removeItem('user');
    localStorage.removeItem('authToken');
    
    // Redirect to login
    window.location.href = '/login';
  };

  const hasPermission = (permission: keyof User['permissions']): boolean => {
    return user?.permissions[permission] || false;
  };

  const isAdmin = (): boolean => {
    return user?.role === 'admin';
  };

  const isManager = (): boolean => {
    return user?.role === 'admin' || user?.role === 'manager';
  };
  const isWithinLimits = (_resource: keyof Tenant['limits']): boolean => {
    if (!tenant) return false;
    
    // TODO: Implement actual usage tracking
    // For now, return true as we haven't implemented usage tracking yet
    return true;
  };

  const getRemainingLimit = (resource: keyof Tenant['limits']): number => {
    if (!tenant) return 0;
    
    // TODO: Implement actual usage tracking
    // For now, return the full limit
    return tenant.limits[resource];
  };

  const clearError = () => {
    setError(null);
  };

  const value: TenantContextType = {
    tenant,
    user,
    isLoading,
    isAuthenticated,
    switchTenant,
    updateTenant,
    updateUser,
    login,
    logout,
    hasPermission,
    isAdmin,
    isManager,
    isWithinLimits,
    getRemainingLimit,
    error,
    clearError
  };

  return (
    <TenantContext.Provider value={value}>
      {children}
    </TenantContext.Provider>
  );
}

export function useTenant() {
  const context = useContext(TenantContext);
  if (context === undefined) {
    throw new Error('useTenant must be used within a TenantProvider');
  }
  return context;
}

// Helper hook for API requests with tenant context
export function useApiWithTenant() {
  const { tenant, user } = useTenant();
    const apiRequest = async (url: string, options: RequestInit = {}) => {
    if (!tenant) {
      throw new Error('No tenant context available');
    }
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'X-Tenant-ID': tenant.tenantId,
      ...(options.headers as Record<string, string>)
    };
    
    const authToken = localStorage.getItem('authToken');
    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`;
    }
    
    return fetch(url, {
      ...options,
      headers
    });
  };
  
  return { apiRequest, tenant, user };
}

export default TenantProvider;
