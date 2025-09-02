'use client';

import { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Expense, ExpenseCategory, EXPENSE_CATEGORIES } from '@/types/expense';
import { 
  exportData, 
  generateExportPreview, 
  filterExpenses,
  type ExportFormat, 
  type ExportOptions 
} from '@/lib/advancedExport';
import { 
  Download, 
  FileText, 
  Database, 
  FileImage, 
  Calendar, 
  Filter, 
  Eye,
  CheckCircle,
  Clock,
  AlertCircle,
  Sparkles
} from 'lucide-react';
import { format } from 'date-fns';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  expenses: Expense[];
}

export function ExportModal({ isOpen, onClose, expenses }: ExportModalProps) {
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    format: 'csv',
    filename: `expenses-${format(new Date(), 'yyyy-MM-dd')}`,
    dateFrom: '',
    dateTo: '',
    categories: [],
  });

  const [isLoading, setIsLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [exportStatus, setExportStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const preview = generateExportPreview(expenses, exportOptions);
  const previewData = showPreview ? filterExpenses(expenses, exportOptions).slice(0, 5) : [];

  const formatOptions = [
    { value: 'csv', label: 'CSV (Comma Separated)', icon: FileText, description: 'Excel compatible' },
    { value: 'json', label: 'JSON (JavaScript)', icon: Database, description: 'Developer friendly' },
    { value: 'pdf', label: 'PDF (Printable)', icon: FileImage, description: 'Print ready report' },
  ];

  const handleExport = async () => {
    if (preview.filteredRecords === 0) {
      return;
    }

    setIsLoading(true);
    setExportStatus('idle');

    try {
      await exportData(expenses, exportOptions);
      setExportStatus('success');
      
      setTimeout(() => {
        onClose();
        setExportStatus('idle');
      }, 2000);
    } catch (error) {
      console.error('Export failed:', error);
      setExportStatus('error');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleCategory = (category: ExpenseCategory) => {
    setExportOptions(prev => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter(c => c !== category)
        : [...prev.categories, category]
    }));
  };

  const selectAllCategories = () => {
    setExportOptions(prev => ({
      ...prev,
      categories: prev.categories.length === EXPENSE_CATEGORIES.length ? [] : [...EXPENSE_CATEGORIES]
    }));
  };

  useEffect(() => {
    if (!isOpen) {
      setShowPreview(false);
      setExportStatus('idle');
      setIsLoading(false);
    }
  }, [isOpen]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Advanced Data Export" size="xl">
      <div className="space-y-8">
        {/* Export Format Selection */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="h-5 w-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Export Format</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {formatOptions.map(({ value, label, icon: Icon, description }) => (
              <button
                key={value}
                type="button"
                onClick={() => setExportOptions(prev => ({ ...prev, format: value as ExportFormat }))}
                className={`p-4 rounded-lg border-2 transition-all text-left ${
                  exportOptions.format === value
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-200 dark:border-gray-600 hover:border-blue-300'
                }`}
              >
                <div className="flex items-start gap-3">
                  <Icon className={`h-5 w-5 mt-0.5 ${exportOptions.format === value ? 'text-blue-600' : 'text-gray-400'}`} />
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">{label}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">{description}</div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Filename */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-green-600" />
            <label className="text-lg font-semibold text-gray-900 dark:text-white">Filename</label>
          </div>
          <Input
            value={exportOptions.filename}
            onChange={(e) => setExportOptions(prev => ({ ...prev, filename: e.target.value }))}
            placeholder="Enter filename (without extension)"
          />
        </div>

        {/* Date Range Filter */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-purple-600" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Date Range Filter</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">From Date</label>
              <Input
                type="date"
                value={exportOptions.dateFrom}
                onChange={(e) => setExportOptions(prev => ({ ...prev, dateFrom: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">To Date</label>
              <Input
                type="date"
                value={exportOptions.dateTo}
                onChange={(e) => setExportOptions(prev => ({ ...prev, dateTo: e.target.value }))}
              />
            </div>
          </div>
        </div>

        {/* Category Filter */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-orange-600" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Category Filter</h3>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={selectAllCategories}
            >
              {exportOptions.categories.length === EXPENSE_CATEGORIES.length ? 'Clear All' : 'Select All'}
            </Button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {EXPENSE_CATEGORIES.map(category => (
              <button
                key={category}
                type="button"
                onClick={() => toggleCategory(category)}
                className={`p-3 rounded-lg border text-sm font-medium transition-all ${
                  exportOptions.categories.includes(category)
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                    : 'border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-blue-300'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
          {exportOptions.categories.length === 0 && (
            <p className="text-sm text-gray-500 dark:text-gray-400">All categories will be included</p>
          )}
        </div>

        {/* Export Summary */}
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle className="h-5 w-5 text-indigo-600" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Export Summary</h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Records</div>
              <div className="text-lg font-semibold text-gray-900 dark:text-white">{preview.totalRecords}</div>
            </div>
            <div>
              <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Will Export</div>
              <div className="text-lg font-semibold text-blue-600">{preview.filteredRecords}</div>
            </div>
            <div>
              <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Date Range</div>
              <div className="text-sm text-gray-700 dark:text-gray-300">{preview.dateRange}</div>
            </div>
            <div>
              <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Est. Size</div>
              <div className="text-sm text-gray-700 dark:text-gray-300">{preview.estimatedFileSize}</div>
            </div>
          </div>
        </div>

        {/* Preview Toggle */}
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={() => setShowPreview(!showPreview)}
            disabled={preview.filteredRecords === 0}
          >
            <Eye className="h-4 w-4 mr-2" />
            {showPreview ? 'Hide Preview' : 'Show Preview'}
          </Button>

          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button
              onClick={handleExport}
              disabled={preview.filteredRecords === 0 || isLoading || !exportOptions.filename.trim()}
              variant="gradient"
            >
              {isLoading ? (
                <>
                  <Clock className="h-4 w-4 mr-2 animate-spin" />
                  Exporting...
                </>
              ) : exportStatus === 'success' ? (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Export Complete!
                </>
              ) : exportStatus === 'error' ? (
                <>
                  <AlertCircle className="h-4 w-4 mr-2" />
                  Export Failed
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  Export Data
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Preview Table */}
        {showPreview && previewData.length > 0 && (
          <div className="border border-gray-200 dark:border-gray-600 rounded-lg overflow-hidden">
            <div className="bg-gray-50 dark:bg-gray-700 p-3 border-b border-gray-200 dark:border-gray-600">
              <h4 className="font-medium text-gray-900 dark:text-white">
                Data Preview (First 5 records)
              </h4>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-100 dark:bg-gray-700">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Date</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Category</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Amount</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
                  {previewData.map((expense, index) => (
                    <tr key={expense.id} className={index % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-700'}>
                      <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                        {format(new Date(expense.date), 'MMM dd, yyyy')}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">{expense.category}</td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">
                        ${expense.amount.toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300 max-w-xs truncate">
                        {expense.description}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {preview.filteredRecords > 5 && (
              <div className="bg-gray-50 dark:bg-gray-700 p-3 text-center text-sm text-gray-600 dark:text-gray-400">
                ... and {preview.filteredRecords - 5} more records
              </div>
            )}
          </div>
        )}

        {preview.filteredRecords === 0 && (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <AlertCircle className="h-12 w-12 mx-auto mb-3" />
            <p className="text-lg font-medium mb-1">No data to export</p>
            <p className="text-sm">Adjust your filters to include some expenses.</p>
          </div>
        )}
      </div>
    </Modal>
  );
}