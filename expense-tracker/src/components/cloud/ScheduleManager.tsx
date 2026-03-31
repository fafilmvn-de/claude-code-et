'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { ExportSchedule, ExportStatus } from '@/types/cloudExport';
import { 
  Clock, 
  Plus, 
  Play, 
  Pause, 
  Settings,
  Trash2,
  Calendar,
  Mail,
  CheckCircle,
  AlertCircle,
  Repeat,
  User,
  Building,
  FileText,
  Eye,
  Edit,
  Copy
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';

export function ScheduleManager() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [filter, setFilter] = useState<'all' | 'active' | 'paused'>('all');

  // Mock scheduled exports data
  const schedules: ExportSchedule[] = [
    {
      id: '1',
      templateId: 'monthly_summary',
      integration: 'email',
      frequency: 'monthly',
      time: '09:00',
      nextRun: '2025-02-01T09:00:00Z',
      enabled: true,
      recipients: ['manager@company.com', 'finance@company.com'],
      lastRun: '2025-01-01T09:00:00Z',
      lastStatus: 'completed'
    },
    {
      id: '2',
      templateId: 'weekly_summary',
      integration: 'google_sheets',
      frequency: 'weekly',
      time: '08:30',
      nextRun: '2025-01-06T08:30:00Z',
      enabled: true,
      lastRun: '2024-12-30T08:30:00Z',
      lastStatus: 'completed'
    },
    {
      id: '3',
      templateId: 'tax_quarterly',
      integration: 'dropbox',
      frequency: 'monthly',
      time: '10:00',
      nextRun: '2025-04-01T10:00:00Z',
      enabled: false,
      lastRun: '2025-01-01T10:00:00Z',
      lastStatus: 'failed'
    },
    {
      id: '4',
      templateId: 'team_report',
      integration: 'slack',
      frequency: 'weekly',
      time: '17:00',
      nextRun: '2025-01-03T17:00:00Z',
      enabled: true,
      recipients: ['#finance-team', '#management'],
      lastRun: '2024-12-27T17:00:00Z',
      lastStatus: 'completed'
    }
  ];

  const filteredSchedules = schedules.filter(schedule => {
    switch (filter) {
      case 'active':
        return schedule.enabled;
      case 'paused':
        return !schedule.enabled;
      default:
        return true;
    }
  });

  const getIntegrationIcon = (integration: string) => {
    switch (integration) {
      case 'email': return '📧';
      case 'google_sheets': return '📊';
      case 'dropbox': return '📦';
      case 'slack': return '💬';
      case 'onedrive': return '☁️';
      case 'quickbooks': return '💼';
      default: return '📁';
    }
  };

  const getFrequencyIcon = (frequency: string) => {
    switch (frequency) {
      case 'daily': return '📅';
      case 'weekly': return '📆';
      case 'monthly': return '🗓️';
      default: return '⏰';
    }
  };

  const getStatusIcon = (status?: ExportStatus) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getNextRunStatus = (nextRun: string) => {
    const next = new Date(nextRun);
    const now = new Date();
    const diffHours = (next.getTime() - now.getTime()) / (1000 * 60 * 60);
    
    if (diffHours < 0) return { color: 'text-red-600 dark:text-red-400', label: 'Overdue' };
    if (diffHours < 24) return { color: 'text-orange-600 dark:text-orange-400', label: 'Due soon' };
    if (diffHours < 72) return { color: 'text-yellow-600 dark:text-yellow-400', label: 'Upcoming' };
    return { color: 'text-gray-600 dark:text-gray-400', label: 'Scheduled' };
  };

  const toggleSchedule = (scheduleId: string) => {
    // In real app, would call API to toggle schedule
    console.log('Toggling schedule:', scheduleId);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Schedule Manager</h2>
          <p className="text-gray-600 dark:text-gray-300 mt-1">
            Automate your export reports with recurring schedules
          </p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Schedule
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
              <Repeat className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <div className="text-lg font-bold text-gray-900 dark:text-white">{schedules.length}</div>
              <div className="text-xs text-gray-600 dark:text-gray-300">Total Schedules</div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
              <Play className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <div className="text-lg font-bold text-gray-900 dark:text-white">
                {schedules.filter(s => s.enabled).length}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-300">Active</div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
              <Clock className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <div className="text-lg font-bold text-gray-900 dark:text-white">
                {schedules.filter(s => {
                  const next = new Date(s.nextRun);
                  const now = new Date();
                  const diffHours = (next.getTime() - now.getTime()) / (1000 * 60 * 60);
                  return diffHours < 24 && diffHours > 0;
                }).length}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-300">Due Today</div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 dark:bg-red-900/20 rounded-lg">
              <AlertCircle className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <div className="text-lg font-bold text-gray-900 dark:text-white">
                {schedules.filter(s => s.lastStatus === 'failed').length}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-300">Failed Runs</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2">
        {[
          { id: 'all', label: 'All Schedules', count: schedules.length },
          { id: 'active', label: 'Active', count: schedules.filter(s => s.enabled).length },
          { id: 'paused', label: 'Paused', count: schedules.filter(s => !s.enabled).length }
        ].map(({ id, label, count }) => (
          <button
            key={id}
            onClick={() => setFilter(id as typeof filter)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all ${
              filter === id
                ? 'bg-blue-600 text-white shadow-lg'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            {label}
            <span className={`px-2 py-1 rounded-full text-xs ${
              filter === id 
                ? 'bg-white/20 text-white' 
                : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300'
            }`}>
              {count}
            </span>
          </button>
        ))}
      </div>

      {/* Schedules List */}
      <div className="space-y-4">
        {filteredSchedules.map((schedule) => {
          const nextRunStatus = getNextRunStatus(schedule.nextRun);
          
          return (
            <div
              key={schedule.id}
              className={`bg-white dark:bg-gray-800 rounded-xl p-6 border transition-all hover:shadow-lg ${
                schedule.enabled 
                  ? 'border-gray-200 dark:border-gray-700' 
                  : 'border-gray-300 dark:border-gray-600 opacity-75'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4 flex-1">
                  {/* Template Icon & Integration */}
                  <div className="flex-shrink-0">
                    <div className="relative">
                      <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-xl flex items-center justify-center text-2xl">
                        {getFrequencyIcon(schedule.frequency)}
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center text-sm border-2 border-white dark:border-gray-800">
                        {getIntegrationIcon(schedule.integration)}
                      </div>
                    </div>
                  </div>

                  {/* Schedule Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {schedule.templateId.replace('_', ' ').split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')} Report
                      </h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        schedule.enabled 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300' 
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                      }`}>
                        {schedule.enabled ? 'Active' : 'Paused'}
                      </span>
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300 rounded-full text-xs font-medium capitalize">
                        {schedule.frequency}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm text-gray-600 dark:text-gray-300 mb-3">
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">Next Run</div>
                        <div className={nextRunStatus.color}>
                          {format(new Date(schedule.nextRun), 'MMM dd, HH:mm')}
                          <div className="text-xs">{nextRunStatus.label}</div>
                        </div>
                      </div>
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">Time</div>
                        <div>{schedule.time}</div>
                      </div>
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">Integration</div>
                        <div className="flex items-center gap-1 capitalize">
                          <span>{getIntegrationIcon(schedule.integration)}</span>
                          {schedule.integration.replace('_', ' ')}
                        </div>
                      </div>
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">Last Status</div>
                        <div className="flex items-center gap-1">
                          {getStatusIcon(schedule.lastStatus)}
                          <span className="capitalize">{schedule.lastStatus || 'Never run'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Recipients */}
                    {schedule.recipients && schedule.recipients.length > 0 && (
                      <div className="mb-3">
                        <div className="text-sm font-medium text-gray-900 dark:text-white mb-1">Recipients</div>
                        <div className="flex flex-wrap gap-2">
                          {schedule.recipients.slice(0, 3).map((recipient, index) => (
                            <span
                              key={index}
                              className="flex items-center gap-1 px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-xs"
                            >
                              {recipient.includes('@') ? <User className="h-3 w-3" /> : <Building className="h-3 w-3" />}
                              {recipient}
                            </span>
                          ))}
                          {schedule.recipients.length > 3 && (
                            <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-xs">
                              +{schedule.recipients.length - 3} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Last Run Info */}
                    {schedule.lastRun && (
                      <div className="text-sm text-gray-600 dark:text-gray-300">
                        Last run: {formatDistanceToNow(new Date(schedule.lastRun), { addSuffix: true })}
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => toggleSchedule(schedule.id)}
                    title={schedule.enabled ? 'Pause schedule' : 'Resume schedule'}
                  >
                    {schedule.enabled ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                  </Button>
                  <Button size="sm" variant="outline" title="Run now">
                    <Play className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="outline" title="View history">
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="outline" title="Edit schedule">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="outline" title="Duplicate">
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="outline" title="Delete schedule">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* No schedules state */}
      {filteredSchedules.length === 0 && (
        <div className="text-center py-12">
          <div className="text-4xl mb-4">⏰</div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            {filter === 'all' ? 'No schedules created yet' : `No ${filter} schedules`}
          </h3>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            {filter === 'all' 
              ? 'Create your first automated export schedule to save time'
              : `Switch to a different filter or create new schedules`
            }
          </p>
          <Button onClick={() => setShowCreateModal(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Schedule
          </Button>
        </div>
      )}

      {/* Upcoming Schedule Preview */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-xl p-6 border border-purple-200 dark:border-purple-800">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-purple-900 dark:text-purple-100">Upcoming Exports</h3>
          <span className="text-sm text-purple-600 dark:text-purple-400">Next 7 days</span>
        </div>
        <div className="space-y-3">
          {schedules
            .filter(s => s.enabled)
            .filter(s => {
              const next = new Date(s.nextRun);
              const now = new Date();
              const diffDays = (next.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
              return diffDays <= 7 && diffDays >= 0;
            })
            .sort((a, b) => new Date(a.nextRun).getTime() - new Date(b.nextRun).getTime())
            .slice(0, 3)
            .map(schedule => (
              <div key={schedule.id} className="flex items-center justify-between bg-white dark:bg-gray-800 rounded-lg p-3">
                <div className="flex items-center gap-3">
                  <span className="text-lg">{getFrequencyIcon(schedule.frequency)}</span>
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white text-sm">
                      {schedule.templateId.replace('_', ' ').split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-300">
                      to {schedule.integration.replace('_', ' ')}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                    {format(new Date(schedule.nextRun), 'MMM dd')}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-300">
                    {format(new Date(schedule.nextRun), 'HH:mm')}
                  </div>
                </div>
              </div>
            ))
          }
        </div>
      </div>
    </div>
  );
}