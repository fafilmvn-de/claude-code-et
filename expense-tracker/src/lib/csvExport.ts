import { Expense } from '@/types/expense';
import { format } from 'date-fns';

export function exportExpensesToCSV(expenses: Expense[]) {
  if (expenses.length === 0) {
    return;
  }

  const headers = ['Date', 'Category', 'Amount', 'Description'];
  
  const csvContent = [
    headers.join(','),
    ...expenses.map(expense => [
      format(new Date(expense.date), 'yyyy-MM-dd'),
      expense.category,
      expense.amount.toString(),
      `"${expense.description.replace(/"/g, '""')}"`
    ].join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `expenses-${format(new Date(), 'yyyy-MM-dd')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}