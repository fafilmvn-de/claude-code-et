'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { CategorySelector } from '@/components/ui/CategorySelector';
import { Expense, ExpenseCategory } from '@/types/expense';
import { generateId } from '@/lib/utils';
import { useExpenses } from '@/hooks/useExpenses';

interface ExpenseFormProps {
  initialData?: Expense;
  onSubmit?: (expense: Expense) => void;
}

interface FormData {
  amount: string;
  description: string;
  category: ExpenseCategory;
  date: string;
}

interface FormErrors {
  amount?: string;
  description?: string;
  category?: string;
  date?: string;
}

export function ExpenseForm({ initialData, onSubmit }: ExpenseFormProps) {
  const router = useRouter();
  const { addExpense, updateExpense } = useExpenses();
  
  const [formData, setFormData] = useState<FormData>({
    amount: initialData?.amount.toString() || '',
    description: initialData?.description || '',
    category: initialData?.category || 'Food',
    date: initialData?.date || new Date().toISOString().split('T')[0],
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.amount.trim()) {
      newErrors.amount = 'Amount is required';
    } else {
      const amount = parseFloat(formData.amount);
      if (isNaN(amount) || amount <= 0) {
        newErrors.amount = 'Amount must be a positive number';
      }
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    } else if (formData.description.trim().length < 3) {
      newErrors.description = 'Description must be at least 3 characters';
    }

    if (!formData.date) {
      newErrors.date = 'Date is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const expense: Expense = {
        id: initialData?.id || generateId(),
        amount: parseFloat(formData.amount),
        description: formData.description.trim(),
        category: formData.category,
        date: formData.date,
        createdAt: initialData?.createdAt || new Date().toISOString(),
      };

      if (initialData) {
        updateExpense(initialData.id, expense);
      } else {
        addExpense(expense);
      }

      if (onSubmit) {
        onSubmit(expense);
      } else {
        router.push('/expenses');
      }
    } catch (error) {
      console.error('Error saving expense:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <Card className="max-w-lg mx-auto" gradient>
      <CardHeader>
        <CardTitle gradient className="text-center">
          {initialData ? 'Edit Expense' : 'Add New Expense'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            label="Amount ($)"
            type="number"
            step="0.01"
            min="0"
            value={formData.amount}
            onChange={(e) => handleInputChange('amount', e.target.value)}
            error={errors.amount}
            placeholder="0.00"
          />

          <Input
            label="Description"
            type="text"
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            error={errors.description}
            placeholder="Enter expense description"
          />

          <CategorySelector
            value={formData.category}
            onChange={(category) => handleInputChange('category', category)}
            error={errors.category}
          />

          <Input
            label="Date"
            type="date"
            value={formData.date}
            onChange={(e) => handleInputChange('date', e.target.value)}
            error={errors.date}
          />

          <div className="flex flex-col sm:flex-row gap-3 pt-6">
            <Button
              type="submit"
              variant="gradient"
              className="flex-1"
              disabled={isSubmitting}
              loading={isSubmitting}
            >
              {initialData ? 'Update Expense' : 'Add Expense'}
            </Button>
            
            <Button
              type="button"
              variant="ghost"
              onClick={() => router.back()}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}