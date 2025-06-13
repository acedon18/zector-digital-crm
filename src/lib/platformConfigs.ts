import { PlatformConfig, PlatformType } from '@/types/integrations';

export const PLATFORM_CONFIGS: Record<PlatformType, PlatformConfig> = {
  google_analytics: {
    id: 'google_analytics',
    name: 'Google Analytics 4',
    description: 'Track website visitors, behavior, and conversions',
    icon: '📊',
    category: 'analytics',
    features: ['Visitor Tracking', 'Conversion Tracking', 'Audience Insights', 'Real-time Data'],
    requiredFields: [
      {
        key: 'property_id',
        label: 'GA4 Property ID',
        type: 'text',
        placeholder: 'G-XXXXXXXXXX',
        required: true,
        helpText: 'Find this in your GA4 property settings'
      },
      {
        key: 'measurement_id',
        label: 'Measurement ID',
        type: 'text',
        placeholder: 'G-XXXXXXXXXX',
        required: true,
        helpText: 'Used for tracking script integration'
      },
      {
        key: 'service_account_key',
        label: 'Service Account Key (JSON)',
        type: 'file',
        required: true,
        helpText: 'Upload the JSON key file from Google Cloud Console'
      }
    ]
  },
  google_ads: {
    id: 'google_ads',
    name: 'Google Ads',
    description: 'Import campaign performance and lead data',
    icon: '🎯',
    category: 'advertising',
    features: ['Campaign Performance', 'Keyword Data', 'Lead Tracking', 'Cost Analysis'],
    requiredFields: [
      {
        key: 'customer_id',
        label: 'Customer ID',
        type: 'text',
        placeholder: '123-456-7890',
        required: true,
        helpText: 'Your Google Ads customer ID (without dashes)'
      },
      {
        key: 'developer_token',
        label: 'Developer Token',
        type: 'password',
        required: true,
        helpText: 'Get this from your Google Ads API center'
      },
      {
        key: 'client_id',
        label: 'OAuth Client ID',
        type: 'text',
        required: true
      },
      {
        key: 'client_secret',
        label: 'OAuth Client Secret',
        type: 'password',
        required: true
      },
      {
        key: 'refresh_token',
        label: 'Refresh Token',
        type: 'password',
        required: true,
        helpText: 'Generated during OAuth flow'
      }
    ]
  },
  meta_ads: {
    id: 'meta_ads',
    name: 'Meta Ads (Facebook & Instagram)',
    description: 'Track Facebook and Instagram advertising performance',
    icon: '📘',
    category: 'advertising',
    features: ['Campaign Metrics', 'Audience Insights', 'Lead Forms', 'Attribution Data'],
    requiredFields: [
      {
        key: 'access_token',
        label: 'Access Token',
        type: 'password',
        required: true,
        helpText: 'Long-lived access token from Meta Business'
      },
      {
        key: 'ad_account_id',
        label: 'Ad Account ID',
        type: 'text',
        placeholder: 'act_1234567890',
        required: true,
        helpText: 'Your Meta ad account ID (including act_ prefix)'
      },
      {
        key: 'app_id',
        label: 'App ID',
        type: 'text',
        required: true,
        helpText: 'Your Meta App ID'
      },
      {
        key: 'app_secret',
        label: 'App Secret',
        type: 'password',
        required: true
      }
    ]
  },
  tiktok_ads: {
    id: 'tiktok_ads',
    name: 'TikTok Ads',
    description: 'Connect TikTok advertising campaigns',
    icon: '🎵',
    category: 'advertising',
    features: ['Campaign Performance', 'Video Metrics', 'Audience Data', 'Conversion Tracking'],
    requiredFields: [
      {
        key: 'access_token',
        label: 'Access Token',
        type: 'password',
        required: true,
        helpText: 'Get from TikTok Marketing API'
      },
      {
        key: 'advertiser_id',
        label: 'Advertiser ID',
        type: 'text',
        required: true,
        helpText: 'Your TikTok advertiser account ID'
      },
      {
        key: 'app_id',
        label: 'App ID',
        type: 'text',
        required: true
      },
      {
        key: 'secret',
        label: 'App Secret',
        type: 'password',
        required: true
      }
    ]
  },
  google_tag_manager: {
    id: 'google_tag_manager',
    name: 'Google Tag Manager',
    description: 'Manage tracking tags and triggers',
    icon: '🏷️',
    category: 'tracking',
    features: ['Tag Management', 'Event Tracking', 'Conversion Setup', 'Custom Variables'],
    requiredFields: [
      {
        key: 'container_id',
        label: 'Container ID',
        type: 'text',
        placeholder: 'GTM-XXXXXXX',
        required: true,
        helpText: 'Your GTM container ID'
      },
      {
        key: 'account_id',
        label: 'Account ID',
        type: 'text',
        required: true,
        helpText: 'Your GTM account ID'
      }
    ]
  },
  hubspot: {
    id: 'hubspot',
    name: 'HubSpot',
    description: 'Sync leads and contacts with HubSpot CRM',
    icon: '🧡',
    category: 'crm',
    features: ['Contact Sync', 'Deal Tracking', 'Lead Scoring', 'Email Automation'],
    requiredFields: [
      {
        key: 'api_key',
        label: 'API Key',
        type: 'password',
        required: true,
        helpText: 'Get from HubSpot account settings'
      },
      {
        key: 'portal_id',
        label: 'Portal ID',
        type: 'text',
        required: true,
        helpText: 'Your HubSpot portal/hub ID'
      }
    ]
  },
  pipedrive: {
    id: 'pipedrive',
    name: 'Pipedrive',
    description: 'Connect with Pipedrive CRM for lead management',
    icon: '🟢',
    category: 'crm',
    features: ['Deal Pipeline', 'Contact Management', 'Activity Tracking', 'Revenue Reporting'],
    requiredFields: [
      {
        key: 'api_token',
        label: 'API Token',
        type: 'password',
        required: true,
        helpText: 'Get from Pipedrive settings > API'
      },
      {
        key: 'company_domain',
        label: 'Company Domain',
        type: 'text',
        placeholder: 'yourcompany.pipedrive.com',
        required: true,
        helpText: 'Your Pipedrive domain'
      }
    ]
  },
  salesforce: {
    id: 'salesforce',
    name: 'Salesforce',
    description: 'Integrate with Salesforce CRM',
    icon: '☁️',
    category: 'crm',
    features: ['Lead Management', 'Opportunity Tracking', 'Account Data', 'Custom Objects'],
    requiredFields: [
      {
        key: 'username',
        label: 'Username',
        type: 'text',
        required: true
      },
      {
        key: 'password',
        label: 'Password',
        type: 'password',
        required: true
      },
      {
        key: 'security_token',
        label: 'Security Token',
        type: 'password',
        required: true,
        helpText: 'Reset your security token in Salesforce settings'
      },
      {
        key: 'instance_url',
        label: 'Instance URL',
        type: 'url',
        placeholder: 'https://yourinstance.salesforce.com',
        required: true
      }
    ]
  }
};

export const PLATFORM_CATEGORIES = {
  analytics: {
    name: 'Analytics',
    description: 'Website tracking and visitor analytics',
    icon: '📊'
  },
  advertising: {
    name: 'Advertising',
    description: 'Paid advertising platforms and campaign data',
    icon: '🎯'
  },
  crm: {
    name: 'CRM',
    description: 'Customer relationship management systems',
    icon: '👥'
  },
  tracking: {
    name: 'Tracking',
    description: 'Tag management and event tracking',
    icon: '🏷️'
  }
} as const;
