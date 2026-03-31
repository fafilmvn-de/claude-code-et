'use client';

import { useState, useMemo } from 'react';
import { Expense, ExpenseFilters } from '@/types/expense';
import { ExpenseFiltersComponent } from './ExpenseFilters';
import { ExpenseItem } from './ExpenseItem';
import { Button } from '@/components/ui/Button';
import { Download, Plus } from 'lucide-react';
import { storage } from '@/lib/storage';
import Link from 'next/link';

interface ExpenseListProps {
  expenses: Expense[];
  onEdit: (expense: Expense) => void;
  onDelete: (id: string) => void;
}

export function ExpenseList({ expenses, onEdit, onDelete }: ExpenseListProps) {
  const [filters, setFilters] = useState<ExpenseFilters>({
    category: 'All',
    dateFrom: '',
    dateTo: '',
    search: '',
  });

  const filteredExpenses = useMemo(() => {
    return expenses.filter((expense) => {
      if (filters.category !== 'All' && expense.category !== filters.category) {
        return false;
      }

      if (filters.search && !expense.description.toLowerCase().includes(filters.search.toLowerCase())) {
        return false;
      }

      if (filters.dateFrom && expense.date < filters.dateFrom) {
        return false;
      }

      if (filters.dateTo && expense.date > filters.dateTo) {
        return false;
      }

      return true;
    });
  }, [expenses, filters]);

  const sortedExpenses = useMemo(() => {
    return filteredExpenses.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [filteredExpenses]);

  const handleExport = () => {
    if (filteredExpenses.length === 0) {
      alert('No expenses to export');
      return;
    }

    const csvContent = storage.exportToCsv(filteredExpenses);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `expenses-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (expenses.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="max-w-md mx-auto">
          <div className="bg-gray-50 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <Plus className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No expenses yet</h3>
          <p className="text-gray-600 mb-6">
            Start tracking your spending by adding your first expense.
          </p>
          <Link href="/add-expense">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Expense
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Expenses</h1>
          <p className="text-gray-600 mt-2">
            Showing {sortedExpenses.length} of {expenses.length} expenses
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            variant="secondary"
            onClick={handleExport}
            disabled={filteredExpenses.length === 0}
          >
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
          
          <Link href="/add-expense">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Expense
            </Button>
          </Link>
        </div>
      </div>

      <ExpenseFiltersComponent
        filters={filters}
        onFiltersChange={setFilters}
      />

      {sortedExpenses.length === 0 ? (
        <div className="text-center py-12">
          <div className="max-w-md mx-auto">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No expenses found</h3>
            <p className="text-gray-600">
              Try adjusting your filters or add a new expense.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid gap-4">
          {sortedExpenses.map((expense) => (
            <ExpenseItem
              key={expense.id}
              expense={expense}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}