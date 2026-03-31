'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Expense } from '@/types/expense';
import { CloudIntegration, IntegrationProvider } from '@/types/cloudExport';
import { 
  CheckCircle, 
  AlertCircle, 
  Settings, 
  ExternalLink,
  Loader,
  Plus,
  Zap,
  Mail,
  Database,
  FileText,
  Calendar,
  MessageSquare,
  Building,
  Grid
} from 'lucide-react';

interface IntegrationGridProps {
  expenses: Expense[];
}

export function IntegrationGrid({ expenses }: IntegrationGridProps) {
  const [connectingTo, setConnectingTo] = useState<IntegrationProvider | null>(null);

  // Mock integrations data
  const integrations: CloudIntegration[] = [
    {
      id: 'google_sheets',
      name: 'Google Sheets',
      description: 'Sync data directly to spreadsheets with real-time updates and custom formulas',
      icon: '📊',
      connected: true,
      lastSync: '2025-01-02T10:30:00Z',
      syncStatus: 'idle',
      features: ['Real-time sync', 'Custom formulas', 'Pivot tables', 'Charts']
    },
    {
      id: 'email',
      name: 'Email Reports',
      description: 'Automated email reports with customizable schedules and recipients',
      icon: '📧',
      connected: true,
      lastSync: '2025-01-02T09:00:00Z',
      syncStatus: 'idle',
      features: ['Scheduled reports', 'Custom templates', 'Team sharing', 'Attachments']
    },
    {
      id: 'dropbox',
      name: 'Dropbox',
      description: 'Secure cloud storage with automatic backups and file organization',
      icon: '📦',
      connected: false,
      syncStatus: 'idle',
      features: ['Auto backup', 'File versioning', 'Team folders', '2TB storage']
    },
    {
      id: 'onedrive',
      name: 'OneDrive',
      description: 'Microsoft cloud integration with Office 365 and Power BI connectivity',
      icon: '☁️',
      connected: false,
      syncStatus: 'idle',
      features: ['Office integration', 'Power BI', 'SharePoint', 'Teams sharing'],
      setupRequired: true
    },
    {
      id: 'quickbooks',
      name: 'QuickBooks',
      description: 'Direct integration with accounting software for seamless expense tracking',
      icon: '💼',
      connected: true,
      lastSync: '2025-01-01T23:45:00Z',
      syncStatus: 'syncing',
      features: ['Auto categorization', 'Tax prep', 'Invoice matching', 'Reports']
    },
    {
      id: 'slack',
      name: 'Slack',
      description: 'Team notifications and expense report sharing in your workspace',
      icon: '💬',
      connected: false,
      syncStatus: 'idle',
      features: ['Team alerts', 'Report sharing', 'Approval workflows', 'Bot commands']
    },
    {
      id: 'zapier',
      name: 'Zapier',
      description: 'Connect to 5000+ apps with custom automation workflows',
      icon: '⚡',
      connected: false,
      syncStatus: 'idle',
      features: ['5000+ apps', 'Custom triggers', 'Multi-step workflows', 'AI automation']
    },
    {
      id: 'airtable',
      name: 'Airtable',
      description: 'Flexible database with powerful views, forms, and collaboration features',
      icon: '🗃️',
      connected: false,
      syncStatus: 'idle',
      features: ['Custom views', 'Forms', 'Automation', 'API access']
    }
  ];

  const handleConnect = async (provider: IntegrationProvider) => {
    setConnectingTo(provider);
    
    // Simulate connection process
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setConnectingTo(null);
    // In real app, would update integration status
  };

  const getStatusIcon = (integration: CloudIntegration) => {
    if (connectingTo === integration.id) {
      return <Loader className="h-5 w-5 animate-spin text-blue-600" />;
    }
    
    if (!integration.connected) {
      return <Plus className="h-5 w-5 text-gray-400" />;
    }
    
    switch (integration.syncStatus) {
      case 'syncing':
        return <Loader className="h-5 w-5 animate-spin text-blue-600" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      default:
        return <CheckCircle className="h-5 w-5 text-green-500" />;
    }
  };

  const getStatusText = (integration: CloudIntegration) => {
    if (connectingTo === integration.id) return 'Connecting...';
    if (!integration.connected) return 'Not connected';
    if (integration.syncStatus === 'syncing') return 'Syncing...';
    if (integration.syncStatus === 'error') return 'Sync error';
    if (integration.lastSync) {
      const lastSync = new Date(integration.lastSync);
      const now = new Date();
      const diffHours = Math.round((now.getTime() - lastSync.getTime()) / (1000 * 60 * 60));
      return `Last synced ${diffHours}h ago`;
    }
    return 'Connected';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Cloud Integrations</h2>
          <p className="text-gray-600 dark:text-gray-300 mt-1">
            Connect your favorite tools and automate your expense workflow
          </p>
        </div>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          {integrations.filter(i => i.connected).length} of {integrations.length} connected
        </div>
      </div>

      {/* Connected Services Summary */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-6 border border-green-200 dark:border-green-800">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-green-600 rounded-lg">
            <CheckCircle className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-green-900 dark:text-green-100">
              {integrations.filter(i => i.connected).length} Active Integrations
            </h3>
            <p className="text-green-700 dark:text-green-300 text-sm">
              Your expense data is synced and backed up across multiple platforms
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {integrations.filter(i => i.connected).map(integration => (
            <div key={integration.id} className="flex items-center gap-2 bg-white dark:bg-gray-800 px-3 py-1 rounded-full text-sm">
              <span>{integration.icon}</span>
              <span className="font-medium text-gray-900 dark:text-white">{integration.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Integration Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {integrations.map((integration) => (
          <div
            key={integration.id}
            className={`relative group bg-white dark:bg-gray-800 rounded-xl p-6 border transition-all hover:shadow-lg ${
              integration.connected 
                ? 'border-green-200 dark:border-green-800 shadow-sm' 
                : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600'
            }`}
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`text-3xl p-3 rounded-xl ${
                  integration.connected 
                    ? 'bg-green-50 dark:bg-green-900/20' 
                    : 'bg-gray-50 dark:bg-gray-700'
                }`}>
                  {integration.icon}
                </div>
                <div>
                  <h3 className="font-bold text-lg text-gray-900 dark:text-white">
                    {integration.name}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    {getStatusIcon(integration)}
                    <span className={`text-sm ${
                      integration.connected ? 'text-green-600' : 'text-gray-500 dark:text-gray-400'
                    }`}>
                      {getStatusText(integration)}
                    </span>
                  </div>
                </div>
              </div>
              
              {integration.connected && (
                <Button variant="outline" size="sm">
                  <Settings className="h-4 w-4" />
                </Button>
              )}
            </div>

            {/* Description */}
            <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
              {integration.description}
            </p>

            {/* Features */}
            <div className="mb-4">
              <div className="flex flex-wrap gap-2">
                {integration.features.slice(0, 3).map((feature, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-xs font-medium"
                  >
                    {feature}
                  </span>
                ))}
                {integration.features.length > 3 && (
                  <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-xs font-medium">
                    +{integration.features.length - 3} more
                  </span>
                )}
              </div>
            </div>

            {/* Action Button */}
            <div className="flex gap-2">
              {integration.connected ? (
                <>
                  <Button variant="outline" size="sm" className="flex-1">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Open
                  </Button>
                  <Button variant="gradient" size="sm" className="flex-1">
                    <Zap className="h-4 w-4 mr-2" />
                    Sync Now
                  </Button>
                </>
              ) : (
                <Button
                  variant="gradient"
                  size="sm"
                  className="w-full"
                  onClick={() => handleConnect(integration.id)}
                  disabled={connectingTo === integration.id}
                >
                  {connectingTo === integration.id ? (
                    <>
                      <Loader className="h-4 w-4 mr-2 animate-spin" />
                      Connecting...
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4 mr-2" />
                      Connect {integration.name}
                    </>
                  )}
                </Button>
              )}
            </div>

            {/* Setup Required Badge */}
            {integration.setupRequired && !integration.connected && (
              <div className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                Setup Required
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Bottom CTA */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold mb-2">Need a custom integration?</h3>
            <p className="text-blue-100">
              Connect to any service with our API or request a new integration from our team.
            </p>
          </div>
          <Button variant="outline" className="bg-white/20 text-white border-white/30 hover:bg-white/30">
            <ExternalLink className="h-4 w-4 mr-2" />
            View API Docs
          </Button>
        </div>
      </div>
    </div>
  );
}