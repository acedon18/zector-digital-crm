// Types for Apollo Search API

export interface ApolloSearchParams {
  q?: string;
  title?: string;
  company?: string;
  location?: string;
  page?: number;
  per_page?: number;
  [key: string]: unknown;
}

export interface ApolloPerson {
  id: string;
  first_name: string;
  last_name: string;
  title?: string;
  email?: string;
  company?: string;
  linkedin_url?: string;
  [key: string]: unknown;
}

export interface ApolloSearchResponse {
  people: ApolloPerson[];
  total: number;
  page: number;
  per_page: number;
  [key: string]: unknown;
}
