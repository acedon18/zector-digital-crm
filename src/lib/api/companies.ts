import { Company } from '@/types/leads';
import { apiRequest, createApiUrl } from './base';

export interface CompanyFilters {
  status?: string;
  industry?: string;
  minScore?: number;
  enriched?: boolean;
}

export interface CompanyApiResponse {
  success: boolean;
  companies: Company[];
  total: number;
  timestamp: string;
  source?: string;
  note?: string;
}

export const companiesApi = {
  // Get all companies with filtering
  getCompanies: async (filters?: CompanyFilters): Promise<Company[]> => {
    try {
      const params = new URLSearchParams();
      if (filters?.minScore) {
        params.append('minConfidence', (filters.minScore / 100).toString());
      }
      if (filters?.industry) params.append('industry', filters.industry);
      if (filters?.status) params.append('status', filters.status);

      const url = createApiUrl('/api/companies', params);
      const response = await fetch(url);
      
      console.log('Companies API Response status:', response.status);
      console.log('Companies API Response headers:', response.headers.get('content-type'));
      
      if (!response.ok) {
        console.warn(`Companies API failed with status ${response.status}: ${response.statusText}`);
        return [];
      }
      
      const text = await response.text();
      console.log('Companies API Response text (first 200 chars):', text.substring(0, 200));
      
      try {
        const data: CompanyApiResponse = JSON.parse(text);
        
        if (data.success && Array.isArray(data.companies)) {
          return data.companies.filter((company: Company) => {
            if (filters?.status && company.status !== filters.status) return false;
            if (filters?.industry && company.industry !== filters.industry) return false;
            if (filters?.minScore && company.score && company.score < filters.minScore) return false;
            return true;
          });
        }
        
        return [];
      } catch (parseError) {
        console.error('Failed to parse Companies API JSON response:', parseError, text);
        console.warn('Falling back to empty array due to API parsing error');
        return [];
      }
    } catch (error) {
      console.error('Failed to fetch companies:', error);
      console.warn('Falling back to empty array due to API fetch error');
      return [];
    }
  },

  // Get a specific company by ID
  getCompany: async (id: string): Promise<Company | null> => {
    try {
      const response = await apiRequest<Company>(`/api/companies/${id}`);
      return response;
    } catch (error) {
      console.error(`Failed to fetch company ${id}:`, error);
      return null;
    }
  },

  // Get company statistics
  getCompanyStats: async (): Promise<{
    total: number;
    byStatus: Record<string, number>;
    byIndustry: Record<string, number>;
    averageScore: number;
  }> => {
    try {
      const companies = await companiesApi.getCompanies();
      
      const stats = {
        total: companies.length,
        byStatus: {} as Record<string, number>,
        byIndustry: {} as Record<string, number>,
        averageScore: 0
      };

      companies.forEach(company => {
        // Count by status
        stats.byStatus[company.status] = (stats.byStatus[company.status] || 0) + 1;
        
        // Count by industry
        stats.byIndustry[company.industry] = (stats.byIndustry[company.industry] || 0) + 1;
      });

      // Calculate average score
      const scoresSum = companies.reduce((sum, company) => sum + (company.score || 0), 0);
      stats.averageScore = companies.length > 0 ? scoresSum / companies.length : 0;

      return stats;
    } catch (error) {
      console.error('Failed to get company stats:', error);
      return {
        total: 0,
        byStatus: {},
        byIndustry: {},
        averageScore: 0
      };
    }
  }
};
