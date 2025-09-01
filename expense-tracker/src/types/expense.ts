export interface Expense {
  id: string;
  amount: number;
  description: string;
  category: ExpenseCategory;
  date: string;
  createdAt: string;
}

export type ExpenseCategory = 
  | 'Food'
  | 'Transportation'
  | 'Entertainment'
  | 'Shopping'
  | 'Bills'
  | 'Finance'
  | 'Other';

export const EXPENSE_CATEGORIES: ExpenseCategory[] = [
  'Food',
  'Transportation',
  'Entertainment',
  'Shopping',
  'Bills',
  'Finance',
  'Other'
];

export interface ExpenseFilters {
  category: ExpenseCategory | 'All';
  dateFrom: string;
  dateTo: string;
  search: string;
}