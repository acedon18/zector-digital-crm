// Multi-tenant API system with tenant context awareness
// Export everything from the new modular API structure
export * from './api/index';

// For backward compatibility, also export as named exports
export { leadsApi } from './api/index';
export { companiesApi } from './api/companies';
export { trackingApi } from './api/tracking';

// Multi-tenant API utilities
export const createTenantAwareRequest = (tenantId: string) => {
  return async (url: string, options: RequestInit = {}) => {
    const headers = {
      'Content-Type': 'application/json',
      'X-Tenant-ID': tenantId,
      ...options.headers
    };

    const authToken = localStorage.getItem('authToken');
    if (authToken) {
      (headers as any)['Authorization'] = `Bearer ${authToken}`;
    }

    return fetch(url, {
      ...options,
      headers
    });
  };
};

// Enhanced live updates with platform sync awareness and tenant filtering
export const subscribeToLiveUpdates = (callback: (company: any) => void, tenantId?: string) => {
  const fallbackCompanies = [
    {
      id: '1',
      name: 'Example Company',
      domain: 'example.com',
      industry: 'Technology',
      size: '11-50',
      location: { city: 'Stockholm', country: 'Sweden' },
      lastVisit: new Date(),
      totalVisits: 15,
      score: 85,
      status: 'hot',
      tags: ['Website Visitor', 'High Engagement'],
      phone: '+46 8 123 456',
      email: 'contact@example.com',
      website: 'https://example.com',
      tenantId: tenantId || 'default-tenant'
    }
  ];

  const interval = setInterval(async () => {
    // Simulate new visitor update
    const randomCompany = fallbackCompanies[Math.floor(Math.random() * fallbackCompanies.length)];
    
    // Update company with new visit data
    const updatedCompany = {
      ...randomCompany,
      lastVisit: new Date(), // Always use a fresh Date object
      totalVisits: (randomCompany.totalVisits || 0) + 1
    };
    callback(updatedCompany);
  }, 10000); // New update every 10 seconds

  return () => clearInterval(interval);
};
