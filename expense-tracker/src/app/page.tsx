'use client';

import { useState } from 'react';
import Link from 'next/link';
import { SummaryCard } from '@/components/dashboard/SummaryCard';
import { ExpenseChart } from '@/components/dashboard/ExpenseChart';
import { RecentExpenses } from '@/components/dashboard/RecentExpenses';
import { SpendingInsights } from '@/components/dashboard/SpendingInsights';
import { Button } from '@/components/ui/Button';
import { FloatingActionButton } from '@/components/ui/FloatingActionButton';
import { ExportModal } from '@/components/export/ExportModal';
import { useExpenses } from '@/hooks/useExpenses';
import { useExpenseAnalytics } from '@/hooks/useExpenseAnalytics';
import { DollarSign, TrendingUp, Calendar, Target, Plus, Sparkles, Zap, Database } from 'lucide-react';
import { getCategoryIcon } from '@/lib/categoryIcons';
import { ExpenseCategory } from '@/types/expense';

export default function Home() {
  const { expenses, loading } = useExpenses();
  const analytics = useExpenseAnalytics(expenses);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="relative">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary/30 border-t-primary"></div>
          <div className="absolute inset-0 animate-ping rounded-full h-12 w-12 border-2 border-primary/20"></div>
        </div>
      </div>
    );
  }

  if (expenses.length === 0) {
    return (
      <>
        <div className="text-center py-16 animate-fade-in">
          <div className="max-w-lg mx-auto">
            <div className="relative mb-8">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full blur-2xl opacity-20 animate-pulse"></div>
              <div className="relative bg-gradient-to-r from-blue-600 to-purple-600 rounded-full w-24 h-24 flex items-center justify-center mx-auto shadow-2xl">
                <DollarSign className="h-12 w-12 text-white" />
                <Sparkles className="absolute -top-2 -right-2 h-6 w-6 text-yellow-400 animate-bounce-gentle" />
              </div>
            </div>
            
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
              Welcome to ExpenseTracker
            </h1>
            <p className="text-gray-600 dark:text-gray-300 text-lg mb-8 leading-relaxed">
              Start your financial journey by tracking your first expense. 
              Analyze spending patterns, set budgets, and take control of your finances.
            </p>
            
            <Link href="/add-expense">
              <Button variant="gradient" size="lg" className="shadow-2xl">
                <Zap className="h-5 w-5 mr-2" />
                Add Your First Expense
              </Button>
            </Link>
          </div>
        </div>
        
        <Link href="/add-expense">
          <FloatingActionButton>
            <Plus className="h-6 w-6" />
          </FloatingActionButton>
        </Link>
      </>
    );
  }

  const topCategoryConfig = analytics.topCategory !== 'None' ? getCategoryIcon(analytics.topCategory as ExpenseCategory) : null;

  return (
    <>
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 animate-fade-in">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
              Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mt-2 text-lg">
              Overview of your spending and financial activity
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              variant="outline"
              className="shadow-lg border-blue-200 text-blue-700 hover:bg-blue-50 dark:border-blue-700 dark:text-blue-300 dark:hover:bg-blue-900/20 relative group"
              onClick={() => setIsExportModalOpen(true)}
              disabled={expenses.length === 0}
            >
              <Database className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Advanced Export</span>
              <span className="sm:hidden">Export</span>
              <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg opacity-0 group-hover:opacity-30 transition-opacity -z-10" />
            </Button>
            <Link href="/add-expense">
              <Button variant="gradient" className="shadow-lg">
                <Plus className="h-4 w-4 mr-2" />
                Add Expense
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <SummaryCard
            title="Total Expenses"
            value={analytics.totalExpenses}
            icon={DollarSign}
            gradient="from-blue-600 to-cyan-600"
            className="animate-slide-in-left"
            style={{ animationDelay: '0ms' } as React.CSSProperties}
          />
          
          <SummaryCard
            title="This Month"
            value={analytics.thisMonthTotal}
            icon={Calendar}
            gradient="from-purple-600 to-pink-600"
            trend={{
              value: Math.round(analytics.monthlyChange),
              isPositive: analytics.monthlyChange > 0,
            }}
            className="animate-slide-in-left"
            style={{ animationDelay: '100ms' } as React.CSSProperties}
          />
          
          <SummaryCard
            title="Average Expense"
            value={analytics.averageExpense}
            icon={TrendingUp}
            gradient="from-green-600 to-emerald-600"
            className="animate-slide-in-left"
            style={{ animationDelay: '200ms' } as React.CSSProperties}
          />
          
          <SummaryCard
            title="Top Category"
            value={analytics.topCategory}
            icon={topCategoryConfig?.icon || Target}
            gradient={topCategoryConfig?.gradient || "from-orange-600 to-red-600"}
            className="animate-slide-in-left"
            style={{ animationDelay: '300ms' } as React.CSSProperties}
          />
        </div>

        <div className="animate-fade-in" style={{ animationDelay: '400ms' } as React.CSSProperties}>
          <ExpenseChart expenses={expenses} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 animate-fade-in" style={{ animationDelay: '500ms' } as React.CSSProperties}>
            <RecentExpenses expenses={expenses} />
          </div>
          <div className="animate-fade-in" style={{ animationDelay: '600ms' } as React.CSSProperties}>
            <SpendingInsights expenses={expenses} />
          </div>
        </div>
      </div>
      
      <Link href="/add-expense">
        <FloatingActionButton>
          <Plus className="h-6 w-6" />
        </FloatingActionButton>
      </Link>

      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        expenses={expenses}
      />
    </>
  );
}
