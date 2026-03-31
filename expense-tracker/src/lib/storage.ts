import { Expense } from '@/types/expense';

const STORAGE_KEY = 'expense-tracker-data';

export const storage = {
  getExpenses: (): Expense[] => {
    if (typeof window === 'undefined') return [];
    
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error loading expenses:', error);
      return [];
    }
  },

  saveExpenses: (expenses: Expense[]): void => {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(expenses));
    } catch (error) {
      console.error('Error saving expenses:', error);
    }
  },

  addExpense: (expense: Expense): void => {
    const expenses = storage.getExpenses();
    expenses.push(expense);
    storage.saveExpenses(expenses);
  },

  updateExpense: (id: string, updatedExpense: Partial<Expense>): void => {
    const expenses = storage.getExpenses();
    const index = expenses.findIndex(expense => expense.id === id);
    if (index !== -1) {
      expenses[index] = { ...expenses[index], ...updatedExpense };
      storage.saveExpenses(expenses);
    }
  },

  deleteExpense: (id: string): void => {
    const expenses = storage.getExpenses();
    const filteredExpenses = expenses.filter(expense => expense.id !== id);
    storage.saveExpenses(filteredExpenses);
  },

  exportToCsv: (expenses: Expense[]): string => {
    const headers = ['Date', 'Category', 'Description', 'Amount'];
    const csvContent = [
      headers.join(','),
      ...expenses.map(expense => [
        expense.date,
        expense.category,
        `"${expense.description}"`,
        expense.amount.toString()
      ].join(','))
    ].join('\n');

    return csvContent;
  }
};