'use client';

import { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { IntegrationGrid } from './IntegrationGrid';
import { TemplateGallery } from './TemplateGallery';
import { ExportHistory } from './ExportHistory';
import { ShareCenter } from './ShareCenter';
import { ScheduleManager } from './ScheduleManager';
import { Expense } from '@/types/expense';
import { 
  Cloud, 
  Zap, 
  Template, 
  History, 
  Share2, 
  Clock,
  TrendingUp,
  Sparkles,
  Rocket,
  Globe
} from 'lucide-react';

interface CloudExportHubProps {
  isOpen: boolean;
  onClose: () => void;
  expenses: Expense[];
}

type HubTab = 'overview' | 'integrations' | 'templates' | 'history' | 'share' | 'schedule';

export function CloudExportHub({ isOpen, onClose, expenses }: CloudExportHubProps) {
  const [activeTab, setActiveTab] = useState<HubTab>('overview');

  const tabs = [
    { id: 'overview' as HubTab, name: 'Overview', icon: Cloud, count: null },
    { id: 'integrations' as HubTab, name: 'Integrations', icon: Zap, count: 7 },
    { id: 'templates' as HubTab, name: 'Templates', icon: Template, count: 12 },
    { id: 'history' as HubTab, name: 'History', icon: History, count: 23 },
    { id: 'share' as HubTab, name: 'Share', icon: Share2, count: 3 },
    { id: 'schedule' as HubTab, name: 'Schedule', icon: Clock, count: 2 },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return <OverviewDashboard expenses={expenses} onTabChange={setActiveTab} />;
      case 'integrations':
        return <IntegrationGrid expenses={expenses} />;
      case 'templates':
        return <TemplateGallery expenses={expenses} />;
      case 'history':
        return <ExportHistory />;
      case 'share':
        return <ShareCenter />;
      case 'schedule':
        return <ScheduleManager />;
      default:
        return null;
    }
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="" size="xl">
      <div className="min-h-[80vh] -mt-6 -mx-6 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-purple-900/20">
        {/* Header */}
        <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 px-8 py-6">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/90 via-purple-600/90 to-pink-600/90 backdrop-blur-sm" />
          <div className="relative">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                <Rocket className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">Cloud Export Hub</h1>
                <p className="text-blue-100">Connect, share, and automate your expense data</p>
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-4 mt-6">
              <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4">
                <div className="flex items-center gap-2 text-white">
                  <TrendingUp className="h-5 w-5" />
                  <span className="font-semibold">Active Exports</span>
                </div>
                <div className="text-2xl font-bold text-white mt-1">12</div>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4">
                <div className="flex items-center gap-2 text-white">
                  <Globe className="h-5 w-5" />
                  <span className="font-semibold">Integrations</span>
                </div>
                <div className="text-2xl font-bold text-white mt-1">5</div>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4">
                <div className="flex items-center gap-2 text-white">
                  <Sparkles className="h-5 w-5" />
                  <span className="font-semibold">Shared Reports</span>
                </div>
                <div className="text-2xl font-bold text-white mt-1">8</div>
              </div>
            </div>
          </div>
          
          {/* Animated background elements */}
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-xl animate-pulse" />
          <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-purple-300/20 rounded-full blur-2xl animate-pulse" />
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700">
          <div className="px-8 py-4">
            <div className="flex space-x-1 overflow-x-auto">
              {tabs.map(({ id, name, icon: Icon, count }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className={`flex items-center gap-2 px-4 py-3 rounded-lg font-medium text-sm transition-all whitespace-nowrap ${
                    activeTab === id
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {name}
                  {count !== null && (
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      activeTab === id 
                        ? 'bg-white/20 text-white' 
                        : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300'
                    }`}>
                      {count}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Tab Content */}
        <div className="p-8">
          {renderTabContent()}
        </div>
      </div>
    </Modal>
  );
}

// Overview Dashboard Component
function OverviewDashboard({ expenses, onTabChange }: { expenses: Expense[], onTabChange: (tab: HubTab) => void }) {
  return (
    <div className="space-y-8">
      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div 
          onClick={() => onTabChange('integrations')}
          className="group cursor-pointer bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm hover:shadow-lg transition-all border border-gray-200 dark:border-gray-700 hover:border-blue-300"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-lg">
              <Zap className="h-6 w-6 text-white" />
            </div>
            <div className="text-2xl font-bold text-blue-600">5</div>
          </div>
          <h3 className="font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600">
            Connected Services
          </h3>
          <p className="text-gray-600 dark:text-gray-300 text-sm">
            Google Sheets, Dropbox, QuickBooks & more
          </p>
        </div>

        <div 
          onClick={() => onTabChange('templates')}
          className="group cursor-pointer bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm hover:shadow-lg transition-all border border-gray-200 dark:border-gray-700 hover:border-purple-300"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg">
              <Template className="h-6 w-6 text-white" />
            </div>
            <div className="text-2xl font-bold text-purple-600">12</div>
          </div>
          <h3 className="font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-purple-600">
            Export Templates
          </h3>
          <p className="text-gray-600 dark:text-gray-300 text-sm">
            Tax reports, analytics, custom formats
          </p>
        </div>

        <div 
          onClick={() => onTabChange('schedule')}
          className="group cursor-pointer bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm hover:shadow-lg transition-all border border-gray-200 dark:border-gray-700 hover:border-green-300"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 bg-gradient-to-r from-green-600 to-emerald-600 rounded-lg">
              <Clock className="h-6 w-6 text-white" />
            </div>
            <div className="text-2xl font-bold text-green-600">2</div>
          </div>
          <h3 className="font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-green-600">
            Scheduled Exports
          </h3>
          <p className="text-gray-600 dark:text-gray-300 text-sm">
            Automated weekly & monthly reports
          </p>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <History className="h-5 w-5" />
          Recent Activity
        </h3>
        <div className="space-y-3">
          {[
            { action: 'Export completed', target: 'Monthly Tax Report', time: '2 hours ago', status: 'success' },
            { action: 'Shared with team', target: 'Q4 Business Expenses', time: '1 day ago', status: 'info' },
            { action: 'Sync to Google Sheets', target: 'All Expenses', time: '2 days ago', status: 'success' },
            { action: 'Scheduled export', target: 'Weekly Summary', time: '3 days ago', status: 'pending' },
          ].map((activity, index) => (
            <div key={index} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              <div className={`w-2 h-2 rounded-full ${
                activity.status === 'success' ? 'bg-green-500' : 
                activity.status === 'info' ? 'bg-blue-500' : 'bg-yellow-500'
              }`} />
              <div className="flex-1">
                <div className="font-medium text-gray-900 dark:text-white">
                  {activity.action}: <span className="text-blue-600">{activity.target}</span>
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">{activity.time}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Call to Action */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold mb-2">Ready to go cloud-first?</h3>
            <p className="text-blue-100">Connect your first integration and start automating your expense reporting.</p>
          </div>
          <Button 
            variant="outline" 
            className="bg-white/20 text-white border-white/30 hover:bg-white/30"
            onClick={() => onTabChange('integrations')}
          >
            Get Started
          </Button>
        </div>
      </div>
    </div>
  );
}