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
  // No mock data - only real visitor updates
  const interval = setInterval(async () => {
    // Only notify if there are real new visitors
    // This function now serves as a placeholder for real-time visitor updates
    // In production, this would connect to WebSocket or Server-Sent Events
    console.log(`Live updates check for tenant ${tenantId || 'default'} - waiting for real visitor data`);
    
    // Note: callback would be used here when real visitor data is available
    // callback(realVisitorData);
  }, 30000); // Check every 30 seconds for real updates

  return () => clearInterval(interval);
};
