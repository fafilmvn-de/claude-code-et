import { Expense, ExpenseCategory } from '@/types/expense';
import { format } from 'date-fns';

export type ExportFormat = 'csv' | 'json' | 'pdf';

export interface ExportOptions {
  format: ExportFormat;
  filename: string;
  dateFrom?: string;
  dateTo?: string;
  categories: ExpenseCategory[];
}

export interface ExportPreview {
  totalRecords: number;
  filteredRecords: number;
  dateRange: string;
  categories: string;
  estimatedFileSize: string;
}

export function filterExpenses(expenses: Expense[], options: ExportOptions): Expense[] {
  return expenses.filter(expense => {
    const expenseDate = new Date(expense.date);
    
    if (options.dateFrom && expenseDate < new Date(options.dateFrom)) {
      return false;
    }
    
    if (options.dateTo && expenseDate > new Date(options.dateTo)) {
      return false;
    }
    
    if (options.categories.length > 0 && !options.categories.includes(expense.category)) {
      return false;
    }
    
    return true;
  });
}

export function generateExportPreview(expenses: Expense[], options: ExportOptions): ExportPreview {
  const filteredExpenses = filterExpenses(expenses, options);
  
  const dateRange = options.dateFrom && options.dateTo 
    ? `${format(new Date(options.dateFrom), 'MMM dd, yyyy')} - ${format(new Date(options.dateTo), 'MMM dd, yyyy')}`
    : 'All dates';
    
  const categoriesText = options.categories.length === 0 
    ? 'All categories' 
    : options.categories.join(', ');
    
  const estimatedSize = estimateFileSize(filteredExpenses, options.format);
  
  return {
    totalRecords: expenses.length,
    filteredRecords: filteredExpenses.length,
    dateRange,
    categories: categoriesText,
    estimatedFileSize: estimatedSize,
  };
}

function estimateFileSize(expenses: Expense[], format: ExportFormat): string {
  const recordCount = expenses.length;
  let bytesPerRecord: number;
  
  switch (format) {
    case 'csv':
      bytesPerRecord = 80; // Rough estimate
      break;
    case 'json':
      bytesPerRecord = 150; // JSON is more verbose
      break;
    case 'pdf':
      bytesPerRecord = 200; // PDF overhead
      break;
    default:
      bytesPerRecord = 100;
  }
  
  const totalBytes = recordCount * bytesPerRecord;
  
  if (totalBytes < 1024) {
    return `${totalBytes} bytes`;
  } else if (totalBytes < 1024 * 1024) {
    return `${(totalBytes / 1024).toFixed(1)} KB`;
  } else {
    return `${(totalBytes / (1024 * 1024)).toFixed(1)} MB`;
  }
}

export async function exportData(expenses: Expense[], options: ExportOptions): Promise<void> {
  const filteredExpenses = filterExpenses(expenses, options);
  
  switch (options.format) {
    case 'csv':
      await exportCSV(filteredExpenses, options.filename);
      break;
    case 'json':
      await exportJSON(filteredExpenses, options.filename);
      break;
    case 'pdf':
      await exportPDF(filteredExpenses);
      break;
  }
}

async function exportCSV(expenses: Expense[], filename: string): Promise<void> {
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

  downloadFile(csvContent, filename + '.csv', 'text/csv');
}

async function exportJSON(expenses: Expense[], filename: string): Promise<void> {
  const jsonData = {
    exportDate: new Date().toISOString(),
    totalRecords: expenses.length,
    expenses: expenses.map(expense => ({
      id: expense.id,
      date: expense.date,
      category: expense.category,
      amount: expense.amount,
      description: expense.description,
      createdAt: expense.createdAt,
    }))
  };
  
  const jsonContent = JSON.stringify(jsonData, null, 2);
  downloadFile(jsonContent, filename + '.json', 'application/json');
}

async function exportPDF(expenses: Expense[]): Promise<void> {
  // Simple HTML to PDF approach for now
  const htmlContent = generatePDFHTML(expenses);
  
  // Create a new window for printing
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    throw new Error('Popup blocked. Please allow popups for PDF export.');
  }
  
  printWindow.document.write(htmlContent);
  printWindow.document.close();
  
  setTimeout(() => {
    printWindow.print();
    printWindow.close();
  }, 1000);
}

function generatePDFHTML(expenses: Expense[]): string {
  const totalAmount = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Expense Report</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .header { border-bottom: 2px solid #333; padding-bottom: 10px; margin-bottom: 20px; }
          .summary { background: #f5f5f5; padding: 15px; margin-bottom: 20px; border-radius: 5px; }
          table { width: 100%; border-collapse: collapse; margin-top: 10px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #4f46e5; color: white; }
          tr:nth-child(even) { background-color: #f9f9f9; }
          .amount { text-align: right; font-weight: bold; }
          .footer { margin-top: 20px; text-align: center; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Expense Report</h1>
          <p>Generated on ${format(new Date(), 'MMMM dd, yyyy HH:mm')}</p>
        </div>
        
        <div class="summary">
          <h2>Summary</h2>
          <p><strong>Total Records:</strong> ${expenses.length}</p>
          <p><strong>Total Amount:</strong> $${totalAmount.toFixed(2)}</p>
          <p><strong>Date Range:</strong> ${expenses.length > 0 ? 
            format(new Date(Math.min(...expenses.map(e => new Date(e.date).getTime()))), 'MMM dd, yyyy') + 
            ' - ' + 
            format(new Date(Math.max(...expenses.map(e => new Date(e.date).getTime()))), 'MMM dd, yyyy')
            : 'No data'}</p>
        </div>
        
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Category</th>
              <th>Description</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            ${expenses.map(expense => `
              <tr>
                <td>${format(new Date(expense.date), 'MMM dd, yyyy')}</td>
                <td>${expense.category}</td>
                <td>${expense.description}</td>
                <td class="amount">$${expense.amount.toFixed(2)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        
        <div class="footer">
          <p>Generated by ExpenseTracker - Professional Export System</p>
        </div>
      </body>
    </html>
  `;
}

function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType + ';charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}