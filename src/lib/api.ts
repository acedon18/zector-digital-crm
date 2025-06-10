import { Company, Visit, Analytics, TrackingScript, Customer } from '@/types/leads';

// Mock data för företag
const mockCompanies: Company[] = [
  {
    id: '1',
    name: 'Volvo Group',
    domain: 'volvo.com',
    industry: 'Automotive',
    size: '10,000+',
    location: { city: 'Göteborg', country: 'Sweden' },
    lastVisit: new Date('2025-06-09T10:30:00'),
    totalVisits: 12,
    score: 95,
    status: 'hot',
    tags: ['Enterprise', 'B2B', 'Manufacturing']
  },
  {
    id: '2',
    name: 'Spotify Technology',
    domain: 'spotify.com',
    industry: 'Technology',
    size: '5,000-10,000',
    location: { city: 'Stockholm', country: 'Sweden' },
    lastVisit: new Date('2025-06-09T09:15:00'),
    totalVisits: 8,
    score: 78,
    status: 'warm',
    tags: ['Tech', 'Media', 'B2C']
  },
  {
    id: '3',
    name: 'IKEA Group',
    domain: 'ikea.com',
    industry: 'Retail',
    size: '10,000+',
    location: { city: 'Malmö', country: 'Sweden' },
    lastVisit: new Date('2025-06-09T08:45:00'),
    totalVisits: 5,
    score: 62,
    status: 'warm',
    tags: ['Retail', 'Global', 'B2C']
  },
  {
    id: '4',
    name: 'Klarna Bank',
    domain: 'klarna.com',
    industry: 'Financial Services',
    size: '1,000-5,000',
    location: { city: 'Stockholm', country: 'Sweden' },
    lastVisit: new Date('2025-06-09T07:20:00'),
    totalVisits: 15,
    score: 88,
    status: 'hot',
    tags: ['Fintech', 'B2B', 'SaaS']
  },
  {
    id: '5',
    name: 'H&M Group',
    domain: 'hm.com',
    industry: 'Fashion',
    size: '10,000+',
    location: { city: 'Stockholm', country: 'Sweden' },
    lastVisit: new Date('2025-06-08T16:30:00'),
    totalVisits: 3,
    score: 45,
    status: 'cold',
    tags: ['Fashion', 'Retail', 'B2C']
  }
];

// Mock data för analytics
const mockAnalytics: Analytics = {
  totalVisitors: 342,
  newCompanies: 28,
  returningCompanies: 67,
  hotLeads: 15,
  topPages: [
    { url: '/pricing', title: 'Pricing Plans', visits: 156, uniqueCompanies: 89 },
    { url: '/features', title: 'Features Overview', visits: 134, uniqueCompanies: 76 },
    { url: '/contact', title: 'Contact Us', visits: 98, uniqueCompanies: 54 },
    { url: '/case-studies', title: 'Case Studies', visits: 87, uniqueCompanies: 43 },
    { url: '/demo', title: 'Book a Demo', visits: 76, uniqueCompanies: 38 }
  ],
  trafficSources: [
    { source: 'Google Search', visits: 142, percentage: 41.5 },
    { source: 'Direct', visits: 89, percentage: 26.0 },
    { source: 'LinkedIn', visits: 67, percentage: 19.6 },
    { source: 'Facebook', visits: 31, percentage: 9.1 },
    { source: 'Other', visits: 13, percentage: 3.8 }
  ],
  industryBreakdown: [
    { industry: 'Technology', count: 89, percentage: 26.0 },
    { industry: 'Manufacturing', count: 67, percentage: 19.6 },
    { industry: 'Financial Services', count: 54, percentage: 15.8 },
    { industry: 'Retail', count: 43, percentage: 12.6 },
    { industry: 'Healthcare', count: 38, percentage: 11.1 },
    { industry: 'Other', count: 51, percentage: 14.9 }
  ]
};

// API funktioner
export const leadsApi = {
  // Hämta alla företag med filtrering
  getCompanies: async (filters?: {
    status?: string;
    industry?: string;
    minScore?: number;
  }): Promise<Company[]> => {
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulera API delay
    
    let filtered = [...mockCompanies];
    
    if (filters?.status) {
      filtered = filtered.filter(c => c.status === filters.status);
    }
    if (filters?.industry) {
      filtered = filtered.filter(c => c.industry === filters.industry);
    }
    if (filters?.minScore) {
      filtered = filtered.filter(c => c.score >= filters.minScore);
    }
    
    return filtered.sort((a, b) => b.lastVisit.getTime() - a.lastVisit.getTime());
  },

  // Hämta ett specifikt företag
  getCompany: async (id: string): Promise<Company | null> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockCompanies.find(c => c.id === id) || null;
  },

  // Hämta analytics data
  getAnalytics: async (timeRange?: string): Promise<Analytics> => {
    await new Promise(resolve => setTimeout(resolve, 400));
    return mockAnalytics;
  },

  // Hämta senaste besökare
  getRecentVisitors: async (limit: number = 10): Promise<Company[]> => {
    await new Promise(resolve => setTimeout(resolve, 200));
    return mockCompanies
      .sort((a, b) => b.lastVisit.getTime() - a.lastVisit.getTime())
      .slice(0, limit);
  },

  // Hämta hot leads
  getHotLeads: async (): Promise<Company[]> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockCompanies.filter(c => c.status === 'hot');
  },

  // Exportera data
  exportCompanies: async (format: 'csv' | 'excel' = 'csv'): Promise<Blob> => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const headers = ['Company Name', 'Domain', 'Industry', 'Location', 'Score', 'Status', 'Last Visit'];
    const rows = mockCompanies.map(c => [
      c.name,
      c.domain,
      c.industry,
      `${c.location.city}, ${c.location.country}`,
      c.score.toString(),
      c.status,
      c.lastVisit.toLocaleDateString('sv-SE')
    ]);
    
    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');
    
    return new Blob([csvContent], { type: 'text/csv' });
  }
};

// Simulera realtidsuppdateringar
export const subscribeToLiveUpdates = (callback: (company: Company) => void) => {
  const interval = setInterval(() => {
    // Simulera ny besökare
    const randomCompany = mockCompanies[Math.floor(Math.random() * mockCompanies.length)];
    const updatedCompany = {
      ...randomCompany,
      lastVisit: new Date(),
      totalVisits: randomCompany.totalVisits + 1
    };
    callback(updatedCompany);
  }, 10000); // Ny uppdatering var 10:e sekund

  return () => clearInterval(interval);
};
