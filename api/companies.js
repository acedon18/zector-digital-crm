// Companies API endpoint - Returns sample company data to demonstrate working interface
// This endpoint will return sample companies until MongoDB issues are resolved

// Sample companies to demonstrate working interface
const sampleCompanies = [
  {
    id: 'comp-001',
    name: 'TechStart AB',
    domain: 'techstart.se',
    industry: 'Technology',
    size: '11-50',
    location: { city: 'Stockholm', country: 'Sweden' },
    lastVisit: new Date('2024-12-21T10:30:00Z'),
    totalVisits: 12,
    score: 85,
    status: 'hot',
    tags: ['High Engagement', 'Returning Visitor'],
    phone: '+46 8 555 1234',
    email: 'contact@techstart.se',
    website: 'https://techstart.se'
  },
  {
    id: 'comp-002',
    name: 'Nordic Solutions',
    domain: 'nordicsolutions.com',
    industry: 'Consulting',
    size: '51-200',
    location: { city: 'Oslo', country: 'Norway' },
    lastVisit: new Date('2024-12-21T09:15:00Z'),
    totalVisits: 8,
    score: 70,
    status: 'warm',
    tags: ['Website Visitor', 'Multiple Pages'],
    phone: '+47 22 12 34 56',
    email: 'hello@nordicsolutions.com',
    website: 'https://nordicsolutions.com'
  },
  {
    id: 'comp-003',
    name: 'Danish Innovations',
    domain: 'danishinnovations.dk',
    industry: 'Manufacturing',
    size: '201-500',
    location: { city: 'Copenhagen', country: 'Denmark' },
    lastVisit: new Date('2024-12-21T08:45:00Z'),
    totalVisits: 3,
    score: 45,
    status: 'cold',
    tags: ['New Visitor'],
    phone: '+45 33 12 34 56',
    email: 'info@danishinnovations.dk',
    website: 'https://danishinnovations.dk'
  },
  {
    id: 'comp-004',
    name: 'Finnish Design Co',
    domain: 'finnishdesign.fi',
    industry: 'Design',
    size: '1-10',
    location: { city: 'Helsinki', country: 'Finland' },
    lastVisit: new Date('2024-12-21T07:20:00Z'),
    totalVisits: 15,
    score: 92,
    status: 'hot',
    tags: ['Frequent Visitor', 'High Value'],
    phone: '+358 9 123 4567',
    email: 'studio@finnishdesign.fi',
    website: 'https://finnishdesign.fi'
  },
  {
    id: 'comp-005',
    name: 'European Logistics',
    domain: 'eurolog.eu',
    industry: 'Logistics',
    size: '501-1000',
    location: { city: 'Amsterdam', country: 'Netherlands' },
    lastVisit: new Date('2024-12-21T06:10:00Z'),
    totalVisits: 6,
    score: 60,
    status: 'warm',
    tags: ['B2B Prospect'],
    phone: '+31 20 123 4567',
    email: 'contact@eurolog.eu',
    website: 'https://eurolog.eu'
  },
  {
    id: 'comp-006',
    name: 'Swiss Precision Ltd',
    domain: 'swissprecision.ch',
    industry: 'Manufacturing',
    size: '101-250',
    location: { city: 'Zurich', country: 'Switzerland' },
    lastVisit: new Date('2024-12-21T05:45:00Z'),
    totalVisits: 4,
    score: 55,
    status: 'cold',
    tags: ['Website Visitor'],
    phone: '+41 44 123 4567',
    email: 'info@swissprecision.ch',
    website: 'https://swissprecision.ch'
  },
  {
    id: 'comp-007',
    name: 'Berlin Software GmbH',
    domain: 'berlinsoftware.de',
    industry: 'Software',
    size: '11-50',
    location: { city: 'Berlin', country: 'Germany' },
    lastVisit: new Date('2024-12-21T04:30:00Z'),
    totalVisits: 9,
    score: 75,
    status: 'warm',
    tags: ['Tech Company', 'Repeat Visitor'],
    phone: '+49 30 123 4567',
    email: 'kontakt@berlinsoftware.de',
    website: 'https://berlinsoftware.de'
  }
];

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  // Apply filters if provided
  const { status, industry, minScore } = req.query;
  
  let filteredCompanies = sampleCompanies;
  
  if (status) {
    filteredCompanies = filteredCompanies.filter(company => company.status === status);
  }
  
  if (industry) {
    filteredCompanies = filteredCompanies.filter(company => 
      company.industry.toLowerCase().includes(industry.toLowerCase())
    );
  }
  
  if (minScore) {
    const minScoreNum = parseFloat(minScore);
    filteredCompanies = filteredCompanies.filter(company => company.score >= minScoreNum);
  }
  
  // Return sample companies data with proper JSON structure
  return res.status(200).json({
    success: true,
    companies: filteredCompanies,
    total: filteredCompanies.length,
    timestamp: new Date().toISOString(),
    source: 'sample_data',
    note: 'Showing sample companies for demonstration'
  });
}
