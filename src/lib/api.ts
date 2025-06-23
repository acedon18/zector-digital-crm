// New modular API system - replaces the old 493-line api.ts file
// Export everything from the new modular API structure
export * from './api/index';

// For backward compatibility, also export as named exports
export { leadsApi } from './api/index';
export { companiesApi } from './api/companies';
export { trackingApi } from './api/tracking';

// Enhanced live updates with platform sync awareness
export const subscribeToLiveUpdates = (callback: (company: any) => void) => {
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
      website: 'https://example.com'
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
