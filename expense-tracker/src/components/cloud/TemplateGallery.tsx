'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Expense } from '@/types/expense';
import { ExportTemplate, TemplateCategory } from '@/types/cloudExport';
import { 
  FileText, 
  Download, 
  Star, 
  Eye,
  Settings,
  Filter,
  Search,
  Calendar,
  PieChart,
  Receipt,
  TrendingUp,
  Building,
  User,
  Zap,
  Crown
} from 'lucide-react';

interface TemplateGalleryProps {
  expenses: Expense[];
}

export function TemplateGallery({ expenses }: TemplateGalleryProps) {
  const [selectedCategory, setSelectedCategory] = useState<TemplateCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const templates: ExportTemplate[] = [
    {
      id: 'tax_annual',
      name: 'Annual Tax Report',
      description: 'Comprehensive yearly tax report with deductible categories and receipts',
      category: 'tax',
      icon: '📊',
      fields: ['date', 'category', 'amount', 'description', 'receipt_url', 'tax_deductible'],
      outputFormat: 'pdf',
      popular: true,
      customizable: true,
      filters: { dateRange: { days: 365 } }
    },
    {
      id: 'monthly_summary',
      name: 'Monthly Business Summary',
      description: 'Professional monthly report for business expense tracking',
      category: 'business',
      icon: '📈',
      fields: ['date', 'category', 'amount', 'description', 'vendor'],
      outputFormat: 'pdf',
      popular: true,
      customizable: true,
      filters: { dateRange: { days: 30 } }
    },
    {
      id: 'quickbooks_sync',
      name: 'QuickBooks Import',
      description: 'Ready-to-import CSV format for QuickBooks accounting software',
      category: 'business',
      icon: '💼',
      fields: ['date', 'account', 'amount', 'description', 'category', 'memo'],
      outputFormat: 'csv',
      customizable: false,
      popular: false
    },
    {
      id: 'personal_budget',
      name: 'Personal Budget Tracker',
      description: 'Simple personal expense tracking with category breakdowns',
      category: 'personal',
      icon: '🏠',
      fields: ['date', 'category', 'amount', 'description', 'budget_variance'],
      outputFormat: 'csv',
      customizable: true,
      popular: false
    },
    {
      id: 'expense_analytics',
      name: 'Spending Analytics Dashboard',
      description: 'Detailed analytics with charts, trends, and spending patterns',
      category: 'analytics',
      icon: '📊',
      fields: ['date', 'category', 'amount', 'description', 'trends', 'projections'],
      outputFormat: 'json',
      customizable: true,
      popular: true
    },
    {
      id: 'team_report',
      name: 'Team Expense Report',
      description: 'Professional team expense report for manager review and approval',
      category: 'business',
      icon: '👥',
      fields: ['date', 'employee', 'category', 'amount', 'description', 'status'],
      outputFormat: 'pdf',
      customizable: true,
      popular: false
    },
    {
      id: 'tax_quarterly',
      name: 'Quarterly Tax Prep',
      description: 'Quarterly business expense summary for tax preparation',
      category: 'tax',
      icon: '📋',
      fields: ['date', 'category', 'amount', 'description', 'tax_category', 'deductible'],
      outputFormat: 'pdf',
      customizable: false,
      popular: true,
      filters: { dateRange: { days: 90 } }
    },
    {
      id: 'travel_expenses',
      name: 'Travel & Entertainment',
      description: 'Specialized report for travel and entertainment expenses',
      category: 'business',
      icon: '✈️',
      fields: ['date', 'location', 'purpose', 'amount', 'category', 'attendees'],
      outputFormat: 'pdf',
      customizable: true,
      popular: false,
      filters: { categories: ['Transportation', 'Entertainment', 'Food'] }
    },
    {
      id: 'custom_template',
      name: 'Custom Template Builder',
      description: 'Build your own custom export template with drag-and-drop fields',
      category: 'custom',
      icon: '🔧',
      fields: [],
      outputFormat: 'csv',
      customizable: true,
      popular: false
    }
  ];

  const categories = [
    { id: 'all' as const, name: 'All Templates', icon: Filter },
    { id: 'tax' as TemplateCategory, name: 'Tax Reports', icon: Receipt },
    { id: 'business' as TemplateCategory, name: 'Business', icon: Building },
    { id: 'personal' as TemplateCategory, name: 'Personal', icon: User },
    { id: 'analytics' as TemplateCategory, name: 'Analytics', icon: PieChart },
    { id: 'custom' as TemplateCategory, name: 'Custom', icon: Settings }
  ];

  const filteredTemplates = templates.filter(template => {
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const getFormatIcon = (format: string) => {
    switch (format) {
      case 'pdf': return '📄';
      case 'csv': return '📊';
      case 'json': return '💾';
      default: return '📁';
    }
  };

  const getFormatColor = (format: string) => {
    switch (format) {
      case 'pdf': return 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-300';
      case 'csv': return 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-300';
      case 'json': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300';
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-900/20 dark:text-gray-300';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Export Templates</h2>
          <p className="text-gray-600 dark:text-gray-300 mt-1">
            Pre-built templates for common export scenarios
          </p>
        </div>
        <div className="flex gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search templates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex overflow-x-auto gap-2 pb-2">
        {categories.map(({ id, name, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setSelectedCategory(id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all whitespace-nowrap ${
              selectedCategory === id
                ? 'bg-blue-600 text-white shadow-lg'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            <Icon className="h-4 w-4" />
            {name}
          </button>
        ))}
      </div>

      {/* Popular Templates */}
      {selectedCategory === 'all' && (
        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-xl p-6 border border-yellow-200 dark:border-yellow-800">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-yellow-600 rounded-lg">
              <Crown className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-yellow-900 dark:text-yellow-100">Most Popular Templates</h3>
              <p className="text-yellow-700 dark:text-yellow-300 text-sm">
                Templates used by 80% of our users
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {templates.filter(t => t.popular).slice(0, 3).map(template => (
              <div key={template.id} className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-yellow-200 dark:border-yellow-700">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">{template.icon}</span>
                  <span className="font-medium text-gray-900 dark:text-white">{template.name}</span>
                </div>
                <Button size="sm" className="w-full">
                  <Download className="h-4 w-4 mr-2" />
                  Use Template
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Template Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTemplates.map((template) => (
          <div
            key={template.id}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all group hover:border-blue-300 dark:hover:border-blue-600"
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="text-3xl p-3 bg-gray-50 dark:bg-gray-700 rounded-xl group-hover:bg-blue-50 dark:group-hover:bg-blue-900/20 transition-colors">
                  {template.icon}
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {template.name}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    {template.popular && (
                      <div className="flex items-center gap-1">
                        <Star className="h-3 w-3 text-yellow-500" />
                        <span className="text-xs text-yellow-600 dark:text-yellow-400">Popular</span>
                      </div>
                    )}
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getFormatColor(template.outputFormat)}`}>
                      {getFormatIcon(template.outputFormat)} {template.outputFormat.toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Description */}
            <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
              {template.description}
            </p>

            {/* Features */}
            <div className="mb-4">
              <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
                Includes {template.fields.length} fields:
              </div>
              <div className="flex flex-wrap gap-1">
                {template.fields.slice(0, 4).map((field, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded text-xs"
                  >
                    {field.replace('_', ' ')}
                  </span>
                ))}
                {template.fields.length > 4 && (
                  <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded text-xs">
                    +{template.fields.length - 4} more
                  </span>
                )}
              </div>
            </div>

            {/* Features badges */}
            <div className="flex items-center gap-2 mb-4">
              {template.customizable && (
                <div className="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400">
                  <Settings className="h-3 w-3" />
                  Customizable
                </div>
              )}
              {template.filters && (
                <div className="flex items-center gap-1 text-xs text-purple-600 dark:text-purple-400">
                  <Filter className="h-3 w-3" />
                  Auto-filtered
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <Button size="sm" className="flex-1">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button variant="outline" size="sm">
                <Eye className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* No results */}
      {filteredTemplates.length === 0 && (
        <div className="text-center py-12">
          <div className="text-4xl mb-4">🔍</div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            No templates found
          </h3>
          <p className="text-gray-600 dark:text-gray-300">
            Try adjusting your search or category filter
          </p>
        </div>
      )}

      {/* Bottom CTA */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold mb-2">Need a custom template?</h3>
            <p className="text-purple-100">
              Create your own export template with our drag-and-drop builder or request one from our team.
            </p>
          </div>
          <Button variant="outline" className="bg-white/20 text-white border-white/30 hover:bg-white/30">
            <Zap className="h-4 w-4 mr-2" />
            Build Custom
          </Button>
        </div>
      </div>
    </div>
  );
}