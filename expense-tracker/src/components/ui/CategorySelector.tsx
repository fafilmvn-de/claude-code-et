'use client';

import { useState } from 'react';
import { ExpenseCategory, EXPENSE_CATEGORIES } from '@/types/expense';
import { CategoryIcon, getCategoryIcon } from '@/lib/categoryIcons';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

interface CategorySelectorProps {
  value: ExpenseCategory;
  onChange: (category: ExpenseCategory) => void;
  error?: string;
  className?: string;
}

export function CategorySelector({ value, onChange, error, className }: CategorySelectorProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={cn('w-full', className)}>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
        Category
      </label>
      
      <div className="relative">
        {/* Selected category display */}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            'w-full flex items-center space-x-3 px-4 py-3 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 rounded-xl hover:border-blue-500/50 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500',
            error && 'border-red-500',
            isOpen && 'border-blue-500 ring-2 ring-blue-500'
          )}
        >
          <CategoryIcon category={value} variant="default" size="sm" />
          <span className="flex-1 text-left text-gray-900 dark:text-white">
            {value}
          </span>
          <div className={cn(
            'transform transition-transform duration-200',
            isOpen && 'rotate-180'
          )}>
            <svg className="h-4 w-4 text-gray-500 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </button>

        {/* Dropdown menu */}
        {isOpen && (
          <>
            {/* Overlay */}
            <div 
              className="fixed inset-0 z-10" 
              onClick={() => setIsOpen(false)} 
            />
            
            {/* Options */}
            <div className="absolute top-full left-0 right-0 mt-2 bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm border border-gray-200 dark:border-slate-700 rounded-xl shadow-2xl z-20 animate-scale-in max-h-80 overflow-y-auto">
              <div className="p-2">
                {EXPENSE_CATEGORIES.map((category) => {
                  const config = getCategoryIcon(category);
                  const isSelected = category === value;
                  
                  return (
                    <button
                      key={category}
                      type="button"
                      onClick={() => {
                        onChange(category);
                        setIsOpen(false);
                      }}
                      className={cn(
                        'w-full flex items-center space-x-3 px-3 py-3 rounded-lg transition-all duration-200 hover:bg-gray-100 dark:hover:bg-slate-700 group',
                        isSelected && 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700'
                      )}
                    >
                      <CategoryIcon category={category} variant="default" size="sm" />
                      <div className="flex-1 text-left">
                        <div className="font-medium text-gray-900 dark:text-white">
                          {category}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {config.description}
                        </div>
                      </div>
                      {isSelected && (
                        <Check className="h-4 w-4 text-blue-600" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </div>

      {error && (
        <p className="mt-2 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}