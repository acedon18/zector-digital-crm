import { apiRequest } from './base';

export interface TrackingData {
  event: string;
  data?: Record<string, any>;
  timestamp: string;
  url: string;
  referrer?: string;
  userAgent?: string;
  customerId?: string;
  domain: string;
}

export interface TrackingResponse {
  success: boolean;
  message: string;
  event?: string;
  timestamp: string;
}

export const trackingApi = {
  // Track an event
  track: async (data: TrackingData): Promise<TrackingResponse> => {
    try {
      return await apiRequest<TrackingResponse>('/api/track', {
        method: 'POST',
        body: JSON.stringify(data)
      });
    } catch (error) {
      console.error('Failed to track event:', error);
      throw error;
    }
  },

  // Get database status
  getDatabaseStatus: async (): Promise<any> => {
    try {
      return await apiRequest('/api/database-status');
    } catch (error) {
      console.error('Failed to get database status:', error);
      throw error;
    }
  }
};
