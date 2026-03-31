'use client';

import { useState } from 'react';
import { Expense } from '@/types/expense';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Edit2, Trash2, MoreVertical, Calendar } from 'lucide-react';
import { CategoryIcon, getCategoryIcon } from '@/lib/categoryIcons';

interface ExpenseItemProps {
  expense: Expense;
  onEdit: (expense: Expense) => void;
  onDelete: (id: string) => void;
}

export function ExpenseItem({ expense, onEdit, onDelete }: ExpenseItemProps) {
  const [showActions, setShowActions] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this expense?')) {
      setIsDeleting(true);
      try {
        onDelete(expense.id);
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const categoryConfig = getCategoryIcon(expense.category);

  return (
    <Card className="p-6 animate-scale-in hover:shadow-2xl transition-all duration-300 group">
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-4 flex-1">
          <CategoryIcon category={expense.category} variant="gradient" size="lg" />
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-2">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${categoryConfig.bgColor} ${categoryConfig.color} border-2 border-current border-opacity-20`}>
                {expense.category}
              </span>
              <div className="flex items-center text-sm text-muted-foreground">
                <Calendar className="h-3 w-3 mr-1" />
                {formatDate(expense.date)}
              </div>
            </div>
            
            <h3 className="text-xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
              {expense.description}
            </h3>
            
            <p className="text-3xl font-bold bg-gradient-to-r from-primary via-purple-600 to-primary bg-clip-text text-transparent">
              {formatCurrency(expense.amount)}
            </p>
          </div>
        </div>

        <div className="relative">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowActions(!showActions)}
            className="text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-all duration-300"
          >
            <MoreVertical className="h-5 w-5" />
          </Button>

          {showActions && (
            <div className="absolute right-0 top-full mt-2 w-36 bg-card/95 backdrop-blur-sm rounded-xl shadow-xl border border-border py-2 z-20 animate-scale-in">
              <button
                onClick={() => {
                  onEdit(expense);
                  setShowActions(false);
                }}
                className="flex items-center w-full px-4 py-2 text-sm text-foreground hover:bg-accent rounded-lg mx-1 transition-colors"
              >
                <Edit2 className="h-4 w-4 mr-3" />
                Edit Expense
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex items-center w-full px-4 py-2 text-sm text-destructive hover:bg-destructive/10 rounded-lg mx-1 transition-colors disabled:opacity-50"
              >
                <Trash2 className="h-4 w-4 mr-3" />
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          )}
          
          {/* Click outside to close */}
          {showActions && (
            <div 
              className="fixed inset-0 z-10" 
              onClick={() => setShowActions(false)} 
            />
          )}
        </div>
      </div>
      
      {/* Subtle hover effect */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-primary/5 via-purple-500/5 to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
    </Card>
  );
}