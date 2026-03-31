'use client';

import Link from 'next/link';
import { Expense } from '@/types/expense';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { formatCurrency, formatDate } from '@/lib/utils';
import { ArrowRight } from 'lucide-react';

interface RecentExpensesProps {
  expenses: Expense[];
}

export function RecentExpenses({ expenses }: RecentExpensesProps) {
  const recentExpenses = expenses
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      Food: 'bg-orange-100 text-orange-800',
      Transportation: 'bg-blue-100 text-blue-800',
      Entertainment: 'bg-purple-100 text-purple-800',
      Shopping: 'bg-pink-100 text-pink-800',
      Bills: 'bg-red-100 text-red-800',
      Other: 'bg-gray-100 text-gray-800',
    };
    return colors[category] || colors.Other;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Recent Expenses</CardTitle>
          <Link href="/expenses">
            <Button variant="ghost" size="sm">
              View all
              <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        {recentExpenses.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No recent expenses. 
            <Link href="/add-expense" className="text-blue-600 hover:text-blue-700 ml-1">
              Add your first expense
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {recentExpenses.map((expense) => (
              <div key={expense.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50">
                <div className="flex items-center space-x-3">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(
                      expense.category
                    )}`}
                  >
                    {expense.category}
                  </span>
                  <div>
                    <p className="font-medium text-gray-900">{expense.description}</p>
                    <p className="text-sm text-gray-500">{formatDate(expense.date)}</p>
                  </div>
                </div>
                <div className="text-lg font-semibold text-gray-900">
                  {formatCurrency(expense.amount)}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}