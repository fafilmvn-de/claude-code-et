import { Expense } from './expense';

export type IntegrationProvider = 
  | 'google_sheets' 
  | 'email' 
  | 'dropbox' 
  | 'onedrive' 
  | 'quickbooks'
  | 'slack'
  | 'zapier'
  | 'airtable';

export type TemplateCategory = 'tax' | 'business' | 'personal' | 'analytics' | 'custom';

export type ExportStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'scheduled';

export type SharePermission = 'view' | 'download' | 'edit';

export interface CloudIntegration {
  id: IntegrationProvider;
  name: string;
  description: string;
  icon: string;
  connected: boolean;
  lastSync?: string;
  syncStatus: 'idle' | 'syncing' | 'error';
  features: string[];
  setupRequired?: boolean;
}

export interface ExportTemplate {
  id: string;
  name: string;
  description: string;
  category: TemplateCategory;
  icon: string;
  fields: string[];
  filters?: {
    categories?: string[];
    dateRange?: { days: number };
  };
  outputFormat: 'csv' | 'pdf' | 'json';
  popular?: boolean;
  customizable: boolean;
}

export interface ExportJob {
  id: string;
  templateId: string;
  templateName: string;
  status: ExportStatus;
  createdAt: string;
  completedAt?: string;
  recordCount: number;
  fileSize?: string;
  downloadUrl?: string;
  shareUrl?: string;
  integration?: IntegrationProvider;
  scheduledFor?: string;
  recurring?: {
    frequency: 'daily' | 'weekly' | 'monthly';
    nextRun: string;
  };
}

export interface ShareLink {
  id: string;
  exportJobId: string;
  url: string;
  qrCode?: string;
  permission: SharePermission;
  expiresAt?: string;
  accessCount: number;
  maxAccess?: number;
  password?: boolean;
  createdAt: string;
}

export interface ExportSchedule {
  id: string;
  templateId: string;
  integration: IntegrationProvider;
  frequency: 'daily' | 'weekly' | 'monthly';
  time: string; // HH:MM format
  nextRun: string;
  enabled: boolean;
  recipients?: string[];
  lastRun?: string;
  lastStatus?: ExportStatus;
}

export interface CloudExportSettings {
  autoBackup: boolean;
  emailNotifications: boolean;
  shareAnalytics: boolean;
  retentionDays: number;
  maxFileSize: number;
}