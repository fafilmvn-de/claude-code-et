'use client';

import { useState } from 'react';
import { ExpenseList } from '@/components/expenses/ExpenseList';
import { ExpenseForm } from '@/components/forms/ExpenseForm';
import { useExpenses } from '@/hooks/useExpenses';
import { Expense } from '@/types/expense';

export default function ExpensesPage() {
  const { expenses, deleteExpense } = useExpenses();
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);

  const handleEdit = (expense: Expense) => {
    setEditingExpense(expense);
  };

  const handleEditSubmit = () => {
    setEditingExpense(null);
  };

  const handleDelete = (id: string) => {
    deleteExpense(id);
  };

  if (editingExpense) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Edit Expense</h1>
          <p className="text-gray-600 mt-2">Update your expense details</p>
        </div>
        
        <ExpenseForm
          initialData={editingExpense}
          onSubmit={handleEditSubmit}
        />
      </div>
    );
  }

  return (
    <ExpenseList
      expenses={expenses}
      onEdit={handleEdit}
      onDelete={handleDelete}
    />
  );
}