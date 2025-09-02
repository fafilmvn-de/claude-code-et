'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { ExportJob, ExportStatus } from '@/types/cloudExport';
import { 
  Download, 
  Share2, 
  Trash2, 
  RefreshCw,
  ExternalLink,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  Loader,
  Eye,
  MoreVertical,
  Filter,
  Search
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';

export function ExportHistory() {
  const [statusFilter, setStatusFilter] = useState<ExportStatus | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Mock export history data
  const exportJobs: ExportJob[] = [
    {
      id: '1',
      templateId: 'tax_annual',
      templateName: 'Annual Tax Report',
      status: 'completed',
      createdAt: '2025-01-02T10:30:00Z',
      completedAt: '2025-01-02T10:32:00Z',
      recordCount: 245,
      fileSize: '2.1 MB',
      downloadUrl: '/exports/tax-annual-2025.pdf',
      shareUrl: 'https://expensetracker.app/share/abc123',
      integration: 'email'
    },
    {
      id: '2',
      templateId: 'monthly_summary',
      templateName: 'Monthly Business Summary',
      status: 'completed',
      createdAt: '2025-01-01T15:45:00Z',
      completedAt: '2025-01-01T15:47:00Z',
      recordCount: 87,
      fileSize: '1.3 MB',
      downloadUrl: '/exports/monthly-summary-dec-2024.pdf',
      integration: 'google_sheets',
      recurring: {
        frequency: 'monthly',
        nextRun: '2025-02-01T15:45:00Z'
      }
    },
    {
      id: '3',
      templateId: 'expense_analytics',
      templateName: 'Spending Analytics Dashboard',
      status: 'processing',
      createdAt: '2025-01-02T14:20:00Z',
      recordCount: 312,
      integration: 'dropbox'
    },
    {
      id: '4',
      templateId: 'quickbooks_sync',
      templateName: 'QuickBooks Import',
      status: 'failed',
      createdAt: '2025-01-02T09:15:00Z',
      recordCount: 156,
      integration: 'quickbooks'
    },
    {
      id: '5',
      templateId: 'personal_budget',
      templateName: 'Personal Budget Tracker',
      status: 'scheduled',
      createdAt: '2025-01-02T08:00:00Z',
      recordCount: 98,
      scheduledFor: '2025-01-03T09:00:00Z',
      recurring: {
        frequency: 'weekly',
        nextRun: '2025-01-10T09:00:00Z'
      }
    },
    {
      id: '6',
      templateId: 'team_report',
      templateName: 'Team Expense Report',
      status: 'completed',
      createdAt: '2024-12-30T11:20:00Z',
      completedAt: '2024-12-30T11:25:00Z',
      recordCount: 203,
      fileSize: '3.4 MB',
      downloadUrl: '/exports/team-report-q4-2024.pdf',
      shareUrl: 'https://expensetracker.app/share/def456'
    }
  ];

  const statusOptions = [
    { value: 'all', label: 'All Status', count: exportJobs.length },
    { value: 'completed', label: 'Completed', count: exportJobs.filter(j => j.status === 'completed').length },
    { value: 'processing', label: 'Processing', count: exportJobs.filter(j => j.status === 'processing').length },
    { value: 'scheduled', label: 'Scheduled', count: exportJobs.filter(j => j.status === 'scheduled').length },
    { value: 'failed', label: 'Failed', count: exportJobs.filter(j => j.status === 'failed').length }
  ];

  const filteredJobs = exportJobs.filter(job => {
    const matchesStatus = statusFilter === 'all' || job.status === statusFilter;
    const matchesSearch = job.templateName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const getStatusIcon = (status: ExportStatus) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'processing':
        return <Loader className="h-5 w-5 text-blue-500 animate-spin" />;
      case 'failed':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      case 'scheduled':
        return <Clock className="h-5 w-5 text-orange-500" />;
      case 'pending':
        return <Clock className="h-5 w-5 text-gray-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: ExportStatus) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
      case 'processing':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300';
      case 'failed':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300';
      case 'scheduled':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300';
      case 'pending':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
    }
  };

  const getIntegrationIcon = (integration?: string) => {
    switch (integration) {
      case 'google_sheets': return '📊';
      case 'email': return '📧';
      case 'dropbox': return '📦';
      case 'onedrive': return '☁️';
      case 'quickbooks': return '💼';
      case 'slack': return '💬';
      default: return '📁';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Export History</h2>
          <p className="text-gray-600 dark:text-gray-300 mt-1">
            Track and manage your export jobs and downloads
          </p>
        </div>
        <div className="flex gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search exports..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <Button variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Status Filter */}
      <div className="flex overflow-x-auto gap-2 pb-2">
        {statusOptions.map(({ value, label, count }) => (
          <button
            key={value}
            onClick={() => setStatusFilter(value as ExportStatus | 'all')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all whitespace-nowrap ${
              statusFilter === value
                ? 'bg-blue-600 text-white shadow-lg'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            <Filter className="h-4 w-4" />
            {label}
            <span className={`px-2 py-1 rounded-full text-xs ${
              statusFilter === value 
                ? 'bg-white/20 text-white' 
                : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300'
            }`}>
              {count}
            </span>
          </button>
        ))}
      </div>

      {/* Export Jobs List */}
      <div className="space-y-4">
        {filteredJobs.map((job) => (
          <div
            key={job.id}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4 flex-1">
                {/* Status Icon */}
                <div className="flex-shrink-0 pt-1">
                  {getStatusIcon(job.status)}
                </div>

                {/* Job Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                      {job.templateName}
                    </h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(job.status)}`}>
                      {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                    </span>
                    {job.recurring && (
                      <span className="px-2 py-1 bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300 rounded-full text-xs font-medium">
                        Recurring
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm text-gray-600 dark:text-gray-300">
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">Records</div>
                      <div>{job.recordCount.toLocaleString()}</div>
                    </div>
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">Created</div>
                      <div>{formatDistanceToNow(new Date(job.createdAt), { addSuffix: true })}</div>
                    </div>
                    {job.fileSize && (
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">Size</div>
                        <div>{job.fileSize}</div>
                      </div>
                    )}
                    {job.integration && (
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">Integration</div>
                        <div className="flex items-center gap-1">
                          <span>{getIntegrationIcon(job.integration)}</span>
                          <span className="capitalize">{job.integration.replace('_', ' ')}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {job.scheduledFor && (
                    <div className="mt-2 text-sm text-orange-600 dark:text-orange-400">
                      Scheduled for {format(new Date(job.scheduledFor), 'MMM dd, yyyy HH:mm')}
                    </div>
                  )}

                  {job.recurring && (
                    <div className="mt-2 text-sm text-purple-600 dark:text-purple-400">
                      Next run: {format(new Date(job.recurring.nextRun), 'MMM dd, yyyy HH:mm')}
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 flex-shrink-0">
                {job.status === 'completed' && job.downloadUrl && (
                  <>
                    <Button size="sm" variant="outline">
                      <Download className="h-4 w-4" />
                    </Button>
                    {job.shareUrl && (
                      <Button size="sm" variant="outline">
                        <Share2 className="h-4 w-4" />
                      </Button>
                    )}
                    <Button size="sm" variant="outline">
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </>
                )}
                
                {job.status === 'failed' && (
                  <Button size="sm" variant="outline">
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                )}
                
                {job.status === 'processing' && (
                  <Button size="sm" variant="outline">
                    <Eye className="h-4 w-4" />
                  </Button>
                )}

                <Button size="sm" variant="outline">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* No results */}
      {filteredJobs.length === 0 && (
        <div className="text-center py-12">
          <div className="text-4xl mb-4">📋</div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            No export jobs found
          </h3>
          <p className="text-gray-600 dark:text-gray-300">
            Try adjusting your search or status filter
          </p>
        </div>
      )}

      {/* Storage Usage */}
      <div className="bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-800 dark:to-blue-900/20 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900 dark:text-white">Storage Usage</h3>
          <span className="text-sm text-gray-600 dark:text-gray-300">12.4 GB / 50 GB used</span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div className="bg-blue-600 h-2 rounded-full" style={{ width: '25%' }} />
        </div>
        <div className="flex justify-between text-sm text-gray-600 dark:text-gray-300 mt-2">
          <span>{exportJobs.filter(j => j.status === 'completed').length} completed exports</span>
          <span>Auto-cleanup in 90 days</span>
        </div>
      </div>
    </div>
  );
}