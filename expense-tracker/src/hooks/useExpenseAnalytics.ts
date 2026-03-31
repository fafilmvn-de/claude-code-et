'use client';

import { useMemo } from 'react';
import { Expense } from '@/types/expense';

export function useExpenseAnalytics(expenses: Expense[]) {
  return useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    const thisMonthExpenses = expenses.filter(expense => {
      const expenseDate = new Date(expense.date);
      return expenseDate.getMonth() === currentMonth && expenseDate.getFullYear() === currentYear;
    });

    const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
    
    const lastMonthExpenses = expenses.filter(expense => {
      const expenseDate = new Date(expense.date);
      return expenseDate.getMonth() === lastMonth && expenseDate.getFullYear() === lastMonthYear;
    });

    const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
    const thisMonthTotal = thisMonthExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    const lastMonthTotal = lastMonthExpenses.reduce((sum, expense) => sum + expense.amount, 0);

    const monthlyChange = lastMonthTotal === 0 
      ? (thisMonthTotal > 0 ? 100 : 0)
      : ((thisMonthTotal - lastMonthTotal) / lastMonthTotal) * 100;

    const categoryTotals = expenses.reduce((acc, expense) => {
      acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
      return acc;
    }, {} as Record<string, number>);

    const topCategory = Object.entries(categoryTotals).reduce(
      (max, [category, amount]) => amount > max.amount ? { category, amount } : max,
      { category: '', amount: 0 }
    );

    const averageExpense = expenses.length > 0 ? totalExpenses / expenses.length : 0;

    return {
      totalExpenses,
      thisMonthTotal,
      lastMonthTotal,
      monthlyChange,
      expenseCount: expenses.length,
      thisMonthCount: thisMonthExpenses.length,
      topCategory: topCategory.category || 'None',
      topCategoryAmount: topCategory.amount,
      averageExpense,
      categoryTotals,
    };
  }, [expenses]);
}