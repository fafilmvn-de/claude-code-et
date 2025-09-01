'use client';

import { useState, useEffect } from 'react';
import { Expense } from '@/types/expense';
import { storage } from '@/lib/storage';

export function useExpenses() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setExpenses(storage.getExpenses());
    setLoading(false);
  }, []);

  const addExpense = (expense: Expense) => {
    storage.addExpense(expense);
    setExpenses(storage.getExpenses());
  };

  const updateExpense = (id: string, updatedExpense: Partial<Expense>) => {
    storage.updateExpense(id, updatedExpense);
    setExpenses(storage.getExpenses());
  };

  const deleteExpense = (id: string) => {
    storage.deleteExpense(id);
    setExpenses(storage.getExpenses());
  };

  const refreshExpenses = () => {
    setExpenses(storage.getExpenses());
  };

  return {
    expenses,
    loading,
    addExpense,
    updateExpense,
    deleteExpense,
    refreshExpenses,
  };
}