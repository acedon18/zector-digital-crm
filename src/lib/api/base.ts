// Base API configuration and utilities
export const API_BASE = typeof window !== 'undefined' 
  ? window.location.origin 
  : 'https://zector-digital-crm-leads.vercel.app';

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export class ApiError extends Error {
  constructor(
    message: string, 
    public status: number, 
    public response?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export const createApiUrl = (endpoint: string, params?: URLSearchParams): string => {
  const url = `${API_BASE}${endpoint}`;
  return params ? `${url}?${params.toString()}` : url;
};

export const handleApiResponse = async <T>(response: Response): Promise<T> => {
  if (!response.ok) {
    const errorText = await response.text();
    throw new ApiError(
      `API call failed: ${response.status} ${response.statusText}`,
      response.status,
      errorText
    );
  }

  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    return await response.json();
  }
  
  throw new ApiError('Invalid response format', response.status);
};

export const apiRequest = async <T>(
  endpoint: string, 
  options: RequestInit = {}
): Promise<T> => {
  const defaultHeaders = {
    'Content-Type': 'application/json',
    ...options.headers
  };

  const response = await fetch(createApiUrl(endpoint), {
    ...options,
    headers: defaultHeaders
  });

  return handleApiResponse<T>(response);
};
